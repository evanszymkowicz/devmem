# Stats & Sidebar (Real Data)

## Summary

Replaced all mock data in the sidebar with real database data, wired up collection favorite toggling, and deleted the mock data file.

## Changes

### New DB functions

- `src/lib/db/items.ts` — added `getSystemItemTypes(userId)`: fetches all system item types with per-user item counts, sorted in canonical UX order (Snippets → Prompts → Commands → Notes → Files → Images → Links)
- `src/lib/db/collections.ts` — added `getSidebarCollection` and `getSidebarCollections(userId)`: fetches all collections with dominant item type color for the colored circle indicator

### Sidebar

- `Sidebar` converted from using mock data to accepting `itemTypes`, `collections`, and `user` as props
- Item types now link to `/items/[slug]` with real DB slugs and live item counts
- Favorite collections show a clickable star (click to unfavorite); non-favorite collections show a star on hover (click to favorite)
- Non-favorite collections show a colored circle derived from the dominant item type in that collection
- "View all collections →" link added, pointing to `/collections`

### Collection card

- Star button on each card toggles `isFavorite`; always visible when favorited, fades in on hover when not
- `e.preventDefault()` on the star button prevents the wrapping `<Link>` from navigating on click

### Server Action

- `src/actions/collections.ts` — `toggleCollectionFavorite(collectionId)`: reads current value, inverts it, calls `revalidatePath("/dashboard")` so the UI reflects the change immediately

### Data flow

- `DashboardPage` (server) fetches sidebar data and passes it as serializable props to `DashboardShell` (client), which forwards them to `Sidebar`. This pattern is required because `DashboardShell` needs `"use client"` for open/close state but can't fetch data itself.

### Seed updates

- System item type names changed from singular (`Snippet`) to plural (`Snippets`) across all 7 types
- `React Patterns` collection seeded with `isFavorite: true` so the Favorites section appears by default
- Seed upsert now updates `isFavorite` on existing collections so re-runs stay consistent

### Cleanup

- `src/lib/mock-data.ts` deleted — all consumers migrated to real DB calls
