# Current Feature

Dashboard UI — Phase 1 (Foundation Layout)

## Status

In Progress

## Goals

Phase 1 of 3 for the dashboard UI layout. Roughly match the look in `@context/screencaptures/dashboard-ui-main.png`.

- ShadCN UI initialization
- ShadCN component installation
- Dashboard route at `/dashboard`
- Main dashboard layout and any global styles
- Dark mode by default
- Top bar with search and new item button (display only)
- Placeholder for sidebar and main area — just an `h2` with "Sidebar" and
  "Main" for now

## Notes

- This is phase 1 of 3; phase 2 and 3 specs exist in `context/features/`
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
- Set up ShadCN via `npx shadcn@latest init -d` (next template, base-nova
  preset): `components.json`, `lib/utils`, theme tokens in `globals.css`
- Dark mode default via `dark` class on `<html>`
- Installed ShadCN Button + Input components via `shadcn add`
- Built `/dashboard` route: layout shell, display-only top bar (search +
  New Collection/New Item), placeholder Sidebar and Main
- `npm run build` and `npm run lint` pass
