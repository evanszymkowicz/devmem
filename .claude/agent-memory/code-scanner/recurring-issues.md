---
name: recurring-issues
description: Real, recurring issue patterns and hotspots found in audits of this codebase
metadata:
  type: project
---

## Authorization gap in Server Actions

`src/actions/collections.ts` — `toggleCollectionFavorite` has no ownership check (no
session guard, no `userId` scoping). When auth is added, every Server Action must:
(1) read session, (2) assert session exists, (3) scope all Prisma queries to
`userId: session.user.id`. The read-modify-write pattern also has a TOCTOU race
(read isFavorite then write) — low impact pre-concurrent-users but worth noting.

**Why:** No auth is implemented yet, so today it's deferred; but the pattern of
writing actions without ownership guards must be corrected before auth ships.

## getSidebarCollections over-fetches for dominant color

`src/lib/db/collections.ts:85` — loads all items + their itemType joins for every
collection just to compute one color per collection. `Collection.defaultTypeId`
already exists in the schema and would solve this if populated during collection
creation. Until then this is an intentional known tradeoff (deferred per
current-feature.md).

## DEMO_PASSWORD fallback in seed.ts

`prisma/seed.ts:12` — `process.env.DEMO_USER_PASSWORD ?? "12345678"`. The env var
is correctly wired, but the hardcoded fallback `"12345678"` means a missing env
var silently seeds a known-weak password. In production seeds the env var must be
set; the fallback should either throw or be documented as dev-only.

## Previously resolved issues (do not re-flag)

- DATABASE_URL guard — RESOLVED in `src/lib/prisma.ts:6-7`
- getDemoUserId duplication / extra DB round-trips — RESOLVED; dashboard/page.tsx
  resolves once and passes userId as prop to all child components
- ICON_MAP duplication — RESOLVED; now a shared module at `src/lib/icon-map.ts`
- getPinnedItems unbounded query — RESOLVED; `take: MAX_PINNED_DISPLAY` (20) added
- StarOff icon on Favorite Collections stat card — RESOLVED; uses `Star` throughout
- Avatar initials empty-segment crash — RESOLVED; `.filter(Boolean)` guards it
