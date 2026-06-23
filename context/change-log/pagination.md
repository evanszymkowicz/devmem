# Pagination

## What Was Built

Numbered pagination (with ellipsis windowing and prev/next) for the three listing views — `/items/[type]`, `/collections`, and `/collections/[id]` — backed by single-page DB queries. Centralized all page-size and dashboard-preview limits into one constants module.

### New Files

- `src/lib/db/limits.ts` — central home for `ITEMS_PER_PAGE = 21`, `COLLECTIONS_PER_PAGE = 21`, `DASHBOARD_COLLECTIONS_LIMIT = 6`, `DASHBOARD_RECENT_ITEMS_LIMIT = 10`. Replaces the scattered inline `MAX_*` literals so loaders and pages share one source of truth.
- `src/components/ui/pagination.tsx` — presentational server component (Next `<Link>`s, no client JS). Computes `prevPage`/`nextPage` as `number | null`, rendering disabled greyed `<span>`s when null and `<Link>`s otherwise. `getPageWindow()` builds the windowed list (first, last, current ±1, with `"ellipsis"` markers for gaps). Returns `null` when `totalPages <= 1`.

### Modified Files

- `src/lib/utils.ts` — added `parsePageParam(raw)` (clamps missing/non-numeric/`<1` to page 1) and `pageHref(basePath, page)` (page 1 → clean path, others → `?page=N`); the latter is the single source of truth for both pagination links and out-of-range redirects.
- `src/lib/db/items.ts` — `getItemsByType(userId, slug, page)` now returns `{ type, items, totalCount }`, fetching one page via `take`/`skip` plus a parallel `count` (replaced the old fetch-up-to-200). `getRecentItems` default now references `DASHBOARD_RECENT_ITEMS_LIMIT`. Removed `MAX_ITEMS_BY_TYPE`.
- `src/lib/db/collections.ts` — `getCollectionsWithTypes` gained a `skip` param; `getCollections(userId, page)` returns `{ collections, totalCount }`; `getCollectionWithItems(userId, id, page)` paginates the nested items and adds `totalItemCount` via `_count`; `getDashboardCollections` uses `DASHBOARD_COLLECTIONS_LIMIT`. Removed `MAX_COLLECTIONS`, `MAX_COLLECTION_ITEMS`, `MAX_DASHBOARD_COLLECTIONS`.
- `src/app/items/[type]/page.tsx`, `src/app/collections/page.tsx`, `src/app/collections/[id]/page.tsx` — each reads `searchParams.page` (a Promise in Next 16) via `parsePageParam`, passes it to its loader, derives `totalPages = max(1, ceil(total / perPage))`, redirects out-of-range pages to the last valid page via `pageHref`, shows the true total in the header, and renders `<Pagination>` below the grid.

## Design Decisions

- **Server component, URL-driven** — pagination is plain `<Link>` navigation with no client state, consistent with "server components by default"; works pre-hydration.
- **`null` for unavailable direction** — prev/next are `number | null`; null renders a disabled, `pointer-events-none` `<span>` instead of a link, satisfying the spec's "use NULL if not an option."
- **Bounded queries preserved** — every `findMany` keeps an explicit `take`; pagination tightened the bound (21) rather than removing it, and adds a parallel `count` for total-page math.
- **True totals in headers** — list headers count `totalCount`/`totalItemCount`, not the current page's row length.
- **Out-of-range redirect** — `totalPages` floors at 1, and any `?page=` beyond range redirects to the last valid page, so the empty state only shows when the total is genuinely zero.
- **Windowed page numbers** — first/last always shown, current ±1 in the middle, ellipsis for gaps, chosen over a full list to stay readable at any item count.
- **Scope** — also paginated the `/collections` grid (not just the two pages named in the spec) so `COLLECTIONS_PER_PAGE` has a real home; confirmed with the user.

## Verification

- `npm run build` ✓, 102 unit tests ✓, lint clean on all changed files.
- Browser-tested (temporary page size of 1 to force multiple pages with existing demo data): first/middle/last page states, disabled prev/next, ellipsis windowing on both sides, clean page-1 URLs, and out-of-range `?page=999` redirects on all three listings.

## Deferred

None.
