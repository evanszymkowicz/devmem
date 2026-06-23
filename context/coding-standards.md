# Coding Standards

## TypeScript

- Strict mode enabled
- No `any` types - use proper typing or `unknown`
- Define interfaces for all props, API responses, and data models
- Use type inference where obvious, explicit types where helpful

## React

- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused - one job per component
- Extract reusable logic into custom hooks
- Guard against malformed or empty input (e.g. `.filter(Boolean)` before indexing)
- Render explicit empty states or early-return `null` rather than empty sections; use loading skeletons over blank screens
- Choose semantically distinct icons (don't reuse one icon for two different meanings)

## Next.js

- Server components by default
- Only use `'use client'` when needed (interactivity, hooks, browser APIs)
- Use Server Actions for form submissions and simple mutations
- Use API routes when you need:
  - Webhooks (Stripe, GitHub, etc.)
  - File uploads with progress tracking
  - Long-running operations
  - Specific HTTP status codes or headers
  - Endpoints for future mobile/CLI clients
  - Third-party integrations
- Otherwise, fetch data directly in server components
- Dynamic routes for item/collection pages

## Tailwind CSS v4

**CRITICAL**: We are using Tailwind CSS v4, which uses CSS-based configuration.

- **DO NOT** create `tailwind.config.ts` or `tailwind.config.js` files (those are for v3)
- All theme configuration must be done in CSS using the `@theme` directive in `src/app/globals.css`
- Use CSS custom properties for colors, spacing, etc.
- No JavaScript-based config allowed

Example v4 configuration:

```css
@import "tailwindcss";

@theme {
  --color-primary: oklch(50% 0.2 250);
}

## File Organization

- Components: `src/components/[feature]/ComponentName.tsx`
- Pages: `src/app/[route]/page.tsx`
- Server Actions: `src/actions/[feature].ts`
- Types: `src/types/[feature].ts`
- Lib/Utils: `src/lib/[utility].ts`

## DRY

- No copy-pasted constants, maps, or helpers across files — extract shared values to `src/lib/` (e.g. `icon-map.ts`, `db/limits.ts`)
- Resolve shared data once and pass it down as props; don't re-fetch the same thing in sibling components (no per-component DB round-trips for the same record)
- Centralize "magic numbers" — query limits, cost factors, timeouts — as named constants, not inline literals

## Naming

- Components: PascalCase (`ItemCard.tsx`)
- Files: Match component name or kebab-case
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Types/Interfaces: PascalCase (no prefix)

## Styling

- Tailwind CSS for all styling
- Use shadcn/ui components where applicable
- No inline styles
- Dark mode first, light mode as option

## Database

- Use Prisma ORM for all database operations
- Always use `prisma migrate dev` for schema changes (not `db push`)
- Run `prisma migrate status` before committing to verify migrations are in sync
- Production deployments must run `prisma migrate deploy` before the app starts
- Every list / `findMany` query has an explicit `take` limit — no unbounded fetches. Keep limit constants in `src/lib/db/limits.ts`
- Configure the Neon connection pool (`max`, `idleTimeoutMillis`, `connectionTimeoutMillis`) to avoid connection exhaustion under serverless load
- Watch for TOCTOU in read-modify-write actions; prefer a single atomic update over read-then-write

## Data Fetching

- Server components fetch directly with Prisma
- Client components use Server Actions
- Validate all inputs with Zod

## Security

- Every Server Action: read the session, assert it exists, and scope all Prisma queries to `userId: session.user.id`. Never trust a client-supplied `userId`
- **Ownership on related writes:** when an action accepts arrays of foreign ids (e.g. `collectionIds`, `tagIds`), filter them to rows the user owns *before* writing join rows — scoping only the parent record is not enough. A client can post ids it doesn't own; resolve `findMany({ where: { id: { in: ids }, userId } })` and write only the returned ids (IDOR on join tables)
- No secrets, passwords, or API keys in source — read from env; keep `.env*` gitignored
- Validate required env vars at module load and throw loudly; never silently fall back to a weak default (e.g. a known demo password) when a security-relevant var is missing
- Fail loud over fail silent: prefer throwing at startup to surfacing an opaque error deep in a driver later
- bcrypt cost factor ≥ 14 for password hashing
- Bound every query (see Database) so a single request can't pull unbounded rows

## Error Handling

- Use try/catch in Server Actions
- Return `{ success, data, error }` pattern from actions
- Display user-friendly error messages via toast

## Code Quality

- No commented-out code unless specified
- No unused imports or variables
- Keep functions under 50 lines when possible
```
