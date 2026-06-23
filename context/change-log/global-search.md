# Global Search / Command Palette

## What Changed

A ⌘K / Ctrl+K command palette for fuzzy-searching across all of a user's items
and collections, opening the existing item drawer or a collection page on select.
No schema changes — search reads the existing `Item`, `ItemType`, and `Collection`
models.

### 1. Data Layer

- **`src/lib/db/search.ts`** (new) — `getSearchData(userId)` runs two bounded,
  user-scoped queries in parallel (`MAX_SEARCH_ITEMS = 500`,
  `MAX_SEARCH_COLLECTIONS = 200`) and shapes them into `SearchData`
  (`items`, `collections`). A `toPreview()` helper picks the first non-empty of
  description → content → url, collapses whitespace/newlines, and truncates to 120
  chars with an ellipsis. Exposes `SearchItem` / `SearchCollection` / `SearchData`.
- **`src/actions/search.ts`** (new) — `getSearchData` server action: session guard
  (returns `Unauthorized` with no session/user id), delegates to the db function
  scoped to `session.user.id`, returns the `{ success, data | error }` shape.

### 2. UI

- **`src/components/ui/command.tsx`** (new, shadcn `cmdk`) — `Command*` primitives.
  `CommandDialog` extended to forward `filter` and `shouldFilter` to the underlying
  `Command` (the stock wrapper swallowed them).
- **`src/components/dashboard/SearchCommand.tsx`** (new) — the palette. Wraps itself
  in its own `ItemDrawerWrapper` so it works on every page without colliding with a
  page's drawer context. Pre-fetches search data on mount and refetches each time it
  opens (the shell stays mounted across navigations, so the set would otherwise go
  stale). Shows a "Loading…" row until data arrives, then grouped Items / Collections
  with type icon + colour and collection item counts. Selecting an item opens the
  drawer; a collection routes to `/collections/[id]`. Global ⌘K / Ctrl+K toggle.
- **`src/components/dashboard/TopBar.tsx`** — replaced the inert search `Input` with a
  `button` (preserving the search icon + ⌘K hint) that calls `onOpenSearch`.
- **`src/components/dashboard/DashboardShell.tsx`** — added `searchOpen` state, passes
  `onOpenSearch` to `TopBar`, renders `<SearchCommand>` with the shell's
  `collections`.
- **`package.json`** — added `cmdk` dependency.

### 3. Search Matching

- **`searchFilter`** in `SearchCommand.tsx` replaces cmdk's default subsequence
  scorer. Each row's `value` is just its id (stable dedup); the searchable text
  (title + preview, or collection name) is passed via `keywords`. The filter requires
  **every** whitespace-separated term to appear as a literal **substring** of the
  keywords (AND), case-insensitive; an empty query matches everything (browse mode).

## Key Decisions

- **Substring AND, not subsequence** — cmdk's built-in filter matched any row where
  the typed letters appeared in order anywhere in the value, so a common word like
  "test" returned nearly every item. Switched to per-term substring matching and moved
  the id out of the searchable text (into `value`) and the real text into `keywords`,
  which also killed the `item-`/`collection-` prefix false positives.
- **Prefetch on mount + refetch on open** — keeps the first open instant while
  preventing the prefetched set from going stale as items change, since the shell
  never unmounts across client navigations.
- **Own drawer context** — the palette mounts its own `ItemDrawerWrapper` rather than
  depending on a per-page one, so it behaves identically everywhere.
- **Reused existing patterns** — `ICON_MAP` for type icons, `SidebarCollection[]`
  threaded from the shell for the drawer, the standard action `{ success, data | error }`
  shape.

## Tests

- **`src/actions/search.test.ts`** (new) — the action: unauthorized (no session / no
  user id), happy path, query scoped to the session user id, db-throw → generic error.
- **`src/lib/db/search.test.ts`** (new) — the data layer: user-scoped bounded takes,
  field/count mapping, preview fallback priority (description → content → url),
  blank-candidate skipping, whitespace collapse, 120-char truncation, empty preview.
- 102/102 unit tests passing; `npm run build` clean.
- Browser-verified: ⌘K and click-to-open, "test" returning only the 3 matching items
  (not all 22), multi-word AND (`test image` → 1), preview-text matching
  (`production image` → the Dockerfile snippet via its description), `No results found.`
  on a gibberish query, and a collection match (`devops`) with its item count.

## Known Limitations / Deferred

- Search covers the bounded prefetched set (500 items / 200 collections); a user beyond
  those caps won't search rows past the limit. Matches the project's bounded-query rule;
  a server-side search would be the follow-up if needed.
- The `searchFilter` matching logic is verified manually in the browser rather than by a
  unit test, since it's UI-layer (cmdk integration). The db-side preview/shaping logic it
  consumes is unit-tested.
