# Dashboard Collections — Real Data

**Date:** 2026-06-05
**Branch:** `feature/seed-data`
**Spec:** [dashboard-collections-spec.md](../features/dashboard-collections-spec.md)

## Goal

Replace the mock collection data in the dashboard with real data from
the Neon database via Prisma. Collection cards keep the same design but now show
live counts, correct border colors (derived from the dominant item type) and
accurate type-icon rows.

## What changed

### New: `src/lib/db/collections.ts`

Central module for all dashboard data-fetching. Two exports:

- **`getDashboardCollections(userId)`** — fetches up to 6 collections ordered by
  `isFavorite desc, createdAt desc`, includes all items with their `itemType`,
  counts type occurrences per collection, and sorts types so the most-used type
  is first. Returns `CollectionWithTypes[]`.
- **`getDashboardStats(userId)`** — runs 4 parallel `count` queries (total items,
  total collections, favorite items, favorite collections) via `Promise.all`.
  Returns `DashboardStats`.

The `CollectionWithTypes` interface is the shared contract between the DB layer
and the card component — it replaces the old mock `Collection` type.

### Updated: `CollectionCard.tsx`

- Prop type changed from mock `Collection` to `CollectionWithTypes`
- Border color: `collection.itemTypes[0]?.color ?? "#6b7280"` — dominant type
  is always first because the DB layer sorts by count descending
- Type icons: maps over the full `collection.itemTypes` array directly — no
  longer looks up icons via `mockItemTypes`
- `mockItemTypes` import removed entirely

### Updated: `RecentCollections.tsx`

- Converted from a sync function to an `async` server component
- Fetches the demo user id by email (`demo@devmemory.io`), then calls
  `getDashboardCollections` — ordering and limiting (6) are handled in the query
- Falls back to an empty array if the demo user isn't found

### Updated: `StatsCards.tsx`

- Converted from a sync function to an `async` server component
- Calls `getDashboardStats` for real aggregate counts
- Falls back to all-zeros if the demo user isn't found

## Decisions

- **Demo user lookup** — auth sessions are not wired up yet, so both components
  resolve the user by the seeded email `demo@devmemory.io`. This will be replaced
  with a session lookup when NextAuth is integrated.
- **Dominant type = most items of that type** — counted at query time in
  `getDashboardCollections`, not stored. Empty collections get the neutral gray
  fallback (`#6b7280`).
- **Items not shown under cards** — deferred to a separate feature per the spec.

## Verification

- `npm run build` ✅ — compiled successfully, TypeScript clean, no errors
- All 3 routes (`/`, `/_not-found`, `/dashboard`) generated without issue

## Follow-ups

- Commit, merge to main, delete the branch
- Replace demo-user email lookup with real session user once NextAuth is wired up
