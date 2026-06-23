import { prisma } from "@/lib/prisma";
import { SYSTEM_TYPE_ORDER } from "@/lib/db/items";
import { ACCOUNT_DELETE_FILE_BATCH } from "@/lib/db/limits";

export interface ProfileItemTypeStat {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  count: number;
}

export interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  hasPassword: boolean;
  createdAt: Date;
  totalItems: number;
  totalCollections: number;
  itemsByType: ProfileItemTypeStat[];
}

export async function getProfileData(userId: string): Promise<ProfileData> {
  const [user, itemTypes, totalCollections] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        password: true,
        createdAt: true,
      },
    }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: {
        _count: { select: { items: { where: { userId } } } },
      },
    }),
    prisma.collection.count({ where: { userId } }),
  ]);

  const itemsByType = itemTypes
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      icon: t.icon,
      color: t.color,
      count: t._count.items,
    }))
    .sort(
      (a, b) =>
        SYSTEM_TYPE_ORDER.indexOf(a.slug) - SYSTEM_TYPE_ORDER.indexOf(b.slug),
    );

  const totalItems = itemsByType.reduce((sum, t) => sum + t.count, 0);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    hasPassword: user.password !== null,
    createdAt: user.createdAt,
    totalItems,
    totalCollections,
    itemsByType,
  };
}

export async function getUserPasswordHash(
  userId: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  });
  return user?.password ?? null;
}

export async function updateUserPassword(
  userId: string,
  hash: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { password: hash },
  });
}

export async function getUserFileUrls(userId: string): Promise<string[]> {
  const urls: string[] = [];
  let cursor: string | undefined;

  // Page through in bounded batches so no single query pulls unbounded rows,
  // while still collecting every file so R2 cleanup leaves nothing orphaned.
  for (;;) {
    const batch = await prisma.item.findMany({
      where: { userId, fileUrl: { not: null } },
      select: { id: true, fileUrl: true },
      orderBy: { id: "asc" },
      take: ACCOUNT_DELETE_FILE_BATCH,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    for (const item of batch) {
      if (item.fileUrl !== null) urls.push(item.fileUrl);
    }

    if (batch.length < ACCOUNT_DELETE_FILE_BATCH) break;
    cursor = batch[batch.length - 1]!.id;
  }

  return urls;
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({ where: { id: userId } });
}
