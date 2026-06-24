# Pinned Items

## What Was Built

Made the existing (non-functional) Pin button in the `ItemDrawer` work. Pinning an item now persists, surfaces a static pin indicator on item rows/cards, sorts pinned items to the top of type listings, and keeps them in the dashboard's Pinned section. The button uses optimistic UI for instant feedback and shows a success/error toast — mirroring the existing Favorite pattern, items only (collections unaffected).

### New Files

- _None._

### Modified Files

- `src/actions/items.ts` — added the `toggleItemPin(itemId)` server action. Reads the session and scopes both the read (`findUnique`) and write (`update`) to `userId: session.user.id` (no client-trusted id; IDOR-safe). Reads the current `isPinned` then inverts it (Prisma has no atomic toggle), mirroring `toggleCollectionFavorite`. Returns the `{ success, data: { isPinned }, error }` `ActionResult` shape so the drawer can toast and sync state. Revalidates `/dashboard` and `/items` (`"layout"`). Added imports for `revalidatePath` (`next/cache`) and `prisma`.
- `src/components/items/ItemDrawer.tsx` — wired the Pin button: added a `pinning` state and a `handlePin` handler that optimistically flips `item.isPinned` (functional `setItem`), calls `toggleItemPin`, reverts on failure, toasts `Item pinned` / `Item unpinned` on success and the error message on failure, then `router.refresh()` to re-sort listings. Button gained `onClick`, a `disabled={!item || pinning}` guard, and a dynamic `aria-label` (`Pin` / `Unpin`).
- `src/lib/db/items.ts` — `getItemsByType` now orders `[{ isPinned: "desc" }, { updatedAt: "desc" }]` so pinned items sort to the top of every type listing (the `take` bound is unchanged). The files listing shares this query and inherits the ordering.
- `src/actions/items.test.ts` — added a `toggleItemPin` suite (6 tests): unauthorized, item-not-found/not-owned, user-scoped lookup (IDOR), pin happy path, unpin happy path, and DB-throws error. Extended the prisma mock with `item.findUnique` and added a `next/cache` (`revalidatePath`) mock.

## Design Decisions

- **Mirrored the Favorite pattern, extended with optimistic UI + toast** — `toggleItemPin` follows `toggleCollectionFavorite`'s read-then-invert, user-scoped structure. The spec asked for instant feedback, so the drawer flips local state immediately and reverts on error rather than waiting on a round-trip (the collection favorite path used a plain `router.refresh()`).
- **Pin-to-top via `orderBy` only** — sorting belongs in the single bounded listing query (`getItemsByType`); no new query or component. `getRecentItems` was left alone since "recent" is a distinct semantic from "pinned".
- **`ItemCard` / `ItemRow` pin icon stays a static indicator** — per spec, the only interactive pin control is the drawer button; the row/card pin glyph is display-only and was left untouched.
- **Dashboard Pinned section unchanged** — it already reads `getPinnedItems` (filters `isPinned`); `revalidatePath("/dashboard")` keeps it in sync after a toggle.

## Verification

- 6 new unit tests pass; full suite **125 passed** (10 files); `npm run build` clean.
- Browser-tested as the seeded Demo User on `/items/snippets`: the pre-existing pinned "test" snippet already sorted to the top (confirms ordering); opened an unpinned item → **Pin** flipped the button to **Unpin** instantly (optimistic), and after closing the row showed the static Pinned indicator and re-sorted to the top with the state persisted; re-opening the drawer loaded the persisted **Unpin** state; **Unpin** reverted it and the demo data was restored to its original state.
- Screenshot/notes in `.playwright-mcp/Pinned Items/`.

## Deferred

- _None._
