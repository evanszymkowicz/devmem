import { ContentType, Prisma, type ItemType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { CreateItemInput } from "@/lib/validations/items";

const itemWithTypeInclude = {
  itemType: true,
  tags: true,
} satisfies Prisma.ItemInclude;

export type ItemWithType = Prisma.ItemGetPayload<{
  include: typeof itemWithTypeInclude;
}>;

const itemDetailInclude = {
  itemType: true,
  tags: true,
  collections: {
    include: {
      collection: {
        select: { id: true, name: true },
      },
    },
  },
} satisfies Prisma.ItemInclude;

export type ItemDetail = Prisma.ItemGetPayload<{
  include: typeof itemDetailInclude;
}>;

export interface SidebarItemType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  count: number;
}

const MAX_PINNED_DISPLAY = 20;
const MAX_ITEMS_BY_TYPE = 200;

export async function getPinnedItems(userId: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    take: MAX_PINNED_DISPLAY,
    include: itemWithTypeInclude,
  });
}

export async function getRecentItems(
  userId: string,
  limit = 10,
): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: itemWithTypeInclude,
  });
}

export async function getItemDetail(
  userId: string,
  itemId: string,
): Promise<ItemDetail | null> {
  return prisma.item.findFirst({
    where: { id: itemId, userId },
    include: itemDetailInclude,
  });
}

export interface UpdateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags: string[];
  collectionIds?: string[];
}

// Filters a requested set of collection ids down to those the user actually
// owns, so an item can never be attached to someone else's collection (IDOR).
async function ownedCollectionIds(
  tx: Prisma.TransactionClient,
  userId: string,
  collectionIds: string[],
): Promise<string[]> {
  if (collectionIds.length === 0) return [];
  const rows = await tx.collection.findMany({
    where: { id: { in: collectionIds }, userId },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemData,
): Promise<ItemDetail | null> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.item.findFirst({ where: { id: itemId, userId } });
    if (!existing) return null;

    const tagRecords = await Promise.all(
      data.tags.map((name) =>
        tx.tag.upsert({ where: { name }, create: { name }, update: {} }),
      ),
    );

    // Replace collection membership atomically when the caller sends a set.
    // Undefined means "leave membership untouched".
    if (data.collectionIds !== undefined) {
      const ownedIds = await ownedCollectionIds(tx, userId, data.collectionIds);
      await tx.itemCollection.deleteMany({ where: { itemId } });
      if (ownedIds.length > 0) {
        await tx.itemCollection.createMany({
          data: ownedIds.map((collectionId) => ({ itemId, collectionId })),
        });
      }
    }

    return tx.item.update({
      where: { id: itemId },
      data: {
        title: data.title,
        description: data.description ?? null,
        content: data.content ?? null,
        url: data.url ?? null,
        language: data.language ?? null,
        tags: { set: tagRecords.map((t) => ({ id: t.id })) },
      },
      include: itemDetailInclude,
    });
  });
}

const SLUG_TO_CONTENT_TYPE: Record<string, ContentType> = {
  snippets: ContentType.TEXT,
  prompts: ContentType.TEXT,
  commands: ContentType.TEXT,
  notes: ContentType.TEXT,
  links: ContentType.URL,
  files: ContentType.FILE,
  images: ContentType.FILE,
};

export async function createItem(
  userId: string,
  data: CreateItemInput,
): Promise<ItemDetail | null> {
  const type = await prisma.itemType.findFirst({
    where: {
      slug: data.typeSlug,
      OR: [{ userId: null }, { userId }],
    },
  });
  if (!type) return null;

  return prisma.$transaction(async (tx) => {
    const tagRecords = await Promise.all(
      data.tags.map((name) =>
        tx.tag.upsert({ where: { name }, create: { name }, update: {} }),
      ),
    );

    const ownedIds = await ownedCollectionIds(tx, userId, data.collectionIds ?? []);

    return tx.item.create({
      data: {
        userId,
        itemTypeId: type.id,
        contentType: SLUG_TO_CONTENT_TYPE[data.typeSlug] ?? ContentType.TEXT,
        title: data.title,
        description: data.description ?? null,
        content: data.content ?? null,
        language: data.language ?? null,
        url: data.url ?? null,
        fileUrl: data.fileUrl ?? null,
        fileName: data.fileName ?? null,
        fileSize: data.fileSize ?? null,
        tags: { connect: tagRecords.map((t) => ({ id: t.id })) },
        collections: {
          create: ownedIds.map((collectionId) => ({ collectionId })),
        },
      },
      include: itemDetailInclude,
    });
  });
}

export async function getItemFileUrl(
  userId: string,
  itemId: string,
): Promise<string | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { fileUrl: true },
  });
  return item?.fileUrl ?? null;
}

export async function deleteItem(
  userId: string,
  itemId: string,
): Promise<boolean> {
  const deleted = await prisma.item.deleteMany({
    where: { id: itemId, userId },
  });
  return deleted.count > 0;
}

export async function getItemsByType(
  userId: string,
  typeSlug: string,
): Promise<{ type: ItemType; items: ItemWithType[] } | null> {
  const type = await prisma.itemType.findFirst({
    where: {
      slug: typeSlug,
      OR: [{ userId: null }, { userId }],
    },
  });

  if (!type) return null;

  const items = await prisma.item.findMany({
    where: { userId, itemTypeId: type.id },
    orderBy: { updatedAt: "desc" },
    take: MAX_ITEMS_BY_TYPE,
    include: itemWithTypeInclude,
  });

  return { type, items };
}

// DB returns rows in undefined order; this enforces the canonical UX order
// (alphabetical would put Commands first, which doesn't match the design spec).
export const SYSTEM_TYPE_ORDER = ["snippets", "prompts", "commands", "notes", "files", "images", "links"];

export async function getSystemItemTypes(
  userId: string,
): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: {
      _count: { select: { items: { where: { userId } } } },
    },
  });

  const mapped = types.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    icon: t.icon,
    color: t.color,
    count: t._count.items,
  }));

  return mapped.sort(
    (a, b) => SYSTEM_TYPE_ORDER.indexOf(a.slug) - SYSTEM_TYPE_ORDER.indexOf(b.slug),
  );
}
