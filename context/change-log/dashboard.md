# Dashboard UI — Phases 1–3

**Branch per phase:** `feature/dashboard-ui-phase-1`, `feature/dashboard-ui-phase-2`, `feature/dashboard-ui-phase-3`
**Merged via:** PR #1, PR #2, PR #3
**Reference screenshot:** `context/screencaptures/dashboard-ui-main.png`

---

## Phase 1 — Foundation Layout

**Goal:** Initialize ShadCN, create the `/dashboard` route, establish global styles, and scaffold placeholder layout regions.

### What was done

- Initialized ShadCN UI (radix-nova preset, Lucide icons, Geist fonts)
- Set dark mode as the default
- Created `/dashboard` route (`src/app/dashboard/page.tsx`)
- Added a display-only top bar with search input and a New Item button
- Placeholder sidebar (`<h2>Sidebar</h2>`) and main area (`<h2>Main</h2>`) to confirm layout shell
- Build and lint passing clean

---

## Phase 2 — Sidebar

**Goal:** Build the full collapsible sidebar from mock data.

### What was done

- Collapsible sidebar with a drawer icon to toggle open/close
- **Types section** — all system item types listed with icon and link to `/items/[slug]`
- **Favorite Collections** group — starred collections highlighted
- **Recent Collections** list — most recently accessed collections
- **User avatar area** pinned to the bottom of the sidebar
- On mobile the sidebar always renders as a drawer (off-canvas)
- Mock data (`src/lib/mock-data.ts`) used for all sidebar content

---

## Phase 3 — Main Area

**Date:** 2026-05-20

**Goal:** Build the dashboard main content area per the phase 3 spec.

### Prep

- Confirmed `context/current-feature.md` already mirrored the spec; no edits needed
- Reviewed target screenshot at `context/screencaptures/dashboard-ui-main.png`
- Installed the shadcn `Card` component → `src/components/ui/card.tsx`

### New components

All are server components unless noted.

| Component | Description |
|---|---|
| `src/components/dashboard/StatsCards.tsx` | 4-card stats row: Items, Collections, Favorite Items, Favorite Collections |
| `src/components/dashboard/RecentCollections.tsx` | Responsive 1/2/3-column grid, up to 6 collections, favorites first, with "View all" link |
| `src/components/dashboard/CollectionCard.tsx` | Colored left border (dominant type), favorite star, item count, description, type-icon row, overflow `…` placeholder — *client component* (needed for `onClick`) |
| `src/components/dashboard/PinnedItems.tsx` | Pin-icon header + list of pinned items |
| `src/components/dashboard/RecentItems.tsx` | Clock-icon header + 10 most-recent items sorted by `updatedAt` |
| `src/components/dashboard/ItemRow.tsx` | Shared row for Pinned and Recent: type-icon chip, title, pin/star indicators, description, tag pills, date |

### Edits

- `src/app/dashboard/page.tsx` — wired Dashboard header and all four sections into the shell
- `src/components/dashboard/DashboardShell.tsx` — removed `items-center justify-center` from `<main>` so content flows top-down

### Verification

- `npm run lint` — clean
- `npm run build` — passes; `/dashboard` prerenders as static (`○ (Static)`), confirming SSR
- Fixed one build error: `onClick` inside a server-rendered `CollectionCard` — resolved by marking it `"use client"`
- Audited route tree: all `page.tsx` / `layout.tsx` files remain server components; `"use client"` confined to four interactive leaves (Shell, Sidebar, TopBar, CollectionCard)
