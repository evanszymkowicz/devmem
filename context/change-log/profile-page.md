# Profile Page

## What Was Built

Full `/profile` page for authenticated users, covering account info, usage stats, password management, and account deletion.

### New Files

- `src/app/profile/page.tsx` — SSR page; reads session, redirects to `/sign-in` if unauthenticated, fetches profile data and sidebar data in parallel via `Promise.all`, passes everything to server-rendered layout
- `src/lib/db/profile.ts` — `getProfileData(userId)`: single DB round-trip (parallel `findUniqueOrThrow` + `itemType.findMany` with `_count` + `collection.count`); returns `ProfileData` including `hasPassword` flag, `totalItems`, `totalCollections`, and `itemsByType` sorted in canonical sidebar order via `SYSTEM_TYPE_ORDER`
- `src/actions/profile.ts` — two Server Actions:
  - `changePassword`: reads session, validates with `changePasswordSchema`, verifies current password via `verifyPassword`, hashes new password with `hashPassword`, updates the user row; returns `{ success, error }`
  - `deleteAccount`: reads session, deletes the user row (cascade handles all related data), returns `{ success, error }`
- `src/components/profile/ChangePasswordForm.tsx` — client component; three password fields (current, new, confirm) with client-side validation and server-side error surfacing via toast; only rendered when `profile.hasPassword` is true
- `src/components/profile/DeleteAccountDialog.tsx` — client component; "Delete account" button opens an inline confirmation dialog (custom modal, no extra library); on confirm calls `deleteAccount()` then `signOut({ redirectTo: "/sign-in" })`

### Modified Files

- `src/lib/validations/auth.ts` — added `changePasswordSchema` (currentPassword required, newPassword ≥ 8 chars and ≤ 72 bytes, confirmPassword matches)
- `src/lib/db/items.ts` — exported `SYSTEM_TYPE_ORDER` constant so `profile.ts` can reuse it for type sort order without duplication
- `src/proxy.ts` — added `/profile` to the protected route matcher so unauthenticated users are redirected to `/sign-in`

## Design Decisions

- **SSR page + client leaf components** — page is a server component that fetches all data; only the two interactive forms are `"use client"`, consistent with the rest of the codebase
- **`hasPassword` flag** — `getProfileData` returns a boolean derived from `user.password !== null` so the page never exposes the hash to the client; `ChangePasswordForm` is conditionally rendered based on this flag, hiding it from GitHub OAuth-only users
- **Custom confirmation dialog** — `DeleteAccountDialog` uses a simple inline modal rather than shadcn `AlertDialog` to avoid pulling in another dependency; visually consistent with the rest of the dark-mode UI
- **No migration** — all fields (`password`, `createdAt`, `image`, etc.) already existed in the schema; the profile data query is purely read-based

## Deferred

- JWT session invalidation after password change (same gap as the forgot-password flow — requires a `sessionVersion` counter; tracked in `recurring-issues.md` as MUST FIX BEFORE LAUNCH)
