# Rate Limiting for Auth

## Summary

Added sliding-window rate limiting to all five authentication endpoints using
Upstash Redis + `@upstash/ratelimit`. Protects against brute-force, credential
stuffing, and email-sender abuse. Fails open if Redis is unavailable — a Redis
outage never blocks a legitimate request.

## What was done

### Packages

- Installed `@upstash/ratelimit@^2.0.8` and `@upstash/redis@^1.38.0`.

### Rate-limit utility

- `src/lib/rate-limit.ts` (new) — shared module:
  - `createRedis()` — lazily creates the Upstash Redis client from env vars;
    returns `null` if either var is absent (fail-open path).
  - `makeLimiter(requests, window)` — wraps `Ratelimit.slidingWindow`; returns
    `null` when Redis is unconfigured.
  - Five named per-endpoint `Ratelimit | null` exports: `loginLimiter`,
    `registerLimiter`, `forgotPasswordLimiter`, `resetPasswordLimiter`,
    `resendVerificationLimiter`.
  - `getIp(request)` — extracts the first value from `x-forwarded-for` (Vercel)
    or falls back to `"unknown"`.
  - `checkRateLimit(limiter, key)` — calls `limiter.limit(key)`; catches all
    errors and returns `{ limited: false }` so Redis failures are never
    propagated to callers. Returns `{ limited: true, retryAfter }` (seconds)
    on a hit.
  - `rateLimitResponse(retryAfter)` — returns a `NextResponse` with status 429,
    `Retry-After` header, and a human-readable "Too many attempts. Please try
    again in X minutes." JSON body.

### Error types

- `src/lib/auth/error-codes.ts` (modified) — added `RATE_LIMITED: "rate-limited"`.
- `src/lib/auth/errors.ts` (modified) — added `RateLimitError extends CredentialsSignin`
  with `code = SIGN_IN_ERROR_CODE.RATE_LIMITED`, following the same pattern as
  `EmailUnverifiedError`.

### Login (authorize callback)

- `src/auth.ts` (modified) — `authorize` now accepts the `request` second
  argument. Immediately after parsing credentials, extracts the IP and checks
  `loginLimiter` keyed on `login:<ip>:<email>` (5 attempts / 15 min). Throws
  `RateLimitError` on a hit, which NextAuth surfaces as `result.code` in the
  client. The check runs before any DB query so rejected attempts don't touch
  the database.

### Route handlers (4 endpoints)

| Endpoint | Limit | Window | Key |
|---|---|---|---|
| `POST /api/auth/register` | 3 | 1 h | `register:<ip>` |
| `POST /api/auth/forgot-password` | 3 | 1 h | `forgot-password:<ip>` |
| `POST /api/auth/reset-password` | 5 | 15 min | `reset-password:<ip>` |
| `POST /api/auth/resend-verification` | 3 | 15 min | `resend-verification:<ip>:<email>` |

`register`, `forgot-password`, and `reset-password` check at the very top of
the handler before parsing the body. `resend-verification` checks after parsing
(needs the email for the composite key). All four return `rateLimitResponse`
immediately on a hit.

### Frontend

- `src/components/auth/SignInForm.tsx` (modified) — added `RATE_LIMITED` branch
  in the `result.code` check; shows "Too many sign-in attempts. Please try again
  in a few minutes." as an inline error (consistent with existing inline-error
  UX for this form).

- `src/components/auth/ForgotPasswordForm.tsx` (modified) — the `!res.ok`
  branch now passes `json.error` to `toast.error` (was hardcoded to a generic
  fallback), so the "Too many attempts" message from the API is shown correctly.

- `src/components/auth/ResendVerificationForm.tsx` (modified) — `fetch` response
  is now checked. Status 429 is handled explicitly: parses `json.error` and
  shows a toast. All other status codes fall through to the generic success
  confirmation to preserve enumeration-safety.

### Environment

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` added to `.env`
  (already present when implementation started — user had added them in advance).

## Verification

- `npm run build` and TypeScript pass clean.
- All 16 routes compile; no type errors.

## Decisions

1. **Fail open:** Redis unavailability (env vars missing, network error, or
   `limit()` throwing) always returns `{ limited: false }`. Auth is never
   blocked because the rate-limit backend is down.
2. **Login via `authorize`, not middleware:** `/api/auth/callback/credentials`
   is NextAuth-owned; we can't create a competing route handler. The `authorize`
   callback receives the `Request` object in NextAuth v5, making IP extraction
   straightforward. Middleware would require parsing a streamed body.
3. **Rate limit before DB:** the login check runs before `prisma.user.findUnique`,
   so a brute-forcing attacker doesn't trigger database load per attempt once
   the limit is hit.
4. **`resend-verification` returns real 429:** the endpoint is normally
   enumeration-safe (always 200), but 429 for rate limiting is acceptable — it
   reveals that the caller is sending too many requests, not whether the account
   exists. The frontend only surfaces 429 explicitly and treats everything else
   as success, maintaining enumeration-safety for non-rate-limited paths.
5. **Composite key (IP + email) for login and resend:** tighter per-user limits
   without penalising other users on the same IP (shared NAT, corporate proxy).

## Deferred / follow-ups

None introduced by this feature.
