# Current Feature

## Prisma + Neon PostgreSQL Setup

Set up Prisma 7 ORM with a Neon serverless PostgreSQL database, and create the initial schema based on the data models in `@context/project-overview.md`.

## Status

Complete

## Goals

- Provision Neon PostgreSQL (serverless) with separate development and production branches
- Wire `DATABASE_URL` to the Neon **development** branch for local work; production branch used for deploys
- Install and configure Prisma 7 (note: breaking changes — read the upgrade guide before schema work)
- Define the initial schema from the data models in `@context/project-overview.md`:
  - `User` (with email/password hash + OAuth fields, Stripe fields, `isPro`)
  - NextAuth models: `Account`, `Session`, `VerificationToken`
  - `Item`, `ItemType`, `Collection`, `ItemCollection` (join), `Tag`
  - `ContentType` enum (`TEXT`, `FILE`, `URL`)
- Add appropriate indexes and cascade deletions per the schema
- Use snake_case table names via `@@map`
- Create the initial migration with `prisma migrate dev` (never `prisma db push`)
- Add the seed script for the 7 system item types and run it

## Notes

- **Migration rule:** ALWAYS create migrations (`prisma migrate dev` locally, `prisma migrate deploy` in prod). Never `prisma db push` unless explicitly specified.
- **Prisma 7 has breaking changes** — read the full upgrade guide before non-trivial schema work: <https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7>
- Setup reference: <https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres>
- Two Neon branches: development (in `DATABASE_URL` for local work) and production.
- Run `prisma migrate status` before committing to verify migrations are in sync.
- Spec: `@context/features/database-spec.md`

## References

- Initial data models & full Prisma schema: `@context/project-overview.md` §4
- Database standards: `@context/coding-standards.md`
- Feature spec: `@context/features/database-spec.md`

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
