# Current Feature

## Status

Not Started

## Goals

<!-- Run /feature load to populate this with the next feature's goals. -->

## Notes

<!-- Spec details, constraints, and context for the next feature go here. -->

## History

> The "Phase" labels below are historical dashboard-UI build stages and predate the
> ordered checklist now in `project-overview.md` §8; they do not map to that checklist.

- Phase 1 (Foundation Layout) completed and merged to main (PR #1)
  - ShadCN init (radix-nova preset, Lucide icons, Geist fonts)
  - Dark mode default
  - `/dashboard` route with display-only top bar and placeholder sidebar/main
  - Build and lint passing
- Phase 2 (Sidebar) completed and merged to main (PR #2)
  - Collapsible sidebar with item types, favorite collections, recent collections
  - User avatar area at bottom
  - Drawer icon to toggle; always a drawer on mobile
- Phase 3 (Main Area) completed
  - Stats cards row (Items, Collections, Favorite Items, Favorite Collections)
  - Recent Collections grid using shadcn Card with colored left border, favorite star, item count, description, and type-icon row
  - Pinned Items section
  - Recent Items section (10 most recent by `updatedAt`)
  - Shared `ItemRow` component for Pinned + Recent
  - Page remains SSR; `"use client"` confined to interactive leaves
  - See `@context/change-log/dashboard-phase-3.md` for details
- Prisma 7 + Neon PostgreSQL setup completed
  - Neon provisioned with separate development/production branches; local `DATABASE_URL` on the dev branch
  - Prisma 7 configured for its breaking changes: new `prisma-client` generator → `src/generated/prisma`, required Neon driver adapter (`@prisma/adapter-neon`), connection URL moved out of the schema into `prisma.config.ts` (Migrate) and the adapter (runtime)
  - Initial schema from `@context/project-overview.md` §4: `User`, NextAuth models, `Item`, `ItemType`, `Collection`, `ItemCollection`, `Tag`, `ContentType` enum, with indexes, cascades, and snake_case `@@map`
  - Initial migration created via `prisma migrate dev` (never `db push`); `prisma migrate status` clean
  - Idempotent seed for the 7 system item types; `scripts/test-db.ts` + `db:test` for connectivity/sanity checks
  - See `@context/change-log/prisma-neon-setup.md` for details
- Seed sample data completed
  - Renamed the spec `context/features/speed-spec.md` → `seed-spec.md` and switched the demo email to the DevMemory domain
  - Added `bcryptjs` (+ `@types/bcryptjs`); demo user `demo@devmemory.io` hashed at 12 rounds, `isPro: false`, `emailVerified` set
  - Expanded `prisma/seed.ts`: demo user, 7 system types (kept title-case name + slug convention), and 5 collections / 18 items / 18 join rows, all idempotent (re-runnable without duplicates)
  - Updated `scripts/test-db.ts` (`db:test`) to fetch and display the demo user and their collections/items, with a graceful warning when the data isn't seeded
  - Verified: seed runs twice with stable counts; password verifies against `12345678`; `npm run build` and `npm run lint` pass
  - See `@context/change-log/seed-data.md` for details
- Dashboard Collections (real data) completed
  - Created `src/lib/db/collections.ts` with `getDashboardCollections` and `getDashboardStats`
  - `getDashboardCollections` fetches up to 6 collections ordered by favorite then `createdAt`, includes all items with their types, counts occurrences per type, and sorts so the dominant type (most items) is first
  - `CollectionCard` updated to accept `CollectionWithTypes`; border color derived from `itemTypes[0].color` (dominant type); type icons rendered from the full `itemTypes` array — no more `mockItemTypes` lookup
  - `RecentCollections` and `StatsCards` converted to async server components; both fetch via demo user `demo@devmemory.io` (pre-auth placeholder)
  - `npm run build` passes clean; TypeScript no errors
- Dashboard Items (real data) completed
  - Created `src/lib/db/items.ts` with `getPinnedItems` and `getRecentItems`; `ItemWithType` derived via `Prisma.ItemGetPayload`
  - `ItemRow` updated to accept `ItemWithType`; icon/color derived from `item.itemType` — no more `mockItemTypes` lookup
  - `PinnedItems` and `RecentItems` converted to async server components; both fetch via demo user `demo@devmemory.io` (pre-auth placeholder)
  - Pinned section still returns `null` when no items are pinned
  - `npm run build` passes clean; TypeScript no errors
  - See `@context/change-log/dashboard-items.md` for details
- Stats & Sidebar (real data) completed
  - Sidebar item types, collections, and user area all wired to real DB data; mock-data.ts deleted
  - Added `getSystemItemTypes` and `getSidebarCollections` DB functions; types sorted in canonical UX order
  - System item type names pluralised in seed (Snippet → Snippets, etc.)
  - Favorite toggle added to collection cards and sidebar rows via `toggleCollectionFavorite` server action
  - `React Patterns` seeded as a favorite collection
  - See `@context/change-log/stats-sidebar-real-data.md` for details
- Add Pro Badge to Sidebar completed
  - Installed ShadCN `Badge` component
  - PRO badge rendered next to Files and Images in sidebar Types list; conditioned on `type.slug`
  - `variant="outline"` styling — small, subtle, non-disruptive
  - `npm run build` passes clean; TypeScript no errors
  - See `@context/change-log/add-pro-badge-sidebar.md` for details
- Code Quality Quick Wins completed
  - Low-risk cleanup from the `code-scanner` audit; no new features, no auth changes
  - `DATABASE_URL` startup guard in `src/lib/prisma.ts` (throws if unset)
  - `StarOff` → `Star` icon on the Favorite Collections stat card
  - `Avatar` initials guarded with `.filter(Boolean)` against empty name segments
  - Shared `ICON_MAP` extracted to `src/lib/icon-map.ts` (used by `CollectionCard`, `ItemRow`, `Sidebar`)
  - Demo user resolved once in the dashboard page; `userId` passed as a prop to 4 components, eliminating duplicate per-render DB round-trips
  - `getPinnedItems` bounded with `take: 20` (`MAX_PINNED_DISPLAY`)
  - Demo password moved to `process.env.DEMO_USER_PASSWORD` in `prisma/seed.ts` (`.env`, gitignored)
  - Deferred: `toggleCollectionFavorite` ownership check + TOCTOU (await NextAuth), `getSidebarCollections` over-fetch (await `defaultTypeId` migration)
  - Also on this branch: repaired the build toolchain — moved off broken `next@16.3.0-preview.0` to `16.2.9` (see `@context/change-log/fix-next-swc-binary.md`)
  - See `@context/change-log/code-quality-quick-wins.md` for details
- Auth Phase 1 (NextAuth v5 + GitHub) completed (first of 3 auth phases; no PR until all three done)
  - Installed `next-auth@5.0.0-beta.31` (the `@beta` tag, not v4) and `@auth/prisma-adapter@2.11.2`
  - Split config for edge compat: `src/auth.config.ts` (GitHub provider only, no adapter) + `src/auth.ts` (full config)
  - `src/auth.ts` wires `PrismaAdapter` to the existing shared `@/lib/prisma` client, forces `session: { strategy: "jwt" }`, and adds `jwt`/`session` callbacks exposing `user.id`
  - `src/app/api/auth/[...nextauth]/route.ts` re-exports `GET`/`POST` from `handlers`
  - `src/proxy.ts` — named `export const proxy = auth(...)` lazily initialized from `auth.config.ts`; protects `/dashboard/*`, redirects unauthenticated users to NextAuth's default `/api/auth/signin` with a `callbackUrl`; no custom `pages.signIn`
  - `src/types/next-auth.d.ts` extends `Session.user.id` and the JWT
  - Verified newest Auth.js v5 conventions via Context7 before writing
  - `npm run build` and `npm run lint` pass clean; route table shows `/api/auth/[...nextauth]` + active Proxy (Middleware)
  - Deferred: browser OAuth round-trip (needs live GitHub consent flow, can't drive headlessly)
  - See `@context/change-log/auth-phase-1.md` for details
- Auth Phase 2 (Credentials provider + registration API) completed (second of 3 auth phases; no PR until all three done)
  - Added a Credentials provider via the split-config pattern: `auth.config.ts` keeps an edge-safe `authorize: () => null` placeholder; `auth.ts` supplies real `bcryptjs` + Prisma validation (lowercased-email lookup, rejects OAuth-only accounts with no password, returns `id/email/name/image`)
  - `POST /api/auth/register`: validates `name/email/password/confirmPassword` with Zod, hashes with bcryptjs, creates the user, returns `{ success, data, error }`; maps Prisma P2002 to a 409 "email already exists"
  - Shared Zod schemas in `src/lib/validations/auth.ts` (`signInSchema`, `registerSchema` with passwords-match refine, 72-byte bcrypt cap); password helpers in `src/lib/auth/password.ts`
  - `User.password` already existed in the schema — no migration needed
  - `npm run build` and `npm run lint` pass clean
- Auth Phase 3 (Auth UI: sign in, register, sign out) completed (third of 3 auth phases) — PR now covers all three
  - Custom `/sign-in` + `/register` pages under an `(auth)` route group with a shared centered-card layout; replaced NextAuth's default pages
  - `SignInForm` (client): email/password via `signIn("credentials", { redirect: false })` with inline error, GitHub via `signIn("github", { redirectTo })`, inline GitHub SVG (lucide dropped brand icons); `RegisterForm` (client): POSTs to `/api/auth/register`, mirrors server Zod rules for instant feedback, success toast then redirect to `/sign-in`
  - `auth.config.ts` set `pages.signIn = "/sign-in"`; `proxy.ts` repointed the unauthenticated `/dashboard` redirect from `/api/auth/signin` → `/sign-in` (callbackUrl preserved)
  - Reusable `UserAvatar` (image or initials fallback); sidebar `UserMenu` with avatar → `/profile`, upward dropdown with "Sign out", outside-click/Escape close; placeholder `/profile` page
  - Dashboard/sidebar switched from the hardcoded demo user to the real session (`await auth()`); `userId` and avatar/name/email now come from `session.user` — `/dashboard` is now a dynamic route. Behavior change: new/OAuth users see an empty dashboard (seed data is owned by the demo user)
  - Toasts: installed `sonner`, mounted `<Toaster theme="dark" richColors closeButton />` in the root layout; registration shows "Account created! You can now log in."
  - Verified: `npm run build` + `npm run lint` clean; `/sign-in` `/register` `/profile` → 200, unauthed `/dashboard` → 302 to `/sign-in?callbackUrl=…`; live register → account created → redirect to `/sign-in`. Two throwaway test accounts deleted from the Neon dev branch afterward
  - Deferred: live GitHub OAuth round-trip + email/password sign-in (need a real browser/consent flow); `/profile` is a placeholder. Per project workflow, the user handles commit/merge/push — no PR opened here
  - See `@context/change-log/auth-phase-3.md` for details
- Email Verification on Register completed
  - Email/password signups now get a Resend verification email with a 24h, single-use link; clicking it sets `User.emailVerified` and consumes the token. No migration — reused the existing `VerificationToken` model + `emailVerified` field
  - Installed `resend`; `src/lib/email/` holds the Resend client (fail-loud `RESEND_API_KEY` guard, sender constant, base-URL helper) and the verification email sender (plain HTML template)
  - `src/lib/auth/verification-token.ts`: raw 32-byte token, stored as **SHA-256 hash** only, 24h expiry, single-use; create clears prior tokens per email so a resend supersedes old links. Shared `issueAndSendVerification` helper in `src/lib/auth/send-verification.ts`
  - `POST /api/auth/register` issues + sends after create (email failure logged, not rolled back — still 201). `GET /api/auth/verify-email` consumes the token, sets `emailVerified`, redirects to a result page with a `?status` flag. `POST /api/auth/resend-verification` is enumeration-safe (always generic 200)
  - Dedicated `/verify-email` result page (success/expired/invalid/error) with inline resend form. Unverified sign-in blocked via `EmailUnverifiedError extends CredentialsSignin` (distinct `code`); `SignInForm` shows "verify your email" + a resend link. GitHub OAuth unaffected
  - Verified: `npm run build` + `npm run lint` clean; curl register → 201 with hashed token + `emailVerified` null in the Neon dev branch; user confirmed the live email flow end-to-end (link verifies, sign-in blocked before and works after). Curl test account removed from the dev branch
  - Deferred: hardcoded sender (`onboarding@resend.dev`) + base-URL fallback (`localhost:3000`) — move to env (verified domain / `AUTH_URL`) before real users (user declined adding env vars during the build)
  - See `@context/change-log/email-verification-on-register.md` for details
- Email Verification Toggle completed
  - Single feature flag to turn the whole email-verification system on/off, so it can be disabled while Resend has no verified domain (the dev sender only delivers to the account owner, otherwise blocking everyone else from registering). No migration, no schema change — a pure code/config gate
  - New `src/lib/config/features.ts` exports `EMAIL_VERIFICATION_ENABLED = process.env.EMAIL_VERIFICATION_ENABLED !== "false"` — defaults **ON** (missing var fails safe in prod), plain `process.env` read so it stays edge-safe (pulled in via `src/auth.ts`)
  - Three gates: register route skips the verification send when off (account still created, `emailVerified: null`); `auth.ts` sign-in gate now `EMAIL_VERIFICATION_ENABLED && !emailVerified` so unverified users can sign in when off; resend route skips lookup+send but keeps its identical enumeration-safe 200. GitHub OAuth unaffected
  - Appended `EMAIL_VERIFICATION_ENABLED=false` to the existing `.env` (own line, nothing overwritten, no new files); `.env.production` left untouched since the default is ON
  - Decision: accounts are NOT auto-verified while off — the flag only skips the send + sign-in gate, not stamping `emailVerified`. Tradeoff: re-enabling the flag locks out accounts created during the off-window until they verify
  - Verified: `npm run build` + `npm run lint` clean. Disabled-path tested end-to-end — API register → `emailVerified` null + zero verification tokens in the Neon dev branch (no email) → browser sign-in as the unverified user reached `/dashboard`. Throwaway test account deleted from the dev branch. No unit tests (project has no test infra; workflow defers it)
  - See `@context/change-log/email-verification-toggle.md` for details
- Forgot Password (Reset via Email Link) completed
  - "Forgot password?" link added to `SignInForm` right-aligned next to the Password label; navigates to `/forgot-password`
  - `/forgot-password` page + `ForgotPasswordForm` (client): posts to enumeration-safe `POST /api/auth/forgot-password`; only sends for real password-based accounts; OAuth-only accounts silently no-op; always returns same generic 200
  - `POST /api/auth/reset-password`: consumes token (single-use, rejects invalid/expired with 400), hashes new password with bcrypt cost 14, stamps `emailVerified` for unverified users (proves inbox control)
  - `/reset-password?token=` page + `ResetPasswordForm` (client): missing token shows invalid-link state with link back to `/forgot-password`; client-side passwords-match validation; success toast + redirect to `/sign-in`
  - Reuses `VerificationToken` model — no migration. Reset tokens namespaced as `reset:<email>` in `identifier` to prevent clobbering email-verification tokens; cross-flow replay rejected in `consumeResetToken`
  - Token stored as SHA-256 hash only (raw token lives in email link only); 24h TTL; single-use; prior reset tokens purged on re-request
  - `ForgotPasswordForm` checks `res.ok && json.success` before setting sent state (avoids false confirmation on server error)
  - `resetPasswordSchema` token constrained to 64-char lowercase hex (matches actual token format)
  - Deferred: JWT session invalidation after reset (requires `sessionVersion` counter — tracked in `recurring-issues.md` as MUST FIX BEFORE LAUNCH); no rate limiting on forgot-password endpoint (v1)
  - Verified: `npm run build` + `npm run lint` clean; browser-tested full flow end-to-end
  - See `@context/change-log/forgot-password.md` for details
