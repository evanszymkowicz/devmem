# Items List View

Dynamic `/items/[type]` route that displays a user's items filtered by type slug.

## What Changed

### `src/lib/db/items.ts`
- Added `getItemsByType(userId, typeSlug)` — looks up an `ItemType` by slug (system types have `userId: null`, custom types matched by `userId`); fetches up to 200 items for that type ordered by `updatedAt` desc; returns `{ type, items }` or `null` if the type slug doesn't exist
- Added `MAX_ITEMS_BY_TYPE = 200` constant (bounded query)
- Imported `ItemType` from generated Prisma client for the return type

### `src/components/items/ItemCard.tsx` (new)
- Card component for displaying an item in a grid
- Left border (`border-l-4`) colored by `item.itemType.color`
- Icon badge with tinted background in the type color
- Shows title, pinned/favorite indicators, description (2-line clamp), tags, and relative date
- No `"use client"` — pure server component

### `src/app/items/[type]/page.tsx` (new)
- SSR dynamic route; `params` awaited per Next.js 16 convention
- Fetches sidebar data + items by type in a single `Promise.all`
- Returns `notFound()` for unknown type slugs or unauthenticated users
- Page header shows the type icon (tinted badge), type name, and item count
- Items rendered in a `grid-cols-1 md:grid-cols-2` grid of `ItemCard`s
- Renders an empty state with the type icon and a prompt to create when no items exist

### `src/proxy.ts`
- Added `/items/:path*` to both the `isProtected` check and the `matcher` config — unauthenticated users are redirected to `/sign-in` with `callbackUrl`

## Build & Lint
- `npm run build` passes clean; `/items/[type]` registered as a dynamic (ƒ) route
- `npm run lint` passes clean; no unused variables
