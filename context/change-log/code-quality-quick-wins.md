# Code Quality Quick Wins

Low-risk cleanup items surfaced by a full codebase audit (the `code-scanner`
agent). No new features, no auth changes — internal correctness and
maintainability only.

## What Changed

- **`DATABASE_URL` startup guard** — `src/lib/prisma.ts` reads
  `process.env.DATABASE_URL` and throws `"DATABASE_URL is not set"` before
  constructing the Neon adapter, so a missing env var fails loudly instead of
  surfacing as an opaque adapter error.
- **`StarOff` → `Star` on stat card** — `src/components/dashboard/StatsCards.tsx`
  now uses the `Star` icon for both "Favorite Items" and "Favorite Collections".
- **Avatar initials guard** — `Avatar` in `src/components/dashboard/Sidebar.tsx`
  derives initials with `.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2)`,
  so empty name segments (double/leading/trailing spaces) can't produce
  `undefined[0]`.
- **Shared `ICON_MAP`** — extracted to `src/lib/icon-map.ts` (typed
  `Record<string, LucideIcon>`) and consumed by `CollectionCard`, `ItemRow`, and
  `Sidebar`, removing three duplicate inline icon maps.
- **Resolve demo user once** — `src/app/dashboard/page.tsx` resolves the demo
  user a single time and passes `userId` as a prop into `StatsCards`,
  `RecentCollections`, `PinnedItems`, and `RecentItems`, eliminating 4 duplicate
  per-render DB round-trips. Components accept `userId: string | null` and render
  empty/zero state when null.
- **Bounded pinned query** — `getPinnedItems` in `src/lib/db/items.ts` now uses
  `take: MAX_PINNED_DISPLAY` (20) to prevent unbounded result sets.
- **Demo password out of source** — `prisma/seed.ts` reads
  `process.env.DEMO_USER_PASSWORD ?? "12345678"`; the real password lives in the
  gitignored `.env` (confirmed via `git check-ignore` / `git ls-files`).

## Deferred (intentionally not done)

- Ownership check in `toggleCollectionFavorite` — waits on NextAuth (roadmap
  step 3).
- TOCTOU race in `toggleCollectionFavorite` — low impact until concurrent users
  exist.
- `getSidebarCollections` over-fetch — depends on `defaultTypeId` being
  populated, a schema/migration task.

## Verification

- All 7 goals confirmed present in the committed code.
- `.env` / `.env.local` confirmed gitignored and untracked.
- `npm run build` passes (also see `fix-next-swc-binary.md` — the build
  toolchain was repaired on this branch by moving off the broken
  `next@16.3.0-preview.0` pin to `16.2.9`).
