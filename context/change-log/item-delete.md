# Item Delete

## What Changed

Added working delete functionality to the item drawer, with a shadcn `AlertDialog` confirmation and sonner toast feedback.

### Files Modified

- **`src/lib/db/items.ts`** — Added `deleteItem(userId, itemId)`: uses `deleteMany` with `WHERE id AND userId` for atomic ownership-safe deletion; returns `boolean` (false = not found).
- **`src/actions/items.ts`** — Added `deleteItem(itemId)` server action: reads session, asserts auth, scopes DB call to `session.user.id`, returns `ActionResult<null>`.
- **`src/components/items/ItemDrawer.tsx`** — Wired the existing Delete button to open an `AlertDialog` confirmation; added `confirmDelete` and `deleting` state; on confirm calls the server action, shows success toast, closes drawer, calls `router.refresh()` to sync the list; on error shows error toast and leaves drawer open.
- **`src/components/ui/alert-dialog.tsx`** — Installed via `npx shadcn@latest add alert-dialog`.

## Key Decisions

- `deleteMany` (not `delete`) used so a missing/unauthorized item returns `count: 0` instead of throwing — clean ownership check without a separate read.
- `AlertDialog` rendered as a sibling to `Sheet` (inside a React fragment) rather than nested inside `SheetContent` to avoid z-index stacking issues.
- `deleting` state disables both Cancel and the confirm button during the in-flight request; the dialog stays open until the action resolves.

## Tests

- 39/39 existing tests still passing; no new tests added (no pure logic to unit-test — the action is a thin auth + DB call).
- `npm run build` clean.
