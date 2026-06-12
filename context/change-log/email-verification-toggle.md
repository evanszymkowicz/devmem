# Email Verification Toggle

## Summary

Added a single feature flag that turns the entire email-verification system on or
off, so it can be disabled while Resend has no verified domain (the dev sender,
`onboarding@resend.dev`, only delivers to the account owner — which otherwise blocks
everyone else from registering).

When **disabled**: registration creates the account but sends no email, and
email/password sign-in is no longer blocked on `emailVerified`, so unverified users
can sign in. When **enabled** (the default): behavior is unchanged from the
email-verification feature — send on register, block unverified sign-in, resend works.

No database migration or schema change — purely a code/config gate over existing logic.

## What was done

### Config module

- `src/lib/config/features.ts` (new) — exports
  `EMAIL_VERIFICATION_ENABLED = process.env.EMAIL_VERIFICATION_ENABLED !== "false"`.
  Defaults **ON**: only an explicit `"false"` disables it, so a missing var in
  production fails safe. Plain `process.env` read (no Node-only APIs) so the module
  stays edge-safe — it's pulled into the edge bundle transitively via `src/auth.ts`.

### Three gates

- `src/app/api/auth/register/route.ts` — the `issueAndSendVerification(...)` call is
  wrapped in `if (EMAIL_VERIFICATION_ENABLED)`. Account creation stays unconditional;
  when off, the user is created with `emailVerified: null` and no email is sent.
- `src/auth.ts` `authorize` — the sign-in gate is now
  `if (EMAIL_VERIFICATION_ENABLED && !user.emailVerified) throw new EmailUnverifiedError()`,
  so unverified accounts can sign in when verification is off. GitHub OAuth unaffected.
- `src/app/api/auth/resend-verification/route.ts` — the lookup + send are skipped when
  off, but the route still falls through to the identical generic 200, preserving its
  enumeration-safety from the client's perspective.

### Environment

- Appended `EMAIL_VERIFICATION_ENABLED=false` (with an explanatory comment) to the
  existing `.env`, on its own line. No new `.env*` files created; nothing else in `.env`
  was overwritten. `.env.production` left untouched — it can stay unset since the flag
  defaults ON.

## Verification

- `npm run build` and `npm run lint` pass clean.
- No unit tests added: the project has no test infrastructure (no `test` script /
  Vitest) and the workflow defers unit testing. The new code is boolean gates over
  existing logic, validated at the integration level instead.
- **Disabled-path tested end-to-end** (flag = `false`): registered an account via the
  API (201) → confirmed in the Neon dev branch that `emailVerified` was `null` and
  **zero** `verification_tokens` rows existed (no email sent) → signed in through the
  browser as the unverified user and reached `/dashboard`.
- Throwaway test account (`toggle-test-delete@example.com`) deleted from the Neon dev
  branch at completion (verified gone).

## Decisions

1. **Mechanism:** env var read once through a typed config module — chosen over a bare
   `process.env` read scattered across files and over a DB-backed runtime flag (rejected
   as overkill pre-launch: would need a migration, a query on the hot auth path, and a
   cache layer).
2. **Default ON:** a missing/unset var keeps verification enabled, so production fails
   safe; the dev `.env` opts out explicitly.
3. **No auto-verify when off:** registration still creates users with
   `emailVerified: null` — the flag only skips the *send* and the *sign-in gate*, not
   stamping accounts verified. Keeps this a pure gate with no side effects on the data.

## Deferred / follow-ups

- **Known tradeoff (by decision #3):** re-enabling the flag will lock out any account
  created during the off-window — its `emailVerified: null` starts failing the sign-in
  gate again — until that user verifies. Acceptable for the current pre-domain state;
  revisit if the flag is toggled back on after real signups exist.
- The pre-existing hardcoded sender / base-URL deferrals from the email-verification
  feature still stand (see `email-verification-on-register.md`).
