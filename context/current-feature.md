# Current Feature: Favorites Page Client-Side Sorting

## Status

In Progress

## Goals

- Add a sort control to the Favorites page (`FavoritesView`) letting the user reorder favorites by **Name**, **Date**, and **Item Type**.
- Sorting is **client-side only** — no new server queries or DB changes; reorder the already-fetched `items`/`collections` arrays in the existing `"use client"` component.
- Sort applies within each existing section (Items, Collections) — the Items/Collections grouping stays; only the order inside each list changes.
- Each sort key supports a sensible default direction (e.g. Name A→Z, Date newest-first) with a toggle for ascending/descending.
- Sorting is stable, handles empty sections gracefully, and the default view (before any interaction) matches the current server order.

## TODOs

- [ ] Add a sort dropdown/segmented control to the Favorites header or above the sections.
- [ ] Implement `useMemo`-based sorting in `FavoritesView` keyed on sort field + direction.
- [ ] Name sort: case-insensitive compare of item/collection title.
- [ ] Date sort: compare `updatedAt`.
- [ ] Item Type sort: by `itemType.name` for items; collections sort by their "Collection" badge / name (decide consistent ordering since collections have no item type).
- [ ] Keep collections section sorting coherent (Item Type sort is a no-op ordering for collections — fall back to name).
- [ ] Unit-test the pure sort/comparator logic.

## Notes

- `FavoritesView` (`src/components/favorites/FavoritesView.tsx`) is already a client component receiving `items: ItemWithType[]` and `collections: FavoriteCollection[]`.
- Items expose `title`, `updatedAt`, `itemType.name`/`itemType.color`. Collections expose `name`, `updatedAt`, `dominantColor` (no item type).
- Extract the comparator into a small pure helper (e.g. `src/lib/sort-favorites.ts`) so it can be unit-tested without rendering.
- Keep styling consistent with the existing mono/minimal favorites UI and shadcn primitives.
- Open question for `start`: one shared sort control for both sections, or per-section? Default assumption: a single shared control applied to both.

## History

- Security & Quality Audit
- Phase 1: Foundation Layout
- Phase 2: Sidebar
- Phase 3: Main Area
- Prisma 7 + Neon PostgreSQL setup
- Seed sample data
- Dashboard Collections (real data)
- Dashboard Items (real data)
- Stats & Sidebar (real data)
- Pro Badge in Sidebar
- Code Quality Quick Wins
- Auth Phase 1: NextAuth v5 + GitHub OAuth
- Auth Phase 2: Credentials provider + registration API
- Auth Phase 3: Auth UI (sign in, register, sign out)
- Email Verification on Register
- Email Verification Toggle
- Forgot Password (reset via email link)
- Rate Limiting for Auth
- Profile Page
- Fix GitHub OAuth Redirect
- Items List View
- Item List Three-Column Layout
- Vitest Unit Testing Setup
- Item Drawer
- Item Drawer Edit Mode
- Item Delete
- Item Create
- Code Editor (Monaco)
- Markdown Editor
- File Upload with Cloudflare R2
- File List View
- Collections & Settings
- Global Search/Command Palette
- Pagination
- Editor Preferences Settings
- Favorites Page
- Favorite Toggle Buttons
