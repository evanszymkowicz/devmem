# Auth Phase 3 — Auth UI: Sign In, Register, Sign Out (+ real session sidebar, register toast)

Replaced NextAuth's default pages with custom `/sign-in` and `/register` UI, added
a sidebar user menu with avatar + sign-out, switched the sidebar/dashboard to the
real logged-in session user, and added a success toast on registration. Third and
final auth phase. Source spec: `context/features/auth-phase-3-spec.md`. This branch
(`feature/next-auth-integration`) also carries Phases 1 and 2; PR covers all three.

## What Changed

### Custom auth pages

- **`src/app/(auth)/layout.tsx`** — shared route-group layout for the auth pages: a
  centered card on a plain background with the DevMemory wordmark above it.
- **`src/app/(auth)/sign-in/page.tsx`** — server page; awaits `searchParams` to read
  `callbackUrl` (the proxy passes it) and renders `<SignInForm callbackUrl=… />`,
  defaulting to `/dashboard`.
- **`src/components/auth/SignInForm.tsx`** — `"use client"`. Email/password fields,
  inline error display, and a GitHub button. Credentials sign-in uses
  `signIn("credentials", { redirect: false })` so invalid-credential errors render
  inline ("Invalid email or password.") instead of bouncing to NextAuth's error
  page; on success it `router.push(callbackUrl)` + `router.refresh()`. GitHub uses
  `signIn("github", { redirectTo: callbackUrl })`. Inlines a GitHub SVG mark because
  the installed `lucide-react` no longer ships brand icons.
- **`src/app/(auth)/register/page.tsx`** — server page rendering `<RegisterForm />`.
- **`src/components/auth/RegisterForm.tsx`** — `"use client"`. Name/email/password/
  confirm fields with client-side mirror of the server Zod rules (min length,
  passwords match) for instant feedback; POSTs to `/api/auth/register`, surfaces the
  API's `{ success, error }` inline, and on success fires a success toast then
  `router.push("/sign-in")`.

### Routing / config

- **`src/auth.config.ts`** — added `pages: { signIn: "/sign-in" }` so both the edge
  proxy instance and the full Node instance route to the custom page.
- **`src/proxy.ts`** — repointed the unauthenticated `/dashboard` redirect from
  `/api/auth/signin` to `/sign-in`, preserving `callbackUrl`.
- **`src/app/profile/page.tsx`** — minimal placeholder; the sidebar avatar links here
  per the spec. A full profile/settings page is out of scope for this phase.

### Sidebar user area + reusable avatar

- **`src/components/ui/user-avatar.tsx`** — reusable `UserAvatar`: renders the user's
  `image` when present (plain `<img>` — avatars come from arbitrary OAuth hosts and a
  32px thumbnail doesn't justify configuring `images.remotePatterns`), otherwise an
  initials fallback ("Brad Traversy" → "BT"), guarded against empty name segments.
- **`src/components/dashboard/Sidebar.tsx`** — replaced the old inline `Avatar` helper
  with a `UserMenu`: the avatar links to `/profile`; a chevron toggles an upward
  dropdown containing "Sign out" (`signOut({ redirectTo: "/sign-in" })`); closes on
  outside-click / Escape. Email line is guarded so an OAuth user without a public
  email doesn't render a blank line. `user` prop widened with optional `image`.

### Real session user (sidebar/dashboard)

- **`src/app/dashboard/page.tsx`** — replaced the hardcoded `demo@devmemory.io` lookup
  with `await auth()`. `userId` now comes from `session.user.id`, and the sidebar user
  is built from the session's `name` / `email` / `image`. All dashboard data is now
  scoped to the logged-in user. (`/dashboard` consequently became a dynamic route.)
- **`src/components/dashboard/DashboardShell.tsx`** — widened the `user` prop type to
  carry the optional `image` through to the sidebar.
- No session-type change needed: `DefaultSession["user"]` already includes
  `name`/`email`/`image`, and both GitHub and the Credentials `authorize` return them.

### Toast notifications

- **Installed `sonner`** (shadcn-standard toast).
- **`src/components/ui/sonner.tsx`** — `Toaster` wrapper pinned to `theme="dark"` (the
  app forces dark mode on `<html>`; no `next-themes`), with `richColors` + `closeButton`.
- **`src/app/layout.tsx`** — mounted `<Toaster />` once in the root layout so toasts
  survive the client-side `/register` → `/sign-in` redirect.
- Registration success shows: **"Account created! You can now log in."**

## Behavior Change

The seeded sample data is owned by the demo user, so now that the dashboard scopes to
the real session user, a freshly registered or GitHub-OAuth user sees an **empty
dashboard** (correct). To view seeded data while testing, sign in as
`demo@devmemory.io`.

## Verification

- `npm run build` and `npm run lint` pass clean.
- HTTP checks: `/sign-in`, `/register`, `/profile` → 200; `/dashboard` (unauthed) →
  302 to `/sign-in?callbackUrl=…`.
- Drove the live UI: registered via the form → account created → redirected to
  `/sign-in` with the Toaster mounted. Two throwaway test accounts created during
  verification were deleted from the Neon **development** branch afterward.

## Deferred / Not Done (per project workflow)

- **No commit / merge / branch delete / push** — the project rules
  (`context/ai-interaction.md`, `CLAUDE.md`) state the user handles all commits and
  merges; the `/feature complete` skill's git steps were intentionally skipped.
- **GitHub OAuth round-trip** and **live credentials sign-in** still need a real
  browser/consent flow to confirm end-to-end (rendering, routing, and the redirect
  were verified).
- **`/profile`** is a placeholder only.
