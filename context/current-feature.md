# Current Feature

## Status

In Progress

## Goals

DRY refactor — eliminate the five high-priority duplication patterns surfaced by the
refactor-scanner across the `actions`, `app/api`, `lib`, and `components` layers.
Each one encodes a security/validation invariant, so consolidating them removes
real drift risk (the auth-guard messages and the 401 response shapes had already
diverged).

## TODOs

1. **Action auth guard + Pro gate** — add `requireUserId({ requirePro })` in
   `src/lib/actions.ts`; refactor `items`, `collections`, `ai`, `search`, `profile`,
   `editor-preferences` actions onto it. Normalize the divergent
   "Not authenticated" message to "Unauthorized" (update the 2 affected tests).
2. **API session guard** — add `requireApiSession()` in `src/lib/api/session.ts`;
   refactor the 5 protected routes (`download`, `items`, `upload`, `stripe/checkout`,
   `stripe/portal`). Normalizes `download`'s plain-text 401 to JSON.
3. **API body parsing** — add `parseJsonBody()` in `src/lib/api/parse-body.ts`;
   refactor the 4 auth POST routes (`register`, `forgot-password`, `reset-password`,
   `resend-verification`) onto it.
4. **Hashed-token lifecycle** — add `src/lib/auth/hashed-token.ts`
   (`issueHashedToken` / `consumeHashedToken`, shared TTL + SHA-256 hashing);
   refactor `reset-token.ts` and `verification-token.ts` to thin wrappers.
5. **Slug Sets** — replace the re-hardcoded `FILE_TYPE_SLUGS` / `LANGUAGE_TYPE_SLUGS`
   literals in `ItemDrawer.tsx` and `ItemDrawerViewBody.tsx` with imports from
   `@/lib/validations/items` (removes a Pro-gating/content-shape drift risk).

## Notes

- Behavior-preserving except for two intentional normalizations: action auth error
  → "Unauthorized" everywhere; API 401 → JSON `{ error: "Unauthorized" }` everywhere.
- Token consolidation keeps reset's `reset:` namespace guard via the `accept`
  predicate, and preserves the accept-before-expiry ordering of the original.

## History

- Security & Quality Audit
- Phase 1: Foundation Layout
- Phase 2: Sidebar
- Phase 3: Main Area
- Prisma 7 + Neon PostgreSQL setup
- Seed sample data
- Dashboard Collections (real data)
- Dashboard Items (real data)
- Stats & Sidebar (real data)
- Pro Badge in Sidebar
- Code Quality Quick Wins
- Auth Phase 1: NextAuth v5 + GitHub OAuth
- Auth Phase 2: Credentials provider + registration API
- Auth Phase 3: Auth UI (sign in, register, sign out)
- Email Verification on Register
- Email Verification Toggle
- Forgot Password (reset via email link)
- Rate Limiting for Auth
- Profile Page
- Fix GitHub OAuth Redirect
- Items List View
- Item List Three-Column Layout
- Vitest Unit Testing Setup
- Item Drawer
- Item Drawer Edit Mode
- Item Delete
- Item Create
- Code Editor (Monaco)
- Markdown Editor
- File Upload with Cloudflare R2
- File List View
- Collections & Settings
- Global Search/Command Palette
- Pagination
- Editor Preferences Settings
- Favorites Page
- Pinned Items
- Favorite Toggle Buttons
- Favorites Page Client-Side Sorting
- Marketing Homepage Mockup
- Marketing Homepage Functionality
- UI Polish & Accessibility Fixes
- Auth Pages Marketing Nav
- Stripe Integration Phase 1: Core Infrastructure
- Stripe Integration Phase 2: Webhooks, Feature Gating & UI
- Upgrade Button & Page
- AI Auto-Tagging (language dropdown + tag suggestions)
- AI Description Generator
- AI Explain Code
- AI Prompt Optimizer
- UI Polish (Auth Layout + Footer Cleanup)
