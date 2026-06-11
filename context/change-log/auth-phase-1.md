# Auth Phase 1 — NextAuth v5 + GitHub Provider

Set up NextAuth v5 (Auth.js) with the Prisma adapter and GitHub OAuth, using the
split config pattern for edge compatibility and NextAuth's default sign-in page.
Source spec: `context/features/auth-phase-1.spec.md`. This is the first of three
auth phases; no PR until all three are done.

## What Changed

- **Dependencies** — installed `next-auth@5.0.0-beta.31` (the `@beta` tag, not
  `@latest`, which is still v4) and `@auth/prisma-adapter@2.11.2`.
- **`src/auth.config.ts`** — edge-compatible half of the split config: GitHub
  provider only, no adapter, typed `satisfies NextAuthConfig`. Safe to import in
  the edge runtime.
- **`src/auth.ts`** — full (Node-runtime) config. Wires `PrismaAdapter` to the
  existing shared client from `@/lib/prisma` (keeps the Neon adapter + pooling —
  not a fresh `new PrismaClient()`), forces `session: { strategy: "jwt" }`, and
  adds `jwt`/`session` callbacks that persist `user.id` onto the token and expose
  it on the session. Exports `auth`, `handlers`, `signIn`, `signOut`.
- **`src/app/api/auth/[...nextauth]/route.ts`** — re-exports `GET`/`POST` from
  `handlers`.
- **`src/proxy.ts`** — `export const proxy = auth(...)` (named export, not
  default), lazily initialized from `auth.config.ts` only. Protects
  `/dashboard/*`: unauthenticated requests redirect to NextAuth's default
  `/api/auth/signin` with a `callbackUrl` back to the original URL. Scoped via
  `config.matcher = ["/dashboard/:path*"]`. No custom `pages.signIn`, per spec.
- **`src/types/next-auth.d.ts`** — extends `Session.user` with `id: string` and
  adds `id?: string` to the JWT module so the callbacks and consumers are typed.
- **Env** — `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` already present
  in the gitignored `.env`.

## Decisions / Notes

- Verified the current Auth.js v5 split-config, proxy, and callback conventions
  via Context7 before writing — the spec called this out explicitly.
- Added the `jwt`/`session` callbacks beyond the literal spec file list: the spec
  required extending `Session` with `user.id`, which is only meaningful if the id
  is actually populated. This also sets up the `userId` scoping the coding
  standards require for future Server Actions.

## Deferred (intentionally not done)

- **Browser OAuth round-trip** (spec testing steps 1–3) — needs a real GitHub
  consent flow with live credentials, which can't be driven headlessly through
  GitHub's login wall. To verify manually: `npm run dev`, hit `/dashboard`,
  confirm redirect → GitHub → back to `/dashboard`.
- Credentials (email/password) provider and custom sign-in UI — later phases.

## Verification

- `npm run build` passes clean; the route table registers
  `/api/auth/[...nextauth]` (ƒ) and an active **Proxy (Middleware)**.
- `npm run lint` passes clean.
