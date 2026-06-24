# Favorite Toggle Buttons

## What Was Built

Interactive favorite (star) toggles for **items** across the drawer, item cards, and item rows. Collection favoriting already existed (cards, dropdown, detail page) and was left untouched — this feature completes the equivalent controls for items, which previously only displayed a static star without any way to toggle it.

### New Files

- `src/components/items/use-item-favorite.ts` — `useItemFavorite(itemId, initial)` client hook: optimistic flip for instant feedback, reverts + toasts on failure, and calls `router.refresh()` on success so server-rendered lists (sidebar Favorites, dashboard stats, `/favorites`) stay in sync
- `src/components/items/ItemFavoriteButton.tsx` — shared presentational star button wrapping the hook; `stopPropagation` so a click doesn't open the parent's drawer, `type="button"`, visible when favorited / hover-revealed otherwise. Single source of truth used by both `ItemCard` and `ItemRow`

### Modified Files

- `src/actions/items.ts` — new `toggleItemFavorite(itemId)` Server Action: reads the session, scopes **both** the `findUnique` (read current value) and the `update` to `userId` to prevent IDOR, flips `isFavorite`, `revalidatePath`s `/dashboard` + `/favorites`, and returns the new value as `ActionResult<{ isFavorite: boolean }>`
- `src/components/items/ItemDrawer.tsx` — wired the previously no-op Favorite button to `handleToggleFavorite`: optimistic update of the drawer's local `item` state, revert + toast on failure, `router.refresh()` on success; added a `favoriting` in-flight flag
- `src/components/items/ItemCard.tsx` — replaced the static favorite star indicator with `<ItemFavoriteButton>` in the card action row
- `src/components/dashboard/ItemRow.tsx` — same swap; added `group` to the card so the button can hover-reveal
- `src/actions/items.test.ts` — 6 new unit tests for `toggleItemFavorite` (unauthorized, item-not-found, false→true, true→false, IDOR scoping to `userId`, DB-error); extended the prisma mock with `findUnique` and mocked `next/cache`

## Design Decisions

- **Shared hook + shared button component** — the toggle logic lives once in `useItemFavorite`, and the markup lives once in `ItemFavoriteButton`, so cards and rows have no duplicated logic or JSX (DRY). The drawer handles its toggle inline because it manages the whole `ItemDetail` object in state rather than a single boolean
- **Optimistic UI** — every surface flips state immediately and reverts on failure, matching the spec's "instant reflection" goal; `router.refresh()` reconciles server-rendered counts/lists afterward
- **IDOR-safe, no migration** — `isFavorite` already existed on `Item`; the action scopes both the read and the write to the session `userId`. Mirrors the existing `toggleCollectionFavorite` pattern
- **Read-then-write toggle** — Prisma has no atomic boolean NOT, so the action reads the current value before inverting it (same approach as `toggleCollectionFavorite`); TOCTOU is not a concern for a per-user favorite flag

## Testing

- `npm test` → 125 passing (6 new)
- `npm run build` → compiles successfully, TypeScript clean
- Browser-verified all three surfaces toggle, persist, and keep the dashboard "Favorite Items" stat in sync (7 → 8 → 9); card/row clicks favorite without opening the drawer. Screenshots in `.playwright-mcp/Favorite Toggle/`

## Deferred

- The item drawer's **Pin** button remains a no-op — out of scope for this favorites feature, left unchanged
- Pre-existing ESLint error in `ItemDrawer.tsx` (`setState` in the item-loading `useEffect`) — not introduced here, left untouched
