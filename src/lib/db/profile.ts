import { prisma } from "@/lib/prisma";
import { SYSTEM_TYPE_ORDER } from "@/lib/db/items";

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
