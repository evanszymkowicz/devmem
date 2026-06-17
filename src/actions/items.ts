"use server";

import { auth } from "@/auth";
import {
  createItem as dbCreateItem,
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
} from "@/lib/db/items";
import { createItemSchema, updateItemSchema } from "@/lib/validations/items";
import type { ItemDetail } from "@/lib/db/items";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

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
    const deleted = await dbDeleteItem(session.user.id, itemId);
    if (!deleted) {
      return { success: false, error: "Item not found" };
    }
    return { success: true, data: null };
  } catch {
    return { success: false, error: "Failed to delete item" };
  }
}
