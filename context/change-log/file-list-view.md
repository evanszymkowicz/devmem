# File List View

## What Changed

Replaced the card grid on `/items/files` with a single-column list layout (Google Drive / Dropbox style).

### New file: `src/components/items/FileListRow.tsx`

Client component that renders one row per file item. Each row shows:

- **File icon** — mapped by extension (`.md/.txt/.csv/.pdf` → `FileText`, `.json/.yaml/.xml/.toml/.ini` → `FileCode`, everything else → `File`)
- **File name** — `item.fileName` with `item.title` as fallback
- **File size** — formatted via the existing `formatFileSize` helper from `src/lib/files.ts`
- **Upload date** — `item.createdAt` in "Jun 19, 2026" format
- **Download button** — fades in on group hover; links to `/api/download/[id]` with `download` attribute; `e.stopPropagation()` prevents the row click from opening the drawer
- Row click opens `ItemDrawer` via `useItemDrawer`

### Updated: `src/app/items/[type]/page.tsx`

Added a branch on `typeSlug === "files"`: renders `FileListRow` list for the files page, keeps the existing card grid for all other types.

## Files Changed

- `src/components/items/FileListRow.tsx` — new
- `src/app/items/[type]/page.tsx` — conditional layout branch

## Testing

- 90/90 unit tests passing; build clean
- Playwright browser-verified: list layout renders, hover shows download button, row click opens `ItemDrawer`, drawer shows correct file details
