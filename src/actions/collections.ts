"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/actions";
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
import { FREE_TIER_COLLECTION_LIMIT } from "@/lib/db/limits";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function toggleCollectionFavorite(collectionId: string) {
  const gate = await requireUserId();
  if (!gate.ok) return;

  // Prisma has no atomic toggle, so we read the current value first to invert it.
  // Both queries scope to userId to prevent IDOR.
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId, userId: gate.userId },
    select: { isFavorite: true },
  });

  if (!collection) return;

  await prisma.collection.update({
    where: { id: collectionId, userId: gate.userId },
    data: { isFavorite: !collection.isFavorite },
  });

  revalidatePath("/dashboard");
  revalidatePath("/collections");
}

export async function createCollection(
  raw: unknown,
): Promise<ActionResult<{ id: string }>> {
  const gate = await requireUserId();
  if (!gate.ok) return { success: false, error: gate.error };

  const parsed = createCollectionSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  try {
    const created = await dbCreateCollection(gate.userId, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/collections");
    return { success: true, data: { id: created.id } };
  } catch (err) {
    if (err instanceof Error && err.message === "FREE_TIER_LIMIT_REACHED") {
      return {
        success: false,
        error: `You've reached the ${FREE_TIER_COLLECTION_LIMIT}-collection limit on the free plan. Upgrade to Pro for unlimited collections.`,
      };
    }
    return { success: false, error: "Failed to create collection" };
  }
}

export async function updateCollection(
  collectionId: string,
  raw: unknown,
): Promise<ActionResult<null>> {
  const gate = await requireUserId();
  if (!gate.ok) return { success: false, error: gate.error };

  const parsed = updateCollectionSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  try {
    const ok = await dbUpdateCollection(gate.userId, collectionId, parsed.data);
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
  const gate = await requireUserId();
  if (!gate.ok) return { success: false, error: gate.error };

  try {
    const ok = await dbDeleteCollection(gate.userId, collectionId);
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
