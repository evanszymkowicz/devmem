# Email Verification on Register

## Summary

Added email verification for the email/password (Credentials) signup flow. After
registering, a user receives a Resend email with a unique, 24h, single-use link;
clicking it verifies the account and unblocks sign-in. Unverified users are blocked
at sign-in with a clear message and an inline resend option. GitHub OAuth users are
unaffected (the provider sets `emailVerified` via the adapter and never hits the
Credentials path).

No database migration was needed — the NextAuth `VerificationToken` model and
`User.emailVerified` field already existed in the schema.

## What was done

### Email delivery (Resend)

- Installed the `resend` SDK.
- `src/lib/email/resend.ts` — Resend client with a fail-loud env guard
  (`RESEND_API_KEY` validated at module load), the sender constant, and a
  `getAppBaseUrl()` helper for building absolute links.
- `src/lib/email/verification.ts` — builds the verify link and sends the email
  (plain inline-styled HTML template; throws on a Resend error).

### Token model

- `src/lib/auth/verification-token.ts`:
  - `createVerificationToken(email)` — generates a 32-byte random raw token, stores
    only its **SHA-256 hash** with a 24h expiry, and clears any prior tokens for that
    email first (so a resend supersedes earlier links). Returns the raw token.
  - `consumeVerificationToken(rawToken)` — looks up by hash, rejects unknown/expired
    (cleaning up the stale row), otherwise deletes the row (single-use) and returns
    the associated email.
  - `VERIFICATION_TOKEN_TTL_MS = 24h` constant.
- `src/lib/auth/send-verification.ts` — `issueAndSendVerification(email)`, the shared
  "issue token + send email" helper used by both the register and resend routes.

### Routes

- `POST /api/auth/register` — after creating the user, issues + sends the verification
  email. A delivery failure is logged but does **not** roll back the account (the user
  can use the resend path), so it still returns 201.
- `GET /api/auth/verify-email?token=…` — consumes the token, sets `emailVerified = now()`
  (via `updateMany` so a missing user can't throw), and redirects to the result page
  with a `?status=` flag (`success` / `expired` / `invalid` / `error`).
- `POST /api/auth/resend-verification` — enumeration-safe: validates the email with Zod,
  silently issues a fresh link only for a real, password-based, unverified account, and
  always returns the same generic `{ success, data }` 200 regardless of outcome.

### UI

- `src/app/(auth)/verify-email/page.tsx` — dedicated result page (in the `(auth)`
  route group, reusing the centered-card layout) with success / expired / invalid /
  error states and an inline resend form on the failure states.
- `src/components/auth/ResendVerificationForm.tsx` — client form posting to the resend
  route; shows a generic confirmation regardless of result.

### Sign-in gating

- `src/lib/auth/error-codes.ts` — `SIGN_IN_ERROR_CODE` constants, kept free of any
  `next-auth` import so they're safe to use in the client bundle.
- `src/lib/auth/errors.ts` — `EmailUnverifiedError extends CredentialsSignin` with a
  distinct `code`.
- `src/auth.ts` `authorize` — after the password check passes, throws
  `EmailUnverifiedError` when `emailVerified` is null.
- `src/components/auth/SignInForm.tsx` — reads the `code` from the `signIn` result,
  shows "Please verify your email before signing in." plus a "Resend verification
  email" link for the unverified case (generic "Invalid email or password." otherwise).

### Validation

- `src/lib/validations/auth.ts` — added `resendVerificationSchema`.

## Verification

- `npm run build` and `npm run lint` pass clean; all three new routes appear in the
  route table.
- Registration tested via curl: 201, user row created with `emailVerified = null`, and
  a token row stored as a 64-char SHA-256 hash with a ~24h expiry (confirmed in the
  Neon dev branch).
- Resend integration confirmed reaching the API (dev-mode `onboarding@resend.dev` only
  delivers to the account owner, which the register route logged and handled gracefully
  without failing the registration).
- **User-verified the live flow end-to-end** with their own email: verify link set
  `emailVerified` and redirected to the success page; sign-in was blocked while
  unverified and succeeded after verification.

## Decisions

1. **Token:** 24h expiry, single-use, stored hashed (SHA-256) — raw token only in the
   email link.
2. **Sender:** `onboarding@resend.dev` (dev mode; only delivers to the account owner).
3. **Result UX:** dedicated `/verify-email` result page with inline resend.

## Deferred / follow-ups

- **Hardcoded sender** (`onboarding@resend.dev`) in `src/lib/email/resend.ts` — move to
  an env var (e.g. `RESEND_FROM_EMAIL`) backed by a verified domain before real users.
  (The user declined adding new env vars during the build, so the sender and base-URL
  fallback were hardcoded for now.)
- **Hardcoded base-URL fallback** (`http://localhost:3000`) in `getAppBaseUrl()` —
  ensure `AUTH_URL`/`NEXTAUTH_URL` is set in production so links aren't localhost.
- The curl test account (`verifytest@example.com`) and its token were removed from the
  Neon dev branch at completion. The live-test account (`evan.szy@gmail.com`) is a real
  verified user and was intentionally kept.
