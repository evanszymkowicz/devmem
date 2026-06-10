---
name: recurring-issues
description: Real, recurring issue patterns and hotspots found in audits of this codebase
metadata:
  type: project
---

## Authorization gap in Server Actions

`src/actions/collections.ts` — `toggleCollectionFavorite` has no ownership check.
When auth is added, every Server Action must: (1) read session, (2) assert session exists,
(3) scope all Prisma queries to `userId: session.user.id`. This pattern must be applied to
every future action added to `src/actions/`.

**Why:** No auth is implemented yet, so today it's a future-state issue; but the pattern
of writing actions without ownership guards is already established and must be corrected
before auth ships.

## Missing DATABASE_URL guard at startup

`src/lib/prisma.ts` — adapter constructed with `process.env.DATABASE_URL` without a null
check. Errors surface at query time, not startup. Standard fix: throw at module load if
the env var is absent.

## Duplicate getDemoUserId across dashboard components

PinnedItems, RecentCollections, RecentItems, StatsCards each define identical
`getDemoUserId` functions that each fire a separate Prisma round-trip. When dashboard/page.tsx
already resolves the user, it should pass `userId` as a prop rather than each component
independently resolving it.

## Duplicate ICON_MAP constant

CollectionCard, ItemRow, Sidebar each define the same `Record<string, LucideIcon>` map.
Should live in `src/lib/icon-map.ts`.

## getPinnedItems has no take/limit

`src/lib/db/items.ts:22` — no `take` clause. Will fetch unbounded rows. Add a cap.

## getSidebarCollections over-fetches for dominant color

`src/lib/db/collections.ts:85` — loads all items + types just to compute one color.
`Collection.defaultTypeId` already exists in the schema and would solve this if populated.
