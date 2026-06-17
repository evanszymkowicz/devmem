# Item Drawer

## What was done

Built a right-side slide-in drawer that opens when clicking any item card or row. The drawer fetches full item detail on click via a new API route and renders a structured detail view. Works on both the dashboard and the items list pages.

## Files added

- `src/app/api/items/[id]/route.ts` — `GET` handler; auth-checks the session, scopes the query to the user's items, returns JSON
- `src/components/items/ItemDrawerContext.tsx` — React context + `useItemDrawer()` hook (`activeItemId`, `openDrawer`, `closeDrawer`)
- `src/components/items/ItemDrawer.tsx` — the Sheet UI; fetches from `/api/items/[id]` when `activeItemId` changes; shows skeleton while loading; renders header (icon, title, type badge, language badge), action bar, description, content block, URL (for link types), tags, collections, and created/updated dates
- `src/components/items/ItemDrawerWrapper.tsx` — `"use client"` context provider that wraps children with the context + `<ItemDrawer />`

## Files changed

- `src/lib/db/items.ts` — added `itemDetailInclude` (includes `itemType`, `tags`, `collections → collection { id, name }`), `ItemDetail` type, and `getItemDetail(userId, itemId)` query
- `src/components/items/ItemCard.tsx` — added `"use client"`, `useItemDrawer()`, `cursor-pointer`, `onClick={() => openDrawer(item.id)}`
- `src/components/dashboard/ItemRow.tsx` — same as above
- `src/app/dashboard/page.tsx` — wrapped `<PinnedItems>` and `<RecentItems>` in `<ItemDrawerWrapper>`
- `src/app/items/[type]/page.tsx` — wrapped the items grid in `<ItemDrawerWrapper>`

## Architecture

Pages are server components that pass item data as props to `ItemCard`/`ItemRow`. Making those two components `"use client"` lets them consume the `ItemDrawerContext` while still receiving their data from server-side fetches — no data flows through the client boundary.

The `ItemDrawerWrapper` is the single client boundary per page: it owns the `activeItemId` state, provides it via context, and renders the `Sheet`. All item rows/cards in the subtree call `openDrawer(id)` through that context.

`ItemDetail` is fetched lazily on click (not pre-fetched) — aligns with the spec's "fetch on click" requirement and avoids loading content for items the user never opens.

## Deferred

- Action bar buttons (Favorite, Pin, Edit, Delete) are rendered but not wired to server actions — spec explicitly said the drawer details display is the scope; mutations come later
- Copy action is present and functional for content/URL items, but `navigator.clipboard` silently no-ops in headless test environments
- Syntax highlighting in the Content block — deferred per spec ("code editor and item-specific stuff will come later")
