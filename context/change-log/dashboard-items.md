# Dashboard Items (Real Data)

## Summary

Replaced dummy item data on the dashboard with real data fetched from the Neon PostgreSQL database via Prisma. Both the Pinned Items and Recent Items sections now display live data.

## Changes

- **Created `src/lib/db/items.ts`**
  - `getPinnedItems(userId)`: fetches all pinned items ordered by `updatedAt` desc, includes `itemType` and `tags`
  - `getRecentItems(userId, limit?)`: fetches the 10 most recent items ordered by `updatedAt` desc, includes `itemType` and `tags`
  - `ItemWithType` type derived via `Prisma.ItemGetPayload` to match the exact query shape

- **Updated `src/components/dashboard/ItemRow.tsx`**
  - Accepts `ItemWithType` instead of the mock `Item` type
  - Icon and border color derived directly from `item.itemType` (no more `mockItemTypes` lookup)
  - Tags iterate over `{ id, name }` objects instead of plain strings

- **Converted `src/components/dashboard/PinnedItems.tsx`** to async server component
  - Fetches pinned items for `demo@devmemory.io` (pre-auth placeholder)
  - Returns `null` when there are no pinned items

- **Converted `src/components/dashboard/RecentItems.tsx`** to async server component
  - Fetches 10 most recent items for `demo@devmemory.io` (pre-auth placeholder)

## Verification

- `npm run build` passes with no TypeScript errors
