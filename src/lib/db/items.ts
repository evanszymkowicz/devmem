import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const itemWithTypeInclude = {
  itemType: true,
  tags: true,
} satisfies Prisma.ItemInclude;

export type ItemWithType = Prisma.ItemGetPayload<{
  include: typeof itemWithTypeInclude;
}>;

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
