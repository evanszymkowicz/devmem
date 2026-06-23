# Editor Preferences

## What Was Built

A user-configurable editor preferences section on the Settings page that auto-saves to the database (no save button) and applies live to every Monaco code editor in the app. Five preferences: font size, tab size, word wrap, minimap, and theme (with two custom themes registered for Monaco). State flows settings → server action → `editorPreferences` JSON column → `getEditorPreferences` → `EditorPreferencesProvider` → `CodeEditor`.

### New Files

- `prisma/migrations/20260623211218_add_editor_preferences/migration.sql` — `ALTER TABLE "users" ADD COLUMN "editorPreferences" JSONB;` (created via `prisma migrate dev`, never `db push`).
- `src/lib/editor-preferences.ts` — shared (client + server safe) source of truth: `EditorPreferences` type, option constants (`FONT_SIZE_OPTIONS`, `TAB_SIZE_OPTIONS`, `EDITOR_THEMES`, `EDITOR_THEME_LABELS`), `DEFAULT_EDITOR_PREFERENCES` (font 12, tab 2, wrap on, minimap off, theme `vs-dark`), and `resolveEditorPreferences(raw)` — tolerantly coerces null/partial/stale JSON into a complete valid object, field by field.
- `src/lib/validations/editor-preferences.ts` — Zod `editorPreferencesSchema` constrained to the allowed option sets; the action validates against it.
- `src/lib/monaco-themes.ts` — defines and registers the non-builtin `monokai` and `github-dark` themes (Monaco ships only `vs`/`vs-dark`/`hc-black`). `registerMonacoThemes(monaco)` runs once per page load in the editor's `beforeMount`.
- `src/lib/db/editor-preferences.ts` — `getEditorPreferences(userId)`: single-row `findUnique` selecting only `editorPreferences`, resolved through `resolveEditorPreferences`.
- `src/actions/editor-preferences.ts` — `updateEditorPreferences(input)` Server Action: reads session, scopes the update to `session.user.id`, Zod-validates, writes a single atomic `user.update`, returns `{ success, error }`.
- `src/components/editor/EditorPreferencesProvider.tsx` — `EditorPreferencesProvider` + `useEditorPreferences()`. Holds current prefs in state (seeded from server), exposes `updatePreferences(partial)` which optimistically updates, persists via the action, toasts on success, and rolls back on failure. Uses a ref mirror so the stable callback reads current state without a stale closure and keeps side effects out of the setState updater.
- `src/components/settings/EditorPreferencesForm.tsx` — the Settings UI: font/tab/theme dropdowns + word-wrap/minimap switches, each calling `updatePreferences` on change (auto-save).
- `src/components/ui/select.tsx`, `src/components/ui/switch.tsx` — new Radix-based shadcn primitives (the project had neither).
- `src/lib/editor-preferences.test.ts`, `src/actions/editor-preferences.test.ts` — 11 unit tests (resolve coercion + action auth/validation/persistence/error paths).

### Modified Files

- `prisma/schema.prisma` — added `editorPreferences Json?` to `User`.
- `src/components/ui/code-editor.tsx` — consumes `useEditorPreferences`; applies `fontSize`/`wordWrap`/`minimap`/`theme` via the editor `options`/`theme` props, registers custom themes in `beforeMount`, and applies `tabSize` through the model (`getModel().updateOptions`) on mount and whenever it changes. Removed the hardcoded `fontSize: 12` / `lineHeight: 18` / `minimap: false` / `wordWrap: "on"` literals.
- `src/components/dashboard/DashboardShell.tsx` — new required `editorPreferences` prop; wraps its subtree in `EditorPreferencesProvider` so all editors (drawers, dialogs) see current prefs.
- `src/app/{dashboard,collections,collections/[id],items/[type],profile,settings}/page.tsx` — each fetches `getEditorPreferences(userId)` (added to the existing `Promise.all`) and passes it to `DashboardShell`. The dashboard's nullable-session branch falls back to `DEFAULT_EDITOR_PREFERENCES`. Settings page also renders the new "Editor preferences" card above Change Password.

## Design Decisions

- **Single JSON column, not five columns** — matches the spec and keeps the schema change to one nullable `Json` field; `resolveEditorPreferences` defends against partial/legacy shapes so reads never break.
- **Auto-save, last-write-wins** — the action always writes the full validated object (the context holds full state), so it's a single atomic `update` with no read-modify-write/TOCTOU.
- **Optimistic + rollback in context** — open editors reflect changes instantly; a failed save reverts and toasts. Side effects deliberately kept out of the `setState` updater (React Strict Mode double-invokes it) by using a ref mirror for current/rollback values.
- **Custom themes registered in `beforeMount`** — `monokai`/`github-dark` aren't built into Monaco; defining them before mount means the `theme` prop resolves on first render.
- **`tabSize` via the model** — it's a text-model option, not an editor option, so it's set through `getModel().updateOptions` rather than the `options` prop.
- **Per-page fetch** — preferences are fetched in each page's existing `Promise.all` (mirroring how sidebar data is already resolved per page) and passed down once; centralized in `getEditorPreferences` to stay DRY.

## Verification

- `npx prisma migrate dev` applied cleanly; `migrate status` in sync. (Gotcha: had to `npx prisma generate` + restart the dev server before the new field was usable — the running Turbopack server cached the old client.)
- 11 new unit tests pass; full suite **113 passed**; `npm run build` clean (TypeScript OK, 19 routes).
- Browser-tested as the seeded Demo User: settings card renders at correct defaults; toggling Minimap auto-saves and survives a reload (DB persistence); setting theme to Monokai and opening a snippet renders the editor in Monokai end-to-end; no console errors. Reset the demo account's theme to VS Dark afterward. Screenshots/notes in `.playwright-mcp/Editor Preferences/`.

## Deferred

None.
