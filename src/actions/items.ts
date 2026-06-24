"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  createItem as dbCreateItem,
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
  getItemFileUrl,
} from "@/lib/db/items";
import { deleteFromR2 } from "@/lib/r2";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";
import type { ItemDetail } from "@/lib/db/items";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function toggleItemFavorite(
  itemId: string,
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Prisma has no atomic boolean toggle, so read the current value first.
    // Both queries scope to userId to prevent IDOR.
    const item = await prisma.item.findUnique({
      where: { id: itemId, userId: session.user.id },
      select: { isFavorite: true },
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    const updated = await prisma.item.update({
      where: { id: itemId, userId: session.user.id },
      data: { isFavorite: !item.isFavorite },
      select: { isFavorite: true },
    });

    revalidatePath("/dashboard");
    revalidatePath("/favorites");

    return { success: true, data: { isFavorite: updated.isFavorite } };
  } catch {
    return { success: false, error: "Failed to update favorite" };
  }
}

export async function createItem(
  raw: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = createItemSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  if (parsed.data.fileUrl && !parsed.data.fileUrl.startsWith(`users/${session.user.id}/`)) {
    return { success: false, error: "Invalid file reference" };
  }

  try {
    const created = await dbCreateItem(session.user.id, parsed.data);
    if (!created) {
      return { success: false, error: "Item type not found" };
    }
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Failed to create item" };
  }
}

export async function updateItem(
  itemId: string,
  raw: unknown,
): Promise<ActionResult<ItemDetail>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = updateItemSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return { success: false, error: message };
  }

  try {
    const updated = await dbUpdateItem(session.user.id, itemId, parsed.data);
    if (!updated) {
      return { success: false, error: "Item not found" };
    }
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to save changes" };
  }
}

export async function deleteItem(
  itemId: string,
): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const fileUrl = await getItemFileUrl(session.user.id, itemId);

    const deleted = await dbDeleteItem(session.user.id, itemId);
    if (!deleted) {
      return { success: false, error: "Item not found" };
    }

    if (fileUrl) {
      await deleteFromR2(fileUrl).catch((e) =>
        console.error("R2 cleanup failed for key", fileUrl, e),
      );
    }

    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to delete item" };
  }
}
