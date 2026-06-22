"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function toggleCollectionFavorite(collectionId: string) {
  const session = await auth();
  if (!session?.user?.id) return;

  // Prisma has no atomic toggle, so we read the current value first to invert it.
  // Both queries scope to userId to prevent IDOR.
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId, userId: session.user.id },
    select: { isFavorite: true },
  });

  if (!collection) return;

  await prisma.collection.update({
    where: { id: collectionId, userId: session.user.id },
    data: { isFavorite: !collection.isFavorite },
  });

  revalidatePath("/dashboard");
}
