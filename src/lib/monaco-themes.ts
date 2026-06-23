import type { Monaco } from "@monaco-editor/react";

// Monaco ships only with "vs", "vs-dark", and "hc-black". The other themes the
// user can choose must be registered with the Monaco instance before they can be
// applied via the editor's `theme` prop.
interface CustomThemeDefinition {
  name: string;
  data: Parameters<Monaco["editor"]["defineTheme"]>[1];
}

const MONOKAI: CustomThemeDefinition = {
  name: "monokai",
  data: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "f8f8f2", background: "272822" },
      { token: "comment", foreground: "75715e" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "keyword", foreground: "f92672" },
      { token: "type", foreground: "66d9ef", fontStyle: "italic" },
      { token: "function", foreground: "a6e22e" },
      { token: "variable", foreground: "f8f8f2" },
      { token: "constant", foreground: "ae81ff" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBackground": "#3e3d32",
      "editorLineNumber.foreground": "#90908a",
      "editorCursor.foreground": "#f8f8f0",
      "editor.selectionBackground": "#49483e",
    },
  },
};

const GITHUB_DARK: CustomThemeDefinition = {
  name: "github-dark",
  data: {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "", foreground: "e6edf3", background: "0d1117" },
      { token: "comment", foreground: "8b949e" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "type", foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
      { token: "variable", foreground: "ffa657" },
      { token: "constant", foreground: "79c0ff" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#e6edf3",
      "editor.lineHighlightBackground": "#161b22",
      "editorLineNumber.foreground": "#6e7681",
      "editorCursor.foreground": "#e6edf3",
      "editor.selectionBackground": "#264f78",
    },
  },
};

const CUSTOM_THEMES = [MONOKAI, GITHUB_DARK];

let registered = false;

// Registers all custom Monaco themes exactly once per page load. Built-in themes
// ("vs-dark") need no registration and are applied directly.
export function registerMonacoThemes(monaco: Monaco) {
  if (registered) return;
  for (const theme of CUSTOM_THEMES) {
    monaco.editor.defineTheme(theme.name, theme.data);
  }
  registered = true;
}
