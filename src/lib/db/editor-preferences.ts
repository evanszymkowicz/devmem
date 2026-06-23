import { prisma } from "@/lib/prisma";
import {
  resolveEditorPreferences,
  type EditorPreferences,
} from "@/lib/editor-preferences";

// Reads the user's stored editor preferences, resolving null/partial/stale JSON
// into a complete, valid preferences object.
export async function getEditorPreferences(
  userId: string,
): Promise<EditorPreferences> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { editorPreferences: true },
  });

  return resolveEditorPreferences(user?.editorPreferences);
}
