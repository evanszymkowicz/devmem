# Dashboard UI — Phase 3 (Main Area)

**Date:** 2026-05-20
**Branch:** `feature/dashboard-ui-phase-3`
**Spec:** [dashboard-phase-3-spec.md](../features/dashboard-phase-3-spec.md)

## Goal

Build the dashboard main area per the phase 3 spec.

## Prep

- Confirmed `context/current-feature.md` already mirrored the spec and status was "In progress" — no edits needed
- Reviewed the target screenshot at `context/screencaptures/dashboard-ui-main.png`
- Installed the shadcn Card component → `src/components/ui/card.tsx`

## New components (all server components, using shadcn Card)

- `src/components/dashboard/StatsCards.tsx` — 4-card stats row: Items, Collections, Favorite Items, Favorite Collections (counts derived from mock data)
- `src/components/dashboard/RecentCollections.tsx` — responsive 1/2/3-column grid with "View all" link; shows up to 6 collections, favorites first
- `src/components/dashboard/CollectionCard.tsx` — clickable card with colored left border (dominant type), favorite star, item count, description, type-icon row, and overflow `…` menu placeholder *(client component — needed for the overflow button's `onClick`)*
- `src/components/dashboard/PinnedItems.tsx` — Pin-icon header, list of pinned items
- `src/components/dashboard/RecentItems.tsx` — Clock-icon header, 10 most-recent items sorted by `updatedAt`
- `src/components/dashboard/ItemRow.tsx` — shared row used by Pinned + Recent: type-icon chip, title, pin/star indicators, description, tag pills, date

## Edits

- `src/app/dashboard/page.tsx` — wired Dashboard header + the four sections into the shell
- `src/components/dashboard/DashboardShell.tsx` — removed the placeholder `items-center justify-center` from `<main>` so content flows top-down

## Verification

- `npm run lint` — clean
- `npm run build` — passes; `/dashboard` prerenders as static (`○ (Static)`), confirming SSR
- Hit one build error along the way: an `onClick` inside the server-rendered `CollectionCard` → fixed by marking that one component `"use client"`
- Audited the route: all `page.tsx`/`layout.tsx` files are server components; `"use client"` is confined to four genuinely interactive leaves (Shell, Sidebar, TopBar, CollectionCard)

## Not done yet (per the workflow in `context/ai-interaction.md`)

- Browser verification (step 4)
- Commit, merge to main, delete branch (steps 6–8)
- Mark Phase 3 complete in `context/current-feature.md` history (step 10)
