# Prisma 7 + Neon PostgreSQL Setup

**Date:** 2026-06-02
**Branch:** `prisma-setup`
**Spec:** [database-spec.md](../features/database-spec.md)
**Commits:** `678bc1c` (Prisma 7 setup), `7462e5c` (scripts)

## Goal

Set up Prisma 7 ORM against a Neon serverless PostgreSQL database and create the
initial schema from the data models in [project-overview.md](../project-overview.md) §4.

## Prep

- Read the Prisma 7 upgrade guide — v7 has breaking changes (new generator, driver
  adapters required, connection URL moved out of the schema)
- Provisioned Neon Postgres with separate **development** and **production** branches;
  local `DATABASE_URL` points at the development branch

## Packages

- `prisma` (dev) + `@prisma/client` — v7.8.0
- `@prisma/adapter-neon` + `@neondatabase/serverless` — Neon serverless driver adapter
  (Prisma 7 requires a driver adapter)
- `dotenv` — load `DATABASE_URL` from `.env` in standalone scripts
- `tsx` (dev) — run the TypeScript seed/test scripts

## Prisma 7 configuration

- `prisma/schema.prisma` — uses the new `prisma-client` generator (not the legacy
  `prisma-client-js`), output to `src/generated/prisma`. The `datasource` block has
  **no inline `url`** — per v7 the connection lives in `prisma.config.ts` (for Migrate)
  and is passed to `PrismaClient` via the driver adapter (for runtime)
- `prisma.config.ts` — new v7 config file: schema path, migrations path, seed command
  (`tsx prisma/seed.ts`), and `datasource.url` from `env("DATABASE_URL")`
- `src/lib/prisma.ts` — runtime client using the `PrismaNeon` adapter, with the standard
  hot-reload singleton guard so dev doesn't exhaust connections

## Schema

Modeled directly from the spec — all tables use snake_case names via `@@map`:

- `User` (email/password hash + OAuth/Stripe fields, `isPro`)
- NextAuth models: `Account`, `Session`, `VerificationToken`
- `Item`, `ItemType`, `Collection`, `ItemCollection` (join), `Tag`
- `ContentType` enum (`TEXT`, `FILE`, `URL`)
- Indexes on `Item` (`userId`, `itemTypeId`, `createdAt`) and `Collection` (`userId`)
- `@@unique([slug, userId])` on `ItemType`; cascade deletes on user-owned relations
- `Tag` ↔ `Item` implicit many-to-many via the `"ItemTags"` relation

## Migration

- Created the initial migration with `prisma migrate dev` →
  `prisma/migrations/20260602220309_init/migration.sql`
- Followed the migration rule: **never `prisma db push`** — all schema changes go through
  `migrate dev` (local) / `migrate deploy` (prod)

## Seed

- `prisma/seed.ts` — seeds the 7 system item types (Snippet, Prompt, Command, Note, File,
  Image, Link) with `userId = null`
- Idempotent via `findFirst` on `{ slug, userId: null }` + `create` when absent. (The
  compound-unique `where` input `slug_userId` types `userId` as non-nullable, so a plain
  `upsert` on the null-owner key isn't directly expressible.)
- Wired as the seed command in `prisma.config.ts`; runnable via `npm run db:seed`

## Test script

- `scripts/test-db.ts` — connectivity + sanity check: raw `SELECT 1` round-trip, confirms
  the 7 system types seeded, prints row counts for the core tables. Uses the same
  `dotenv` + `PrismaNeon` adapter pattern as the seed
- Added `db:test` to `package.json` → `npm run db:test`

## npm scripts (package.json)

`db:generate`, `db:migrate`, `db:migrate:deploy`, `db:migrate:status`, `db:seed`,
`db:studio`, `db:test`

## Env

- `.env` (gitignored) holds the Neon development-branch `DATABASE_URL`
- `.env.example` documents the dev/prod branch convention and the pooled,
  `?sslmode=require` connection string format

## Verification

- `prisma migrate status` → "Database schema is up to date!" (connected to Neon `neondb`,
  pooled endpoint)
- `npm run db:test` → connection OK, 7 system types found, core tables present (0 rows on
  the fresh database)

## Completed (per the workflow in `context/ai-interaction.md`)

- Merged to main; `prisma-setup` branch deleted
- `context/current-feature.md` marked complete and added to history
