# DRY Refactor — High-Priority Duplication

Consolidated the five high-priority duplication patterns surfaced by the
`refactor-scanner` agent. Each encoded a security/validation invariant whose copies
had begun to drift, so the goal was a single source of truth per pattern.

## What was done

### New shared helpers
- `src/lib/actions.ts` — `requireUserId({ requirePro })`: reads the session, asserts
  auth, optionally gates Pro. Returns a discriminated `{ ok, userId, isPro } | { ok, error }`.
- `src/lib/api/session.ts` — `requireApiSession()`: API-route mirror of the above;
  returns `{ userId }` or a 401 `NextResponse`.
- `src/lib/api/parse-body.ts` — `parseJsonBody(request, schema)`: JSON parse + Zod
  validation, returning typed data or a 400 `NextResponse`.
- `src/lib/auth/hashed-token.ts` — `issueHashedToken` / `consumeHashedToken` +
  `HASHED_TOKEN_TTL_MS`: the SHA-256-hashed, single-use, expiring token lifecycle.

### Refactored onto the helpers
- **Action auth guard (#1)** — `items`, `collections`, `ai`, `search`, `profile`,
  `editor-preferences` actions (16 inlined guards removed).
- **API session guard (#1)** — `download/[id]`, `items/[id]`, `upload`,
  `stripe/checkout`, `stripe/portal` routes.
- **API body parsing (#2)** — `register`, `forgot-password`, `reset-password`,
  `resend-verification` routes (~22 duplicated lines each removed).
- **Pro gate (#3)** — folded into `requireUserId({ requirePro: true })` in the 4 AI actions.
- **Token lifecycle (#4)** — `reset-token.ts` and `verification-token.ts` reduced to
  thin wrappers over `hashed-token.ts`. Reset keeps its `reset:` namespace + replay
  guard via the `accept` predicate; accept-before-expiry ordering preserved.
- **Slug Sets (#5)** — `ItemDrawer.tsx` and `ItemDrawerViewBody.tsx` now import
  `FILE_TYPE_SLUGS` / `LANGUAGE_TYPE_SLUGS` from `@/lib/validations/items` instead of
  re-declaring local literals (removes a Pro-gating/content-shape drift risk).

### Intentional normalizations (the drift being fixed)
- Action auth error is now `"Unauthorized"` everywhere (was `"Not authenticated"` in
  `profile` and `editor-preferences`). Updated those two unit tests to match.
- The download route's plain-text 401 is now JSON `{ error: "Unauthorized" }`, matching
  every other protected route.

## Verification
- `npx tsc --noEmit`: clean
- `npm test`: 192/192 pass
- `npm run build`: succeeds
- `npm run lint`: only pre-existing errors/warnings in untouched files
  (`FileListRow.tsx`, `<img>` usage); no new issues introduced.
