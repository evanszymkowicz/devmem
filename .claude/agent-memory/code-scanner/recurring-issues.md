---
name: recurring-issues
description: Real, recurring issue patterns and hotspots found in audits of this codebase
metadata:
  type: project
---

## Authorization gap in Server Actions

`src/actions/collections.ts` — `toggleCollectionFavorite` has no ownership check (no
session guard, no `userId` scoping). When auth is added, every Server Action must:
(1) read session, (2) assert session exists, (3) scope all Prisma queries to
`userId: session.user.id`. The read-modify-write pattern also has a TOCTOU race
(read isFavorite then write) — low impact pre-concurrent-users but worth noting.

**Why:** No auth is implemented yet, so today it's deferred; but the pattern of
writing actions without ownership guards must be corrected before auth ships.

## getSidebarCollections over-fetches for dominant color

`src/lib/db/collections.ts:85` — loads all items + their itemType joins for every
collection just to compute one color per collection. `Collection.defaultTypeId`
already exists in the schema and would solve this if populated during collection
creation. Until then this is an intentional known tradeoff (deferred per
current-feature.md).

## DEMO_PASSWORD fallback in seed.ts

`prisma/seed.ts:12` — `process.env.DEMO_USER_PASSWORD ?? "12345678"`. The env var
is correctly wired, but the hardcoded fallback `"12345678"` means a missing env
var silently seeds a known-weak password. In production seeds the env var must be
set; the fallback should either throw or be documented as dev-only.

## Session invalidation gap after password reset ⚠️ MUST FIX BEFORE LAUNCH

`src/app/api/auth/reset-password/route.ts` — password reset does not invalidate
existing sessions. App uses `strategy: "jwt"` so DB session rows don't apply;
revoking JWT sessions requires a per-user `sessionVersion` counter in the DB,
incremented on password change and checked on every JWT decode in the `jwt`
callback. Until then, an attacker who resets a user's password and then signs in
with the new password is racing against the victim's still-valid JWT.

**Fix:** Add a `sessionVersion Int @default(0)` column to the `User` model.
Increment it in `reset-password/route.ts` after the password update. In
`src/auth.ts` `jwt` callback, embed `sessionVersion` in the token; in the
`session` callback, re-fetch the user and reject (return null) if the stored
version doesn't match. This is the same pattern needed for any future
"sign out all devices" feature.

**Why:** Reported in forgot-password audit (2026-06-12). JWT strategy makes
server-side revocation non-trivial; deferring until pre-launch security pass
(roadmap step 14). **Must not ship to real users without this.**

## Join-table membership IDOR — check on any action taking arrays of foreign ids

When a Server Action accepts an array of foreign ids (e.g. `collectionIds`,
`tagIds`) and writes join rows (`ItemCollection`, etc.), scoping the *parent*
write to `userId` is NOT sufficient: a client can post ids for rows it doesn't
own. The action must resolve the ids against the user first —
`findMany({ where: { id: { in: ids }, userId }, select: { id } })` — and write
only the returned ids.

**Where to look:** `src/lib/db/items.ts` (`createItem`/`updateItem` membership
sync), and any future action that mutates many-to-many relations.

**Correctly handled example (do not re-flag):** `ownedCollectionIds()` in
`src/lib/db/items.ts` filters `collectionIds` to owned collections before the
nested create / `createMany`. Use it as the reference pattern.

## Previously resolved issues (do not re-flag)

- ForgotPasswordForm swallows non-OK fetch responses — RESOLVED (2026-06-12); `res.ok && json.success` check added, matches `ResetPasswordForm` pattern
- DATABASE_URL guard — RESOLVED in `src/lib/prisma.ts:6-7`
- getDemoUserId duplication / extra DB round-trips — RESOLVED; dashboard/page.tsx
  resolves once and passes userId as prop to all child components
- ICON_MAP duplication — RESOLVED; now a shared module at `src/lib/icon-map.ts`
- getPinnedItems unbounded query — RESOLVED; `take: MAX_PINNED_DISPLAY` (20) added
- StarOff icon on Favorite Collections stat card — RESOLVED; uses `Star` throughout
- Avatar initials empty-segment crash — RESOLVED; `.filter(Boolean)` guards it
