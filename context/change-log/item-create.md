# Item Create

## What Changed

Added a "New Item" modal dialog that lets users create any of the five free-tier item types (snippet, prompt, command, note, link) from the top bar "New Item" button on any page that uses `DashboardShell`.

### Files Added

- **`src/components/ui/dialog.tsx`** — shadcn `Dialog` component installed via CLI.
- **`src/components/items/NewItemDialog.tsx`** — The create form. Renders a type selector row that drives conditional field visibility (`content` + `language` for snippet/command, `content` for prompt/note, `url` for link). Tags use the same comma-separated input pattern as the edit drawer. On submit calls the `createItem` action; on success shows a toast, closes itself, and calls `router.refresh()`.

### Files Modified

- **`src/lib/validations/items.ts`** — Added `createItemSchema` (base fields + `superRefine` requiring URL for link type), `CREATABLE_TYPE_SLUGS` constant, and `CreatableTypeSlug` type.
- **`src/lib/db/items.ts`** — Added `createItem(userId, data)`: resolves the item type by slug, upserts tags, creates the item in a `$transaction`. A `SLUG_TO_CONTENT_TYPE` map converts slug to the `ContentType` enum (`TEXT` vs `URL`).
- **`src/actions/items.ts`** — Added `createItem(raw)` server action: reads session, scopes to `session.user.id`, validates with `createItemSchema`, delegates to `dbCreateItem`.
- **`src/components/dashboard/DashboardShell.tsx`** — Added `newItemOpen` state; renders `<NewItemDialog>` at the shell level (outside the content column); passes `onNewItem` callback to `TopBar` and the existing `itemTypes` prop to the dialog.
- **`src/components/dashboard/TopBar.tsx`** — Added `onNewItem: () => void` prop; "New Item" button now calls it.

### Test Files Modified

- **`src/lib/validations/items.test.ts`** — 10 new tests for `createItemSchema` covering valid payloads for each type category, invalid typeSlug values, empty/whitespace title rejection, URL required for links (path-scoped error), and tag defaulting.
- **`src/actions/items.test.ts`** — 8 new tests for the `createItem` server action covering auth guard, validation error propagation, item-type-not-found, happy path, correct userId forwarding, and DB error handling.

## Key Decisions

- Dialog state lives in `DashboardShell` (not a context) because the trigger is a single button in `TopBar`. This keeps the pattern simple — no context needed when there's only one call site.
- `itemTypes` prop already available in `DashboardShell` (loaded for the sidebar) is reused for the type selector — no extra DB round-trip.
- The dialog filters `itemTypes` to `CREATABLE_TYPE_SLUGS` at render time, excluding File and Image (Pro-only types) without needing a separate query.
- Form state resets to `EMPTY_FORM` on type switch and on close, so reopening always starts fresh.

## Tests

- 57/57 tests passing; `npm run build` clean.
