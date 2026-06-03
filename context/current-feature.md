# Current Feature

## Seed Sample Data

Expand `prisma/seed.ts` to populate the database with a demo user, the 7 system
item types, and a set of sample collections and items for development and demos.
Data comes from the seed spec at `@context/features/seed-spec.md`.

## Status

Complete

## Goals

- **Demo user** (idempotent upsert by email):
  - Email: `demo@devmemory.io`
  - Name: Demo User
  - Password: `12345678`, hashed with `bcryptjs` at 12 rounds
  - `isPro: false`
  - `emailVerified`: current date
- **System item types** — keep the existing idempotent upsert of the 7 system
  types (`isSystem: true`, `userId: null`), matching the icons/colors in the spec.
- **Collections & items** owned by the demo user (idempotent — safe to re-run):
  - **React Patterns** — _Reusable React patterns and hooks_ — 3 TypeScript snippets
    (custom hooks, component patterns, utility functions)
  - **AI Workflows** — _AI prompts and workflow automations_ — 3 prompts
    (code review, documentation generation, refactoring assistance)
  - **DevOps** — _Infrastructure and deployment resources_ — 1 snippet (Docker/CI-CD),
    1 command (deployment script), 2 links (real documentation URLs)
  - **Terminal Commands** — _Useful shell commands for everyday development_ — 4 commands
    (git, docker, process management, package manager)
  - **Design Resources** — _UI/UX resources and references_ — 4 links, real URLs
    (CSS/Tailwind reference, component library, design system, icon library)
- Run the seed and verify the rows land correctly.

## Notes

- **Decisions** (resolved; spec updated to match):
  - Demo email is `demo@devmemory.io` — the spec previously used the outdated
    **DevStash** domain; updated to the **DevMemory** product name.
  - Item type names follow the existing title-case display name + URL-safe slug
    convention (`Snippet` / `snippets`) from `@context/project-overview.md`, not
    the spec's lowercase names.
  - Hash the demo password with `bcryptjs` (pure JS, no native build) per the
    spec body — not the native `bcrypt`.
- **Idempotency:** the whole seed must be safe to re-run — use `upsert` (or
  guarded `create`) for the user, types, collections, and items so `db:seed`
  doesn't duplicate rows.
- **Migration rule:** seeding does not touch schema. Never run `prisma db push`;
  schema changes only ever go through `prisma migrate dev` / `migrate deploy`.
- Item content types: snippets/prompts/commands → `TEXT`; links → `URL`.
- Collection membership goes through the `ItemCollection` join table.

## References

- Seed spec (data to insert): `@context/features/seed-spec.md`
- Data models & full Prisma schema: `@context/project-overview.md` §4
- Database standards: `@context/coding-standards.md`
- Existing Prisma/Neon setup: `@context/change-log/prisma-neon-setup.md`

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
  - Verified: seed runs twice with stable counts; password verifies against `12345678`; `npm run build` and `npm run lint` pass
