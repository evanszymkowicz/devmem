import { Prisma } from "@/generated/prisma/client";
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

export async function getPinnedItems(userId: string): Promise<ItemWithType[]> {
  return prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
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

// DB returns rows in undefined order; this enforces the canonical UX order
// (alphabetical would put Commands first, which doesn't match the design spec).
const SYSTEM_TYPE_ORDER = ["snippets", "prompts", "commands", "notes", "files", "images", "links"];

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
