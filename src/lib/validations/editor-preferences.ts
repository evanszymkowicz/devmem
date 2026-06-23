import { z } from "zod";

import {
  EDITOR_THEMES,
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
} from "@/lib/editor-preferences";

// Validates the full preferences object sent from the client. The server action
// always writes a complete object (the context holds full state), so every
// field is required and constrained to the allowed option set.
export const editorPreferencesSchema = z.object({
  fontSize: z
    .number()
    .refine((v) => (FONT_SIZE_OPTIONS as readonly number[]).includes(v), {
      message: "Invalid font size",
    }),
  tabSize: z
    .number()
    .refine((v) => (TAB_SIZE_OPTIONS as readonly number[]).includes(v), {
      message: "Invalid tab size",
    }),
  wordWrap: z.boolean(),
  minimap: z.boolean(),
  theme: z.enum(EDITOR_THEMES),
});

export type EditorPreferencesInput = z.infer<typeof editorPreferencesSchema>;
