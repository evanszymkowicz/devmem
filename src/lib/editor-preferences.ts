// Shared editor preference constants, types, and defaults. Imported by both
// client UI (settings form, Monaco editor) and server code (validation, DB),
// so this file must stay free of server-only or client-only imports.

export const EDITOR_THEMES = ["vs-dark", "monokai", "github-dark"] as const;
export type EditorTheme = (typeof EDITOR_THEMES)[number];

export const FONT_SIZE_OPTIONS = [11, 12, 13, 14, 16, 18] as const;
export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;

export const EDITOR_THEME_LABELS: Record<EditorTheme, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  theme: EditorTheme;
}

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 12,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

// Tolerantly resolve an unknown value (e.g. the raw `editorPreferences` JSON
// column, which may be null, partial, or stale) into a complete, valid
// preferences object by falling back to defaults field by field.
export function resolveEditorPreferences(raw: unknown): EditorPreferences {
  if (!raw || typeof raw !== "object") return DEFAULT_EDITOR_PREFERENCES;

  const value = raw as Record<string, unknown>;
  const d = DEFAULT_EDITOR_PREFERENCES;

  return {
    fontSize:
      typeof value.fontSize === "number" &&
      (FONT_SIZE_OPTIONS as readonly number[]).includes(value.fontSize)
        ? value.fontSize
        : d.fontSize,
    tabSize:
      typeof value.tabSize === "number" &&
      (TAB_SIZE_OPTIONS as readonly number[]).includes(value.tabSize)
        ? value.tabSize
        : d.tabSize,
    wordWrap: typeof value.wordWrap === "boolean" ? value.wordWrap : d.wordWrap,
    minimap: typeof value.minimap === "boolean" ? value.minimap : d.minimap,
    theme: (EDITOR_THEMES as readonly string[]).includes(value.theme as string)
      ? (value.theme as EditorTheme)
      : d.theme,
  };
}
