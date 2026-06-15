# Fix GitHub OAuth Redirect

## Summary

Replaced the client-side GitHub OAuth trigger with a Server Action so the
post-OAuth redirect to `/dashboard` is handled server-side. Fixes a two-click
bug where the first click authenticated the user but failed to redirect.

## What was done

### New file

- `src/actions/auth.ts` (new) — exports `signInWithGitHub`, a Server Action
  that calls `signIn("github", { redirectTo: "/dashboard" })` from `@/auth`.
  Uses the NextAuth v5 server-side `signIn`, not the `next-auth/react` client
  equivalent. No error handling needed — OAuth errors come back via redirect
  with error params; success triggers a server-side redirect to `/dashboard`.

### Modified

- `src/components/auth/SignInForm.tsx` — the GitHub `<Button onClick={...}>`
  is replaced with a `<form action={signInWithGitHub}>` containing a submit
  button. Import of `signInWithGitHub` added. The `signIn` import from
  `next-auth/react` is retained for the credentials path only (which still
  uses `redirect: false` for inline error handling).

## Verification

- `npm run build` passes clean; TypeScript no errors.

## Decisions

1. **Hardcoded `redirectTo: "/dashboard"`** rather than forwarding `callbackUrl`
   via a hidden field. For GitHub OAuth, users are always landing on the
   dashboard — the `callbackUrl` pattern matters more for credentials, where
   you may be returning to a deep page. Simpler action, no hidden-field plumbing.
2. **Credentials path unchanged** — `signIn("credentials", { redirect: false })`
   from `next-auth/react` remains correct for that flow because it surfaces
   structured error codes (`result.code`) inline rather than redirecting.

## Deferred / follow-ups

None introduced by this feature.
