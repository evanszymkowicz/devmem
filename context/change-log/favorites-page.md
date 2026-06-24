# Favorites Page

## What Was Built

A `/favorites` page listing the signed-in user's favorited items and collections in a compact, dev-focused list (VS Code/terminal style, not cards), plus a star button in the TopBar that links to it. Items and collections are shown in separate counted sections, sorted most-recently-favorited first. Item rows open the existing `ItemDrawer`; collection rows navigate to `/collections/[id]`. Empty favorites render a single empty state.

### New Files

- `src/app/favorites/page.tsx` — protected server page (redirects to `/sign-in` when unauthenticated). Fetches sidebar data + favorites + editor preferences in one `Promise.all`, renders inside `DashboardShell`, and wraps the list in `ItemDrawerWrapper` so item rows can open the drawer. Header shows the total favorited count.
- `src/lib/db/favorites.ts` — `getFavorites(userId)`: runs two bounded, user-scoped queries (`isFavorite: true`, `orderBy: { updatedAt: "desc" }`, `take: FAVORITES_PER_SECTION`) for items and collections in parallel; maps each collection to its dominant-type color via the shared `dominantTypeColor` helper. Exposes `FavoriteCollection` / `Favorites` types.
- `src/components/favorites/FavoritesView.tsx` — `"use client"` compact list. Renders the shared empty state when both lists are empty; otherwise two `Section`s (Items / Collections) each with a count badge. `ItemFavoriteRow` uses `useItemDrawer().openDrawer(item.id)`; `CollectionFavoriteRow` is a `next/link` to `/collections/[id]`. Shared `RowContent` lays out icon · title · type badge · date; `font-mono`, high density, subtle hover, no cards.
- `src/lib/db/favorites.test.ts` — 6 unit tests (prisma mocked): `dominantTypeColor` happy path + empty fallback; `getFavorites` scoping/bounding/ordering, item passthrough, dominant-color mapping, and empty-collection fallback.

### Modified Files

- `src/components/dashboard/TopBar.tsx` — added a ghost `Star` icon button (`asChild` + `next/link`) linking to `/favorites`, in the right-hand action group.
- `src/lib/db/limits.ts` — added `FAVORITES_PER_SECTION = 100` (bounds each favorites section).
- `src/lib/db/collections.ts` — extracted `dominantTypeColor(types)` + `FALLBACK_TYPE_COLOR` and refactored `getSidebarCollections` to use them (de-duplicates the dominant-color count loop now shared with `getFavorites`).

## Design Decisions

- **Collections get a folder icon tinted by their dominant item-type color** — collections have no intrinsic type, so a `FolderOpen` icon (tinted) + a `"Collection"` badge keeps rows visually consistent with item rows.
- **`updatedAt` for both sort and the displayed date** — there's no separate "favorited at" timestamp; `updatedAt` is the proxy the spec calls for ("most recently favorited"), used for ordering and the row date.
- **Bounded queries** — each section caps at `FAVORITES_PER_SECTION` rather than fetching unbounded, per the project's query-limit rule.
- **Reused the established item-drawer pattern** — wrapping the list in `ItemDrawerWrapper` and using `useItemDrawer` matches how the items/dashboard lists already open the drawer (no new drawer plumbing).
- **Shared `dominantTypeColor`** — the dominant-color computation existed in `getSidebarCollections` and was about to be copied into `getFavorites`; extracted to one helper. Left `getCollectionsWithTypes` alone — it produces a full ordered type list, a genuinely different output.

## Verification

- 6 new unit tests pass; full suite **119 passed**; `npm run build` clean (`/favorites` registered as a dynamic route).
- Browser-tested as the seeded Demo User: TopBar star → `/favorites`; sections render with correct counts (Items 7 / Collections 2); rows show icon/title/badge/date in dense monospace; sort is newest-first; clicking an item opens the `ItemDrawer` (confirmed via DOM — the portaled/animated Sheet wasn't captured by an immediate screenshot, but `[role="dialog"][data-state="open"]` was present with full item content; existing item-list pages behave identically); clicking a collection navigates to `/collections/[id]`.
- **Empty state** verified by temporarily clearing the demo user's favorites in the dev DB (`UPDATE ... SET "isFavorite"=false`, scoped by `userId`) — showed "0 favorited entries" + centered star + message — then restored by exact ID (7 items + 2 collections back; counts reconfirmed in DB and UI).
- Screenshots/notes in `.playwright-mcp/Favorites Page/`.

## Deferred

- **Route protection** verified by code only (mirrors the existing `/collections` redirect-to-`/sign-in` pattern); not exercised logged-out in the browser.
