"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function toggleCollectionFavorite(collectionId: string) {
  // Prisma has no atomic toggle, so we read the current value first to invert it.
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    select: { isFavorite: true },
  });

  if (!collection) return;

  await prisma.collection.update({
    where: { id: collectionId },
    data: { isFavorite: !collection.isFavorite },
  });

  revalidatePath("/dashboard");
}
