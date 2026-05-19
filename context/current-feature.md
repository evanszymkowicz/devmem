# Current Feature

Dashboard UI — Phase 1 (Foundation Layout)

## Status

Completed

## Goals

Phase 1 of 3 for the dashboard UI layout. See `@context/features/dashboard-phase-1-spec.md` and `@context/screencaptures/dashboard-ui-main.png` for the target look.

- ShadCN UI initialization and component installation
- Dashboard route at `/dashboard`
- Main dashboard layout and any global styles
- Dark mode by default
- Top bar with search and new item button (display only)
- Placeholder sidebar and main area (just an `h2` with "Sidebar" and "Main" for now)

## Notes

- Part of a 3-phase dashboard effort; phases 2 and 3 specs are in `@context/features/`
- Wordmark is **DevMemory** / **DevMem** — screenshots showing "DevStash"
  are outdated
- References:
  - `@context/screencaptures/dashboard-ui-main.png`
  - `@context/project-overview.md`
  - `@src/lib/mock-data.ts`
  - `@context/features/dashboard-phase-2-spec.md`
  - `@context/features/dashboard-phase-3-spec.md`

## History

- Project setup and boilerplate cleanup
- Initial Next.js setup
- Documented Dashboard UI Phase 1 feature
- Created branch `feature/dashboard-phase-1`
- Set up ShadCN via `npx shadcn@latest init -y -b radix -p nova` (radix-nova
  preset, Lucide icons, Geist fonts): `components.json`, `lib/utils`, theme
  tokens in `globals.css`; updated root metadata
- Dark mode default via `dark` class on `<html>`
- Installed ShadCN Button + Input components via `shadcn add`
- Built `/dashboard` route: layout shell, display-only top bar (search +
  New Collection/New Item), placeholder Sidebar and Main
- `npm run build` and `npm run lint` pass
