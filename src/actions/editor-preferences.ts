"use server";

import { requireUserId } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { editorPreferencesSchema } from "@/lib/validations/editor-preferences";
import type { EditorPreferences } from "@/lib/editor-preferences";

export async function updateEditorPreferences(
  input: EditorPreferences,
): Promise<{ success: boolean; error?: string }> {
  const gate = await requireUserId();
  if (!gate.ok) return { success: false, error: gate.error };

  const parsed = editorPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid preferences",
    };
  }

  try {
    await prisma.user.update({
      where: { id: gate.userId },
      data: { editorPreferences: parsed.data },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save preferences" };
  }
}
