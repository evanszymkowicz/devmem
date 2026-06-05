# Current Feature

## [Feature Name]

Document the next feature here, then follow the workflow in
`@context/ai-interaction.md` (Document → Branch → Implement → Test → Iterate →
Commit → Merge → Delete Branch → Review → log to History).

## Status

Not started

## Goals

-

## Notes

-

## References

- Coding standards: `@context/coding-standards.md`
- AI interaction & workflow: `@context/ai-interaction.md`

## History

> The "Phase" labels below are historical dashboard-UI build stages and predate the
> ordered checklist now in `project-overview.md` §8; they do not map to that checklist.

- Phase 1 (Foundation Layout) completed and merged to main (PR #1)
  - ShadCN init (radix-nova preset, Lucide icons, Geist fonts)
  - Dark mode default
  - `/dashboard` route with display-only top bar and placeholder sidebar/main
  - Build and lint passing
- Phase 2 (Sidebar) completed and merged to main (PR #2)
  - Collapsible sidebar with item types, favorite collections, recent collections
  - User avatar area at bottom
  - Drawer icon to toggle; always a drawer on mobile
- Phase 3 (Main Area) completed
  - Stats cards row (Items, Collections, Favorite Items, Favorite Collections)
  - Recent Collections grid using shadcn Card with colored left border, favorite star, item count, description, and type-icon row
  - Pinned Items section
  - Recent Items section (10 most recent by `updatedAt`)
  - Shared `ItemRow` component for Pinned + Recent
  - Page remains SSR; `"use client"` confined to interactive leaves
  - See `@context/change-log/dashboard-phase-3.md` for details
- Prisma 7 + Neon PostgreSQL setup completed
  - Neon provisioned with separate development/production branches; local `DATABASE_URL` on the dev branch
  - Prisma 7 configured for its breaking changes: new `prisma-client` generator → `src/generated/prisma`, required Neon driver adapter (`@prisma/adapter-neon`), connection URL moved out of the schema into `prisma.config.ts` (Migrate) and the adapter (runtime)
  - Initial schema from `@context/project-overview.md` §4: `User`, NextAuth models, `Item`, `ItemType`, `Collection`, `ItemCollection`, `Tag`, `ContentType` enum, with indexes, cascades, and snake_case `@@map`
  - Initial migration created via `prisma migrate dev` (never `db push`); `prisma migrate status` clean
  - Idempotent seed for the 7 system item types; `scripts/test-db.ts` + `db:test` for connectivity/sanity checks
  - See `@context/change-log/prisma-neon-setup.md` for details
- Seed sample data completed
  - Renamed the spec `context/features/speed-spec.md` → `seed-spec.md` and switched the demo email to the DevMemory domain
  - Added `bcryptjs` (+ `@types/bcryptjs`); demo user `demo@devmemory.io` hashed at 12 rounds, `isPro: false`, `emailVerified` set
  - Expanded `prisma/seed.ts`: demo user, 7 system types (kept title-case name + slug convention), and 5 collections / 18 items / 18 join rows, all idempotent (re-runnable without duplicates)
  - Updated `scripts/test-db.ts` (`db:test`) to fetch and display the demo user and their collections/items, with a graceful warning when the data isn't seeded
  - Verified: seed runs twice with stable counts; password verifies against `12345678`; `npm run build` and `npm run lint` pass
  - See `@context/change-log/seed-data.md` for details
- Dashboard Collections (real data) completed
  - Created `src/lib/db/collections.ts` with `getDashboardCollections` and `getDashboardStats`
  - `getDashboardCollections` fetches up to 6 collections ordered by favorite then `createdAt`, includes all items with their types, counts occurrences per type, and sorts so the dominant type (most items) is first
  - `CollectionCard` updated to accept `CollectionWithTypes`; border color derived from `itemTypes[0].color` (dominant type); type icons rendered from the full `itemTypes` array — no more `mockItemTypes` lookup
  - `RecentCollections` and `StatsCards` converted to async server components; both fetch via demo user `demo@devmemory.io` (pre-auth placeholder)
  - `npm run build` passes clean; TypeScript no errors
- Dashboard Items (real data) completed
  - Created `src/lib/db/items.ts` with `getPinnedItems` and `getRecentItems`; `ItemWithType` derived via `Prisma.ItemGetPayload`
  - `ItemRow` updated to accept `ItemWithType`; icon/color derived from `item.itemType` — no more `mockItemTypes` lookup
  - `PinnedItems` and `RecentItems` converted to async server components; both fetch via demo user `demo@devmemory.io` (pre-auth placeholder)
  - Pinned section still returns `null` when no items are pinned
  - `npm run build` passes clean; TypeScript no errors
  - See `@context/change-log/dashboard-items.md` for details
- Stats & Sidebar (real data) completed
  - Sidebar item types, collections, and user area all wired to real DB data; mock-data.ts deleted
  - Added `getSystemItemTypes` and `getSidebarCollections` DB functions; types sorted in canonical UX order
  - System item type names pluralised in seed (Snippet → Snippets, etc.)
  - Favorite toggle added to collection cards and sidebar rows via `toggleCollectionFavorite` server action
  - `React Patterns` seeded as a favorite collection
  - See `@context/change-log/stats-sidebar-real-data.md` for details
