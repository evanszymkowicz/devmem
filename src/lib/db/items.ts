import { Prisma, type ItemType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const itemWithTypeInclude = {
  itemType: true,
  tags: true,
} satisfies Prisma.ItemInclude;

export type ItemWithType = Prisma.ItemGetPayload<{
  include: typeof itemWithTypeInclude;
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
