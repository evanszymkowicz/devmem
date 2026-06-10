# Implement Code Scan Changes #2

Follow-up quality improvements from code-scanner audit. Focuses on UX fixes,
accessibility, and query optimization — no new features.

## What Changed

- **CollectionCard navigation refactor** — `src/components/dashboard/CollectionCard.tsx`
  switched from a wrapping `<Link>` to an overlay pattern with an absolute-positioned
  link sitting beneath the card's interactive elements. Removes the need for
  `e.preventDefault()` calls on buttons, improves accessibility with `focus-within`
  ring on the container, and ensures clicks on the card navigate while clicks on
  buttons (favorite, more actions) stay local via `pointer-events-none` on the card
  and `pointer-events-auto` on the action button group.

- **Favorite Collections icon update** — `src/components/dashboard/StatsCards.tsx`
  uses `FolderHeart` instead of `Star` for the "Favorite Collections" stat card,
  providing better semantic clarity (star was already used for "Favorite Items").

- **RecentItems early return** — `src/components/dashboard/RecentItems.tsx` returns
  `null` when no recent items exist, preventing an empty section from rendering.

- **DATABASE_URL check timing** — `scripts/test-db.ts` moved the `process.env.DATABASE_URL`
  guard from inside `main()` to module load time, catching config errors at startup
  rather than query time.

- **Sidebar collections pagination** — `src/lib/db/collections.ts` added
  `take: MAX_SIDEBAR_COLLECTIONS` (50) to `getSidebarCollections` query to prevent
  unbounded fetches when a user has many collections.

- **Memory audit update** — `.claude/agent-memory/code-scanner/recurring-issues.md`
  marked 6 previously-resolved issues as completed and refined the language around
  the authorization gap (noting the TOCTOU race condition explicitly).

## Verification

- All changes confirmed present in working tree.
- Navigation overlay pattern tested: clicking card navigates, clicking star/actions
  stays local.
- `npm run build` passes.
- `npm run lint` passes.
