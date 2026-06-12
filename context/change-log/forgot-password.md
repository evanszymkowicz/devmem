# Forgot Password

## Summary

Added a complete forgot-password / reset-password flow for email/password accounts.
Users can request a reset link from the sign-in page, receive a 24-hour single-use
email link, and set a new password. Reuses the existing `VerificationToken` Prisma
model — no migration, no schema change.

## What was done

### Token layer

- `src/lib/auth/reset-token.ts` (new) — `createResetToken` / `consumeResetToken`.
  Stores only the SHA-256 hash of a 32-byte random token (raw token lives in the
  emailed link only). Namespaces the `identifier` column as `reset:<email>` so reset
  tokens and email-verification tokens never clobber each other in the shared table.
  `consumeResetToken` rejects any token whose identifier doesn't start with `reset:`
  (cross-flow replay protection). Single-use: consumed tokens are deleted immediately.
  Prior reset tokens for the same email are purged on re-request.

- `src/lib/auth/send-password-reset.ts` (new) — `issueAndSendPasswordReset(email)`:
  issues a token and sends the reset email. Mirrors the existing
  `send-verification.ts` pattern.

### Email

- `src/lib/email/password-reset.ts` (new) — Resend send function with a plain
  inline-styled HTML template. Link points to `/reset-password?token=…` (a page,
  not a GET route, since the user must enter a new password). Mirrors
  `email/verification.ts`.

### Validation

- `src/lib/validations/auth.ts` (modified) — added `forgotPasswordSchema` (email
  only) and `resetPasswordSchema` (token + password + confirmPassword with passwords-
  match refine and 8–72 char bounds). Token validated as a 64-char lowercase hex
  string matching the actual format. Added `ForgotPasswordInput` and
  `ResetPasswordInput` type exports.

### API routes

- `src/app/api/auth/forgot-password/route.ts` (new) — `POST`. Enumeration-safe:
  looks up the user, only sends for a real password-based account (OAuth-only
  accounts silently no-op), always returns the same generic 200 regardless of
  outcome. Delivery failure logged internally, never surfaced to the client.

- `src/app/api/auth/reset-password/route.ts` (new) — `POST`. Consumes the reset
  token first (single-use, rejects invalid/expired tokens with 400 before touching
  any password). Hashes the new password with bcrypt (cost 14, via shared
  `src/lib/auth/password.ts`). For unverified users, stamps `emailVerified: now`
  alongside the password update in a single `updateMany` (completing a reset proves
  inbox control). Already-verified users' timestamp is left unchanged.

### UI components

- `src/components/auth/ForgotPasswordForm.tsx` (new) — client component. Submits to
  `forgot-password` endpoint; checks `res.ok && json.success` before setting sent
  state (avoids a false "link sent" confirmation on server error). Shows generic
  confirmation state on success.

- `src/components/auth/ResetPasswordForm.tsx` (new) — client component. Accepts
  `token` prop from the page. Client-side passwords-match check mirrors server Zod
  rules for instant feedback. On success: success toast + redirect to `/sign-in`.
  Inline error display on API rejection (expired/invalid token).

### Pages (under `(auth)` route group)

- `src/app/(auth)/forgot-password/page.tsx` (new) — renders `ForgotPasswordForm`.
- `src/app/(auth)/reset-password/page.tsx` (new) — reads `token` from `searchParams`;
  shows "Invalid reset link" state with a `/forgot-password` link if token is absent;
  otherwise renders `ResetPasswordForm` with the token passed as a prop.

### Sign-in link

- `src/components/auth/SignInForm.tsx` (modified) — "Forgot password?" link added
  right-aligned next to the Password label, pointing to `/forgot-password`.

## Verification

- `npm run build` and `npm run lint` pass clean.
- Browser-tested: "Forgot password?" link present on sign-in; `/forgot-password`
  renders and shows generic confirmation for both existent and non-existent emails
  (enumeration safety confirmed); `/reset-password` without a token shows the
  invalid-link state; mismatched passwords show inline client-side error; valid token
  + matching passwords redirected to `/sign-in`.
- DB confirmed: test reset token inserted into Neon dev branch and consumed on
  submit; demo user password restored to original after test.

## Decisions

1. **Token namespace:** `reset:<email>` in `identifier` rather than a separate table
   or a `purpose` column — zero migration cost, the uniqueness constraint on `token`
   keeps lookups unambiguous, and the prefix check in `consumeResetToken` prevents
   cross-flow replay.
2. **Link → page, not API GET:** the reset link goes to `/reset-password?token=` (a
   page) rather than a direct API endpoint. Unlike email verification (a single
   server-side action), password reset requires user input, so a page is the right
   surface.
3. **Stamp `emailVerified` on reset:** a user who completes a reset has demonstrated
   control of the inbox — functionally equivalent to clicking a verification link.
   Already-verified timestamps are left untouched.
4. **`EMAIL_VERIFICATION_ENABLED` doesn't gate this flow:** password reset is a
   separate concern and must always be available.

## Deferred / follow-ups

- **Session invalidation after password reset** — `strategy: "jwt"` means existing
  sessions can't be revoked via `session.deleteMany`. Hardening requires a
  `sessionVersion` counter on `User`, incremented on password change and checked in
  the `jwt`/`session` callbacks. Tracked in
  `.claude/agent-memory/code-scanner/recurring-issues.md` as **MUST FIX BEFORE
  LAUNCH**.
- **Resend dev-sender limitation** (pre-existing) — `onboarding@resend.dev` only
  delivers to the account owner. Reset emails share this limitation with verification
  emails until a verified domain is configured.
- **No rate limiting** on `POST /api/auth/forgot-password` (v1, explicitly deferred).
