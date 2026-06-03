# Seed Sample Data

**Date:** 2026-06-03
**Branch:** `feature/seed-data`
**Spec:** [seed-spec.md](../features/seed-spec.md)
**Commits:** _(pending — not yet committed)_

## Goal

Expand [`prisma/seed.ts`](../../prisma/seed.ts) to populate the database with a
demo user plus sample collections and items for development and demos, on top of
the existing 7 system item types. Data comes from the seed spec.

## Decisions

Three points in the spec conflicted with the project's source of truth; resolved
before implementing (spec updated to match):

- **Demo email** → `demo@devmemory.io`. The spec originally used the outdated
  **DevStash** domain; switched to the **DevMemory** product name.
- **Item type names** keep the existing title-case display name + URL-safe slug
  convention (`Snippet` / `snippets`) from
  [project-overview.md](../project-overview.md) §3.1, not the spec's lowercase
  names.
- **Password hashing** uses `bcryptjs` (pure JS, no native build) per the spec
  body — not the native `bcrypt`.

Also renamed the spec file `context/features/speed-spec.md` → `seed-spec.md`
(the original filename had a "speed"/"seed" typo).

## Packages

- `bcryptjs` + `@types/bcryptjs` (dev) — hash the demo user's password; pure-JS
  implementation, no native compilation step

## What was seeded

All sample data is owned by the demo user. The seed is **idempotent** — safe to
re-run without creating duplicates.

### Demo user

- `demo@devmemory.io`, name "Demo User", `isPro: false`, `emailVerified` = now
- Password `12345678` hashed with `bcryptjs` at 12 rounds
- Upserted by `email`

### System item types

- Unchanged: the existing idempotent loop seeds the 7 system types (Snippet,
  Prompt, Command, Note, File, Image, Link) with `userId = null`

### Collections & items (5 collections, 18 items)

| Collection | Description | Items |
|---|---|---|
| React Patterns | Reusable React patterns and hooks | 3 snippets (useDebounce hook, theme context provider, `cn()` class merge) |
| AI Workflows | AI prompts and workflow automations | 3 prompts (code review, documentation generation, refactoring assistant) |
| DevOps | Infrastructure and deployment resources | 1 snippet (multi-stage Dockerfile), 1 command (migrate + deploy), 2 links (Docker / GitHub Actions docs) |
| Terminal Commands | Useful shell commands for everyday development | 4 commands (git reset, docker prune, lsof port, npm explain) |
| Design Resources | UI/UX resources and references | 4 links (Tailwind, shadcn/ui, Radix, Lucide) |

- Snippets / prompts / commands → `ContentType.TEXT`; links → `ContentType.URL`
- Snippets carry a `language` for syntax highlighting; links carry real `url`s
- Collection membership is written through the `ItemCollection` join table

## Idempotency strategy

- **User** — `upsert` on the unique `email`
- **Collections** — `findFirst` by `{ name, userId }`, create if absent (a user
  may legitimately have collections of the same name only once here)
- **Items** — `findFirst` by `{ title, userId }`, create if absent
- **Join rows** — `upsert` on the compound PK `itemId_collectionId`
- Item type slugs are resolved to ids once via a `Map` before inserting items

## Verification

- `npm run db:seed` run **twice** → stable counts, no duplicates:
  `users: 1, systemTypes: 7, collections: 5, items: 18, itemCollectionJoins: 18`
- `bcrypt.compare("12345678", user.password)` → `true`
- Demo user fields confirmed: `isPro: false`, `emailVerified` set
- `npm run build` ✅ (TypeScript clean) and `npm run lint` ✅

## Follow-ups (per the workflow in `context/ai-interaction.md`)

- Commit, merge to main, delete the `feature/seed-data` branch
- Mark [current-feature.md](../current-feature.md) complete and add to history
  _(done)_
