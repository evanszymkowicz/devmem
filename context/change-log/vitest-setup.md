# Vitest Unit Testing Setup

## What was done

Configured Vitest for unit testing server actions and utilities. No component tests — scope is intentionally limited to `.test.ts` files only.

## Files changed

- `package.json` — added `vitest` + `vite-tsconfig-paths` as devDependencies; added `test` and `test:watch` scripts
- `vitest.config.ts` (new) — `environment: "node"`, `include: ["src/**/*.test.ts"]`, `resolve.tsconfigPaths: true`
- `context/ai-interaction.md` — updated step 4 to include `npm test` before `npm run build`

## Files added

- `src/lib/validations/auth.test.ts` — 13 tests covering `signInSchema`, `registerSchema`, `resetPasswordSchema`, `changePasswordSchema`
- `src/actions/profile.test.ts` — 8 tests covering `changePassword` and `deleteAccount` server actions

## Key decisions

**`environment: "node"`** — server actions and utilities have no DOM dependency; jsdom would be unnecessary overhead.

**`vi.mock('@/lib/prisma')` hoisting** — Vitest hoists `vi.mock()` calls before imports, so the startup guard in `prisma.ts` (`if (!DATABASE_URL) throw`) never executes during tests. No test `.env` file is needed.

**`resolve.tsconfigPaths: true`** — Vite 6+ resolves `@/*` aliases natively from `tsconfig.json` without a plugin, eliminating the `vite-tsconfig-paths` warning.

## Test conventions going forward

- Test files live next to the module they test: `src/actions/foo.test.ts` tests `src/actions/foo.ts`
- Mock all external dependencies (prisma, auth, third-party clients) — never hit real DB or network in unit tests
- Use `vi.clearAllMocks()` in `beforeEach` to reset mock state between tests
- Cast mocked return values with `as never` when TypeScript overloads make direct typing awkward (e.g. `auth()`)
