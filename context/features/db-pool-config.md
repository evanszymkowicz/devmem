# DB Pool Config Spec

## Overview

Configure explicit connection pool settings on the Neon driver adapter to
prevent connection exhaustion under concurrent serverless load and ensure
hung connections fail fast.

## Problem

Neon's serverless driver opens a new WebSocket connection per request by
default. Without pool limits, a spike in concurrent Next.js function
invocations can exhaust Postgres's connection limit. Without timeouts, a slow
or hung connection has no deadline and silently blocks the render.

## Requirements

- Set `max` connections (suggested: 10, tunable via env var
  `PRISMA_CONNECTION_LIMIT`)
- Set `idleTimeoutMillis` (suggested: 30 000 ms)
- Set `connectionTimeoutMillis` (suggested: 5 000 ms)
- Apply the same config in all three places that construct `PrismaNeon`:
  - `src/lib/prisma.ts` (runtime)
  - `prisma/seed.ts` (seed script)
  - `scripts/test-db.ts` (connectivity check)
- Add `PRISMA_CONNECTION_LIMIT` to `.env` with a default comment

## References

- `src/lib/prisma.ts`
- `prisma/seed.ts`
- `scripts/test-db.ts`
- Neon serverless driver docs for pool options
