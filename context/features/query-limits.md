# Query Limits Spec

## Overview

Ensure every `findMany` call in the codebase has an explicit `take` cap so
no query can return an unbounded number of rows, and consolidate all limit
constants into a single file.

## Problem

Several DB functions accept caller-supplied `limit` params or have no cap at
all. Without guards, a single request can pull arbitrarily large result sets
from Neon, bloating the server render payload and slowing the page.

## Requirements

### Consolidate constants
- Create `src/lib/db/limits.ts` exporting named constants:
  ```ts
  export const MAX_DASHBOARD_COLLECTIONS = 6;
  export const MAX_SIDEBAR_COLLECTIONS = 50;
  export const MAX_PINNED_DISPLAY = 20;
  export const MAX_RECENT_ITEMS = 10;
  ```
- Replace the inline constants in `collections.ts` and `items.ts` with
  imports from `limits.ts`

### Guard caller-supplied params
- In `getRecentItems(userId, limit = 10)`, apply
  `take: Math.min(limit, MAX_RECENT_ITEMS)` so callers cannot exceed the cap

### Audit remaining queries
- Review every `findMany` in `src/lib/db/` and `scripts/test-db.ts` for a
  missing `take`; add one where absent

## References

- `src/lib/db/collections.ts`
- `src/lib/db/items.ts`
- `scripts/test-db.ts`
