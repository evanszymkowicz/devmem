"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { editorPreferencesSchema } from "@/lib/validations/editor-preferences";
import type { EditorPreferences } from "@/lib/editor-preferences";

export async function updateEditorPreferences(
  input: EditorPreferences,
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const parsed = editorPreferencesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid preferences",
    };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { editorPreferences: parsed.data },
    });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save preferences" };
  }
}
