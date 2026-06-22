# Security & Quality Audit

Full-codebase code-scanner audit followed by fixes for all findings plus upload rate limiting.

## Security Fixes (High)

**Open redirect via unvalidated `callbackUrl`** (`src/components/auth/SignInForm.tsx`)
- `callbackUrl` is now validated before `router.push`: must start with `/` and not `//`
- Falls back to `/dashboard` for any external or protocol-relative URL

**IDOR — `toggleCollectionFavorite` had no auth or ownership check** (`src/actions/collections.ts`)
- Added `auth()` session guard at the top of the action
- Both the `findUnique` and `update` queries now scope to `userId: session.user.id`

**IDOR — `fileUrl` not scoped to calling user** (`src/actions/items.ts`)
- After Zod parse in `createItem`, `fileUrl` is now validated to start with `users/${session.user.id}/`
- Prevents a client from submitting another user's R2 key and gaining read access via the download proxy

## Security Fixes (Medium)

**Rate limit bypass on malformed requests** (`src/app/api/auth/resend-verification/route.ts`)
- Rate limit check moved to before `req.json()` — malformed requests no longer bypass it
- Changed to IP-only key (consistent with all other auth endpoints; email isn't available pre-parse)

**`deleteAccount` orphaned R2 files** (`src/actions/profile.ts`)
- Before deleting the user row, all file items with a `fileUrl` are fetched
- After the DB delete, `deleteFromR2` is called for each via `Promise.allSettled` with `.catch()` so R2 failure never blocks the user
- Whole function now wrapped in try/catch returning the standard `{ success, error }` pattern

## Upload Rate Limiting (New)

- Added `uploadLimiter` to `src/lib/rate-limit.ts`: 10 requests per hour sliding window
- `POST /api/upload` applies the limiter keyed on `upload:${ip}:${userId}` immediately after auth check
- Prevents presigned URL generation abuse; fails open if Redis is unconfigured

## Code Quality Fixes

**`MACOS_DOTS` constant duplicated** (`src/components/ui/code-editor.tsx`, `src/components/ui/markdown-editor.tsx`)
- Extracted to `src/lib/editor-constants.ts` along with `EDITOR_MIN_HEIGHT` and `EDITOR_MAX_HEIGHT`
- Both editor components now import from the shared module

**`formatDate` defined 3× with inconsistent options** (`ItemCard`, `FileListRow`, `ItemRow`)
- Extracted to `src/lib/format-date.ts` with three named exports:
  - `formatDateShort` → `"Jan 15"` (used by `ItemCard`, `ItemRow`)
  - `formatDateWithYear` → `"Jan 15, 2024"` (used by `FileListRow`)
  - `formatDateLong` → `"January 15, 2024"` (used by `ItemDrawerViewBody`)
- Local `formatDate` functions removed from all three components

**`fileSize` falsy check** (`src/lib/validations/items.ts`)
- `if (!data.fileSize)` changed to `if (data.fileSize == null)` — correctly distinguishes "not provided" from a zero-byte file

**`ItemDrawer` was 630 lines handling too many concerns** (`src/components/items/ItemDrawer.tsx`)
- Split into three new files:
  - `src/components/items/item-drawer-types.ts` — `EditState` interface + `itemToEditState` helper
  - `src/components/items/ItemDrawerViewBody.tsx` — view mode body sections
  - `src/components/items/ItemDrawerEditBody.tsx` — edit mode body sections
- `ItemDrawer.tsx` reduced to ~260 lines covering state, handlers, Sheet structure, header, action bar, and loading skeleton

## Tests

- `src/actions/profile.test.ts` updated: added `prisma.item.findMany` mock and `@/lib/r2` mock for the `deleteAccount` test
- 90/90 tests passing; `npm run build` clean
