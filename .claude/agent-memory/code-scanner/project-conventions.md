---
name: project-conventions
description: Confirmed project conventions and false-positive traps to never re-flag in this codebase
metadata:
  type: project
---

## Confirmed conventions — do not flag these as wrong

- `.env` is listed in `.gitignore` under `.env*`. Never report it as unprotected without running `git ls-files` first.
- Tailwind CSS v4 is used. There is intentionally NO `tailwind.config.*` file. Config lives in `src/app/globals.css` via `@theme inline`.
- Prisma client is generated to `src/generated/prisma` (not the default `node_modules`); import from `@/generated/prisma/client`.
- Neon driver adapter is used for runtime (`@prisma/adapter-neon`); connection URL lives in `prisma.config.ts` (for Migrate) and `src/lib/prisma.ts` (runtime). No URL in `schema.prisma` — this is correct for Prisma 7 + Neon.
- `demo@devmemory.io` is the pre-auth placeholder demo user used everywhere DB queries exist. This is intentional and NOT a security hole. All components that fetch via this email are placeholders until NextAuth v5 is wired in.
- During development, all Pro features are intentionally open behind a feature flag. Do not flag missing Pro gating.
- `'use client'` components: `DashboardShell`, `Sidebar`, `TopBar`, `CollectionCard` — these need client boundary for interactivity/hooks. Correct pattern.
- Server Actions in `src/actions/` return void or `{ success, data, error }`. Only `toggleCollectionFavorite` exists so far.
- NextAuth v5 is NOT yet installed (not in package.json as of audit date). Do not flag missing auth as a defect — it is roadmap item #3.

## Recurring false-positive traps

- The `ICON_MAP` constant duplicated in CollectionCard, ItemRow, and Sidebar is a real finding (Medium) — it should be extracted to a shared module.
- `getDemoUserId` duplicated in PinnedItems, RecentCollections, RecentItems, StatsCards is a real finding (Medium) causing 4+ extra DB round-trips per dashboard render.
