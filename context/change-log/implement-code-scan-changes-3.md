# Implement Code Scan Changes #3

Third round of quality and reliability improvements from code-scanner audit
and colleague audit comparison. Includes infrastructure hardening, query
safety, UX polish, and four forward-looking spec files.

## What Changed

### Infrastructure

- **Neon connection pool config** — `src/lib/prisma.ts`, `prisma/seed.ts`,
  `scripts/test-db.ts` all now pass `max`, `idleTimeoutMillis`, and
  `connectionTimeoutMillis` to `PrismaNeon` to prevent connection exhaustion
  under concurrent serverless load and ensure hung connections fail fast.
  `PRISMA_CONNECTION_LIMIT` added to `.env` for per-environment tuning.

- **Seed production guard** — `prisma/seed.ts` now throws if
  `DEMO_USER_PASSWORD` is unset and `NODE_ENV` is `production`, preventing
  the seed from silently running with a publicly-known fallback password
  against a live database.

- **DATABASE_URL guard in seed** — `prisma/seed.ts` moved the
  `DATABASE_URL` check to module scope (matching `src/lib/prisma.ts` and
  `scripts/test-db.ts`), so a missing env var throws at startup rather than
  deep inside the Neon driver.

### Query safety

- **bcrypt cost factor** — `prisma/seed.ts` bumped from 12 to 14 rounds,
  meaningfully increasing offline brute-force resistance for the demo user's
  hashed password.

### UX

- **Dashboard loading skeleton** — `src/app/dashboard/loading.tsx` added.
  Next.js automatically shows this file while dashboard async server
  components fetch, replacing a blank screen with pulse-animated skeletons
  matching the stats cards, collections grid, and item rows layout.

### Spec / planning

Four forward-looking spec files added to `context/features/`:

- `db-pool-config.md` — plan to make pool settings configurable and
  consistent across environments
- `error-boundaries.md` — plan for `error.tsx` files, Suspense skeletons,
  and try/catch in DB functions and server actions
- `query-limits.md` — plan to consolidate all `take` constants into
  `src/lib/db/limits.ts` and guard caller-supplied limit params
- `css-variables.md` — plan to replace static hardcoded hex values with
  `@theme` CSS variables

## Verification

- `npx tsc --noEmit` — no errors
- `npm run lint` — no errors
