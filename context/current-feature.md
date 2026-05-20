# Current Feature

Dashboard UI — Phase 2 (Sidebar)

## Status

In progress

## Goals

Phase 2 of 3 for the dashboard UI layout. See `@context/features/dashboard-phase-2-spec.md` and `@context/screenshots/dashboard-ui-main.png` for the target look. Use data from `@src/lib/mock-data.ts` directly (no database yet).

- Collapsible sidebar
- Items/types with links to `/items/[type]` (e.g. `/items/snippets`)
- Favorite collections
- Most recent collections
- User avatar area at the bottom
- Drawer icon to open/close sidebar
- Always a drawer on mobile view

## Notes

- Part of a 3-phase dashboard effort; phase 1 is complete, phase 3 spec is in `@context/features/`
- Wordmark is **DevMemory** / **DevMem** — screenshots showing "DevStash"
  are outdated
- References:
  - `@context/screenshots/dashboard-ui-main.png`
  - `@context/project-overview.md`
  - `@src/lib/mock-data.ts`
  - `@context/features/dashboard-phase-1-spec.md`
  - `@context/features/dashboard-phase-3-spec.md`

## History

- Phase 1 (Foundation Layout) completed and merged to main (PR #1)
  - ShadCN init (radix-nova preset, Lucide icons, Geist fonts)
  - Dark mode default
  - `/dashboard` route with display-only top bar and placeholder sidebar/main
  - Build and lint passing
