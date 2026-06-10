# Error Boundaries Spec

## Overview

Add React error boundaries and Next.js error files so that crashes in
individual dashboard sections degrade gracefully rather than blanking the
whole page. Also add try/catch to all DB functions and server actions so
errors are handled at the source.

## Problem

Currently a thrown error in any async server component (e.g. a Neon
connection drop during `getDashboardCollections`) will crash the entire
dashboard render. There is no `error.tsx` fallback and no try/catch in DB
functions or server actions.

## Requirements

### Next.js error files
- Add `src/app/error.tsx` — root-level client component fallback with a
  retry button
- Add `src/app/dashboard/error.tsx` — dashboard-scoped fallback, same pattern

### Suspense skeletons
- Wrap `StatsCards`, `RecentCollections`, `PinnedItems`, and `RecentItems`
  in `<Suspense>` with skeleton fallbacks in `src/app/dashboard/page.tsx`
- Create skeleton components matching each section's layout (card grid,
  item rows)

### DB / action error handling
- Wrap all `prisma.*` calls in `src/lib/db/collections.ts` and
  `src/lib/db/items.ts` in try/catch; re-throw with a descriptive message
- Wrap `toggleCollectionFavorite` in `src/actions/collections.ts` in
  try/catch; return `{ success: false, error }` on failure and surface via
  toast in the client component

## References

- `src/app/dashboard/page.tsx`
- `src/lib/db/collections.ts`
- `src/lib/db/items.ts`
- `src/actions/collections.ts`
- Next.js error handling docs: https://nextjs.org/docs/app/building-your-application/routing/error-handling
