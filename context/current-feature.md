# Current Feature: Stripe Integration — Phase 1: Core Infrastructure

## Status

Not Started

## Goals

- Stripe client initialized and validated at module load (throws if env vars missing)
- Session carries `isPro` everywhere, synced from DB on every JWT validation
- Free-tier limits defined as named constants (`FREE_TIER_ITEM_LIMIT = 50`, `FREE_TIER_COLLECTION_LIMIT = 3`)
- `getUserUsage`, `isItemLimitReached`, `isCollectionLimitReached` unit-tested with Vitest (12 cases, Prisma mocked)
- Checkout API route ready (`POST /api/stripe/checkout`)
- Customer Portal API route ready (`POST /api/stripe/portal`)

## TODOs

### New Files
- [ ] `src/lib/stripe.ts` — Stripe SDK init, export client + price-ID constants, throw on missing env vars
- [ ] `src/lib/db/usage-limits.ts` — `getUserUsage`, `isItemLimitReached`, `isCollectionLimitReached`
- [ ] `src/lib/db/usage-limits.test.ts` — 12 Vitest unit tests (Prisma mocked)
- [ ] `src/app/api/stripe/checkout/route.ts` — Create Stripe Checkout session
- [ ] `src/app/api/stripe/portal/route.ts` — Create Stripe Customer Portal session

### Modified Files
- [ ] `src/lib/db/limits.ts` — Append `FREE_TIER_ITEM_LIMIT = 50` and `FREE_TIER_COLLECTION_LIMIT = 3`
- [ ] `src/types/next-auth.d.ts` — Add `isPro: boolean` to `Session` and `JWT`
- [ ] `src/auth.ts` — Async JWT callback syncing `isPro` from DB; session callback passes `isPro`
- [ ] `.env.example` — Append Stripe + `NEXT_PUBLIC_APP_URL` vars

### Install
- [ ] `npm install stripe`
- [ ] Pin `apiVersion` in `src/lib/stripe.ts` after checking `node_modules/stripe/src/stripe.core.ts`

## Notes

- Prerequisites: Stripe Dashboard must have DevMemory Pro product with monthly ($8) and yearly ($72) prices configured; DB already has `isPro`, `stripeCustomerId`, `stripeSubscriptionId` on User model
- No Stripe CLI or live webhooks needed for Phase 1 — routes can be tested with curl/Postman
- `getUserUsage` short-circuits for Pro users (no DB query)
- Stripe webhooks (Phase 2) are the only source of truth for `isPro` — never set from client
- Customer Portal activation in Stripe Dashboard required before portal route works
- `STRIPE_WEBHOOK_SECRET` is Phase 2 — leave blank in `.env` for now
- JWT callback always syncs `isPro` from DB so a page reload after a webhook picks up the change

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
