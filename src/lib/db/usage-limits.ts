import { prisma } from "@/lib/prisma";
import { FREE_TIER_ITEM_LIMIT, FREE_TIER_COLLECTION_LIMIT } from "@/lib/db/limits";

export type UsageSummary = {
  itemCount: number;
  collectionCount: number;
  canCreateItem: boolean;
  canCreateCollection: boolean;
};

export async function getUserUsage(userId: string, isPro: boolean): Promise<UsageSummary> {
  if (isPro) {
    return { itemCount: 0, collectionCount: 0, canCreateItem: true, canCreateCollection: true };
  }

  const [itemCount, collectionCount] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
  ]);

  return {
    itemCount,
    collectionCount,
    canCreateItem: itemCount < FREE_TIER_ITEM_LIMIT,
    canCreateCollection: collectionCount < FREE_TIER_COLLECTION_LIMIT,
  };
}

export function isItemLimitReached(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_TIER_ITEM_LIMIT;
}

export function isCollectionLimitReached(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_TIER_COLLECTION_LIMIT;
}
