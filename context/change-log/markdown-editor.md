# Markdown Editor

## What Changed

Added a `MarkdownEditor` component for notes and prompts, replacing the plain `Textarea` in both `NewItemDialog` and `ItemDrawer` (view and edit modes). `CodeEditor` (Monaco) for snippets and commands is unchanged.

## New Files

- **`src/components/ui/markdown-editor.tsx`** — Write/Preview tabbed editor using `react-markdown` + `remark-gfm`. Matches `CodeEditor` visual style: macOS dots, `bg-[#2d2d2d]` header, `bg-[#1e1e1e]` content area, "Markdown" label, copy button with ✓ feedback. Fluid height (80px min / 400px max). Readonly mode hides the Write tab and shows Preview only; edit mode defaults to Write with Preview available. `useEffect` resets to the correct tab when `readOnly` changes.

## Modified Files

- **`src/components/items/ItemDrawer.tsx`** — View mode: `<pre><code>` block replaced with `<MarkdownEditor readOnly />` for notes/prompts. Edit mode: `Textarea` for non-language content replaced with `<MarkdownEditor onChange={...} />`.
- **`src/components/items/NewItemDialog.tsx`** — Notes/prompts content `Textarea` replaced with `<MarkdownEditor onChange={...} />`.

## Dependencies Added

- `react-markdown@^9` — renders markdown as React elements
- `remark-gfm` — adds GitHub Flavored Markdown (tables, strikethrough, task lists, etc.)

## Styling

Markdown preview uses Tailwind Typography's `prose prose-invert prose-sm max-w-none` classes. One override required: `prose-code:before:content-none prose-code:after:content-none` to suppress the backtick pseudo-elements the typography plugin adds to inline `<code>` elements by default.

## Verified

Browser-tested via Playwright: existing prompt items render formatted markdown in view mode (bullet lists, inline code, paragraphs); Write/Preview tabs toggle correctly in edit mode; `NewItemDialog` shows the editor for prompts and notes with live preview. 57/57 tests passing; `npm run build` clean.
