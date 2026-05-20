# Current Feature

Dashboard UI — Phase 3 (Main Area)

## Status

Not started

## Goals

Phase 3 of 3 for the dashboard UI layout. See `@context/features/dashboard-phase-3-spec.md` and `@context/screenshots/dashboard-ui-main.png` for the target look. Use data from `@src/lib/mock-data.ts` directly (no database yet).

- Main area to the right
- Recent collections
- Pinned items
- 10 most recent items
- 4 stats cards at the top: number of items, collections, favorite items, favorite collections (not in screenshot)

## Notes

- Final phase of the 3-phase dashboard effort; phases 1 and 2 are complete
- Wordmark is **DevMemory** / **DevMem** — screenshots showing "DevStash" are outdated
- References:
  - `@context/screenshots/dashboard-ui-main.png`
  - `@context/project-overview.md`
  - `@src/lib/mock-data.ts`
  - `@context/features/dashboard-phase-1-spec.md`
  - `@context/features/dashboard-phase-2-spec.md`
  - `@context/features/dashboard-phase-3-spec.md`

## History

- Phase 1 (Foundation Layout) completed and merged to main (PR #1)
  - ShadCN init (radix-nova preset, Lucide icons, Geist fonts)
  - Dark mode default
  - `/dashboard` route with display-only top bar and placeholder sidebar/main
  - Build and lint passing
- Phase 2 (Sidebar) completed and merged to main (PR #2)
  - Collapsible sidebar with item types linking to `/items/[type]`
  - Favorite collections and most recent collections sections
  - User avatar area pinned to the bottom
  - Drawer icon to open/close sidebar; always a drawer on mobile
