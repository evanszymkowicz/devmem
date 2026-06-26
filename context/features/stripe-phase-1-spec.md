# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Wire in the Stripe SDK, validate env vars, extend the session type with `isPro`, sync `isPro` from the database on every JWT validation, add free-tier limit constants and a usage utilities module with unit tests, and create the checkout and customer portal API routes. No Stripe CLI or live webhooks required for this phase — all API routes can be tested with curl/Postman.

## Prerequisites

- Stripe Dashboard configured with DevMemory Pro product, monthly ($8) and yearly ($72) prices
- Environment variables set (see below)
- Database already has `isPro`, `stripeCustomerId`, `stripeSubscriptionId` fields on User model (schema is in place)

## Goals

- Stripe client initialized and validated at module load
- Session carries `isPro` everywhere, synced from DB on every JWT validation
- Free-tier limits defined as named constants
- `getUserUsage` + limit helper functions unit-tested with Vitest and Prisma mocks
- Checkout and customer portal API routes ready to call

## Files to Create

### `src/lib/stripe.ts`

Initialize the Stripe client. Export the client and both price-ID constants. Throw at module load if any required env var is missing.

```typescript
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY is not set");

// Pin apiVersion after install: check node_modules/stripe/src/stripe.core.ts DEFAULT_API_VERSION
export const stripe = new Stripe(key);

export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY!;
export const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY!;

if (!STRIPE_PRICE_MONTHLY) throw new Error("STRIPE_PRICE_ID_MONTHLY is not set");
if (!STRIPE_PRICE_YEARLY) throw new Error("STRIPE_PRICE_ID_YEARLY is not set");
```

### `src/lib/db/usage-limits.ts`

Usage utility functions. `getUserUsage` queries the DB to return counts and `canCreate` booleans — Pro users skip the DB query entirely. `isItemLimitReached` / `isCollectionLimitReached` are pure helpers used in `createItem` / `createCollection`.

```typescript
import { prisma } from "@/lib/prisma";
import { FREE_TIER_ITEM_LIMIT, FREE_TIER_COLLECTION_LIMIT } from "@/lib/db/limits";

export type UsageSummary = {
  itemCount: number;
  collectionCount: number;
  canCreateItem: boolean;
  canCreateCollection: boolean;
};

export async function getUserUsage(userId: string, isPro: boolean): Promise<UsageSummary> {
  if (isPro) {
    return { itemCount: 0, collectionCount: 0, canCreateItem: true, canCreateCollection: true };
  }

  const [itemCount, collectionCount] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
  ]);

  return {
    itemCount,
    collectionCount,
    canCreateItem: itemCount < FREE_TIER_ITEM_LIMIT,
    canCreateCollection: collectionCount < FREE_TIER_COLLECTION_LIMIT,
  };
}

export function isItemLimitReached(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_TIER_ITEM_LIMIT;
}

export function isCollectionLimitReached(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_TIER_COLLECTION_LIMIT;
}
```

### `src/lib/db/usage-limits.test.ts`

Unit tests. `getUserUsage` tests mock Prisma; the pure helpers need no mocks.

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isItemLimitReached, isCollectionLimitReached, getUserUsage } from "./usage-limits";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: { count: vi.fn() },
    collection: { count: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";

describe("isItemLimitReached", () => {
  it("returns false for Pro users regardless of count", () => {
    expect(isItemLimitReached(999, true)).toBe(false);
  });
  it("returns false when under the limit", () => {
    expect(isItemLimitReached(49, false)).toBe(false);
  });
  it("returns true at the limit", () => {
    expect(isItemLimitReached(50, false)).toBe(true);
  });
  it("returns true over the limit", () => {
    expect(isItemLimitReached(51, false)).toBe(true);
  });
});

describe("isCollectionLimitReached", () => {
  it("returns false for Pro users regardless of count", () => {
    expect(isCollectionLimitReached(999, true)).toBe(false);
  });
  it("returns false when under the limit", () => {
    expect(isCollectionLimitReached(2, false)).toBe(false);
  });
  it("returns true at the limit", () => {
    expect(isCollectionLimitReached(3, false)).toBe(true);
  });
  it("returns true over the limit", () => {
    expect(isCollectionLimitReached(4, false)).toBe(true);
  });
});

describe("getUserUsage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns correct counts and canCreate booleans", async () => {
    vi.mocked(prisma.item.count).mockResolvedValue(10);
    vi.mocked(prisma.collection.count).mockResolvedValue(1);
    const result = await getUserUsage("user-1", false);
    expect(result).toEqual({
      itemCount: 10,
      collectionCount: 1,
      canCreateItem: true,
      canCreateCollection: true,
    });
  });

  it("sets canCreateItem: false at exactly 50 items", async () => {
    vi.mocked(prisma.item.count).mockResolvedValue(50);
    vi.mocked(prisma.collection.count).mockResolvedValue(0);
    const result = await getUserUsage("user-1", false);
    expect(result.canCreateItem).toBe(false);
  });

  it("sets canCreateCollection: false at exactly 3 collections", async () => {
    vi.mocked(prisma.item.count).mockResolvedValue(0);
    vi.mocked(prisma.collection.count).mockResolvedValue(3);
    const result = await getUserUsage("user-1", false);
    expect(result.canCreateCollection).toBe(false);
  });

  it("bypasses all limits for Pro users without querying DB", async () => {
    const result = await getUserUsage("user-1", true);
    expect(result.canCreateItem).toBe(true);
    expect(result.canCreateCollection).toBe(true);
    expect(prisma.item.count).not.toHaveBeenCalled();
    expect(prisma.collection.count).not.toHaveBeenCalled();
  });
});
```

### `src/app/api/stripe/checkout/route.ts`

Creates a Stripe Checkout session and returns the redirect URL. Client sends `plan: 'monthly' | 'yearly'` — price IDs never leave the server.

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!APP_URL) throw new Error("NEXT_PUBLIC_APP_URL is not set");

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const plan = body.plan;
  if (plan !== "monthly" && plan !== "yearly") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true, isPro: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.isPro) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
  }

  const priceId = plan === "monthly" ? STRIPE_PRICE_MONTHLY : STRIPE_PRICE_YEARLY;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: user.stripeCustomerId ?? undefined,
      customer_email: user.stripeCustomerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId: session.user.id },
      success_url: `${APP_URL}/settings?upgraded=true`,
      cancel_url: `${APP_URL}/settings`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: session.user.id },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Failed to create checkout session:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
```

