# Fix: Next.js SWC binary failure (broken preview pin)

## Symptom

`npm run build` and `npm run start` failed with:

```
⨯ Failed to download swc package from .../@next/swc-wasm-nodejs-16.3.0-preview.0.tgz
⚠ Error: request failed with status 404
⚠ Found lockfile missing swc dependencies, patching...
⨯ Failed to patch lockfile, please try uninstalling and reinstalling next
⨯ Failed to load SWC binary for linux/x64
```

`npm install` reported "up to date" and exited 0, masking the problem.

## Root Cause

The project was pinned to `next@^16.3.0-preview.0`, a preview release whose
companion SWC native binaries were never published to npm. Every version 404'd:

- `@next/swc-linux-x64-gnu@16.3.0-preview.0` — not in registry
- `@next/swc-wasm-nodejs@16.3.0-preview.0` (the fallback) — not in registry

Next lists these per-platform SWC binaries as `optionalDependencies`, so npm
**silently skips** them when they 404 — install succeeds, but `node_modules/@next/`
contains only `env` and `eslint-plugin-next`, no SWC compiler. Next then has no
way to compile and crashes at build/start.

The package names were correct for the environment (linux/x64, glibc 2.43 →
`@next/swc-linux-x64-gnu`); only the preview *version* of those binaries did not
exist. Unrelated to the `npm audit` Prisma/Hono advisories.

## What Changed

- `package.json`: `next` `^16.3.0-preview.0` → `16.2.9` (latest stable, **exact**
  pin — no caret, so npm cannot drift back into preview/canary)
- `package.json`: `eslint-config-next` `16.2.6` → `16.2.9` (aligned with Next)
- Removed the poisoned `package-lock.json` and stale `node_modules/next` +
  `node_modules/@next`, then ran a clean `npm install`
- Verified `node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node` is
  now present; `npm run build` passes clean (Next 16.2.9, Turbopack)

## Notes / Gotchas

- Pin `next` to an **exact** version, not a caret on a prerelease — caret ranges
  on prereleases are sticky and can resolve back into preview/canary builds.
- Did **not** run `npm audit fix --force`: it wants to downgrade to
  `prisma@6.19.3` (a breaking change). The remaining moderate advisories are
  dev-only transitive deps under `@prisma/dev` / `@hono/node-server` and do not
  affect runtime — leave until `@prisma/dev` ships a patched release.
- If a future Next bump fails the same way, check that the matching
  `@next/swc-<platform>` version actually exists on the registry before pinning:
  `npm view @next/swc-linux-x64-gnu@<version> version`
