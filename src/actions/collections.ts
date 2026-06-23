"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
} from "@/lib/db/collections";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "@/lib/validations/collections";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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
  revalidatePath("/collections");
}

export async function createCollection(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createCollectionSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  try {
    const created = await dbCreateCollection(session.user.id, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/collections");
    return { success: true, data: { id: created.id } };
  } catch {
    return { success: false, error: "Failed to create collection" };
  }
}

export async function updateCollection(
  collectionId: string,
  raw: unknown,
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateCollectionSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  try {
    const ok = await dbUpdateCollection(session.user.id, collectionId, parsed.data);
    if (!ok) {
      return { success: false, error: "Collection not found" };
    }
    revalidatePath("/dashboard");
    revalidatePath("/collections");
    revalidatePath(`/collections/${collectionId}`);
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to save changes" };
  }
}

export async function deleteCollection(
  collectionId: string,
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const ok = await dbDeleteCollection(session.user.id, collectionId);
    if (!ok) {
      return { success: false, error: "Collection not found" };
    }
    revalidatePath("/dashboard");
    revalidatePath("/collections");
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to delete collection" };
  }
}