### `src/app/api/stripe/portal/route.ts`

Redirects a Pro user to the Stripe Customer Portal to manage billing. The portal must be activated in the Stripe Dashboard (Billing → Customer Portal) before this route will work.

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
if (!APP_URL) throw new Error("NEXT_PUBLIC_APP_URL is not set");

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_URL}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("Failed to create portal session:", err);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
```

## Files to Modify

### `src/lib/db/limits.ts`

Append the two free-tier constants alongside existing pagination constants.

```typescript
// Free tier hard limits
export const FREE_TIER_ITEM_LIMIT = 50;
export const FREE_TIER_COLLECTION_LIMIT = 3;
```

### `src/types/next-auth.d.ts`

Add `isPro` to `Session` and `JWT`.

```typescript
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isPro?: boolean;
  }
}
```

### `src/auth.ts` — JWT callback

Always sync `isPro` from the DB so a page reload after a webhook event picks up the change. One extra DB query per session validation — fast because it's a PK lookup returning a single boolean.

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) token.id = user.id;

    if (token.id) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { isPro: true },
      });
      token.isPro = dbUser?.isPro ?? false;
    }

    return token;
  },
  session({ session, token }) {
    if (token.id) session.user.id = token.id as string;
    if (token.isPro !== undefined) session.user.isPro = token.isPro;
    return session;
  },
},
```

### `.env.example`

Add missing vars (append only):

```bash
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID_MONTHLY=""
STRIPE_PRICE_ID_YEARLY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## New Files Summary

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe SDK initialization and env validation |
| `src/lib/db/usage-limits.ts` | `getUserUsage`, `isItemLimitReached`, `isCollectionLimitReached` |
| `src/lib/db/usage-limits.test.ts` | Unit tests (12 cases, Prisma mocked) |
| `src/app/api/stripe/checkout/route.ts` | Create Stripe Checkout sessions |
| `src/app/api/stripe/portal/route.ts` | Create Stripe Customer Portal sessions |

## Modified Files Summary

| File | Changes |
|------|---------|
| `src/lib/db/limits.ts` | Add `FREE_TIER_ITEM_LIMIT` and `FREE_TIER_COLLECTION_LIMIT` |
| `src/types/next-auth.d.ts` | Add `isPro` to Session and JWT types |
| `src/auth.ts` | Async JWT callback with `isPro` DB sync; session callback passes `isPro` |
| `.env.example` | Add Stripe and `NEXT_PUBLIC_APP_URL` vars |

## Install

```bash
npm install stripe
```

After installing, check `node_modules/stripe/src/stripe.core.ts` for `DEFAULT_API_VERSION` and pin it explicitly in `src/lib/stripe.ts`.

## Environment Variables

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_YEARLY=price_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`STRIPE_WEBHOOK_SECRET` is Phase 2 — leave blank in `.env` for now.

## Testing

### Unit tests (Vitest)

```bash
npx vitest run src/lib/db/usage-limits.test.ts
```

All 12 cases must pass.

### API routes (curl / Postman)

With the dev server running and real Stripe test keys set:

```bash
# Checkout — expect { url: "https://checkout.stripe.com/..." }
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"monthly"}'

# Portal — expect { url: "https://billing.stripe.com/..." } (requires stripeCustomerId in DB first)
curl -X POST http://localhost:3000/api/stripe/portal
```

### Manual session check

1. Sign in and confirm `session.user.isPro` is `false` via a server component `console.log`
2. In Neon MCP (development branch), set your test user's `isPro = true`:
   ```sql
   UPDATE users SET is_pro = true WHERE email = 'your@email.com';
   ```
3. Reload the page — session should now reflect `isPro: true` without a manual `session.update()`
4. Revert the DB change after confirming

## Notes

- Do NOT set `isPro` from the client; the webhook (Phase 2) is the only source of truth
- `getUserUsage` short-circuits for Pro users — no DB query needed
- The `stripe.ts` module throws at startup if any required env var is missing (fail loud over fail silent)
- Customer Portal activation in Stripe Dashboard is required before the portal route will work
