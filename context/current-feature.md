# Current Feature: Stripe Integration — Phase 2: Webhooks, Feature Gating & UI

## Status

In Progress

## Goals

- Stripe webhooks are the only source of truth for `isPro` (`checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`)
- Free users hitting item/collection limits get a clear error message
- File/image item types and the upload route blocked for free users
- Settings page shows billing section with live usage counts and upgrade cards (or "Manage Billing" for Pro)
- Upgrade success toast fires once after checkout redirect, then cleans the URL
- Reusable `UpgradePrompt` component ready for future gating surfaces

## TODOs

### New Files
- [x] `src/app/api/stripe/webhook/route.ts` — webhook handler (uses `req.text()`, `updateMany` for idempotency)
- [x] `src/components/settings/BillingSection.tsx` — client component with usage counts and upgrade/portal buttons
- [x] `src/components/upgrade/UpgradePrompt.tsx` — reusable inline upgrade prompt linking to `/settings#billing`

### Modified Files
- [x] `src/lib/db/items.ts` — Pro type check + item limit check in `createItem`
- [x] `src/actions/items.ts` — catch `PRO_TYPE_REQUIRED` and `FREE_TIER_LIMIT_REACHED` errors
- [x] `src/lib/db/collections.ts` — collection limit check in `createCollection`
- [x] `src/actions/collections.ts` — catch `FREE_TIER_LIMIT_REACHED` error
- [x] `src/app/api/upload/route.ts` — Pro check before file upload (query DB directly, not JWT)
- [x] `src/app/(app)/settings/page.tsx` — fetch usage server-side, render `BillingSection`

### Setup (before coding)
- [x] Stripe Dashboard: create DevMemory Pro product with monthly ($8) and yearly ($72) prices; copy Price IDs to `.env`
- [x] Stripe Dashboard: configure Customer Portal (cancel, update payment, view invoices; return URL `/settings`)
- [x] Add `STRIPE_WEBHOOK_SECRET` to `.env` after running `stripe listen`

## Notes

- Webhook must use `req.text()` — never `req.json()` — to preserve the bytes Stripe signs
- `updateMany` used instead of `update` for idempotency (safe on duplicate event delivery)
- Upload route queries DB directly for `isPro` — don't rely on JWT session which may lag
- `invoice.payment_failed` = log only; Stripe retries automatically, don't revoke `isPro`
- Feature gating flag: wrap limit guards in `if (process.env.NEXT_PUBLIC_FEATURE_GATING_ENABLED !== "false")` so they stay off until launch
- Customer Portal must be activated in Stripe Dashboard before the portal route works
- Stripe CLI required for local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

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
