# Stripe Integration — Phase 2: Webhooks, Feature Gating & UI

## Overview

Wire up the Stripe webhook handler to sync subscription status, gate item/collection creation and file uploads behind free-tier checks, build the billing section on the settings page with live usage counts, add an upgrade success toast, and create a reusable upgrade prompt component. Requires the Stripe CLI for local webhook testing.

**Prerequisite:** Phase 1 must be complete — `src/lib/stripe.ts`, session `isPro`, `FREE_TIER_*` constants, `getUserUsage`, and the checkout/portal API routes must all be in place.

## Goals

- Stripe webhooks are the only source of truth for `isPro`
- `invoice.paid` re-activates Pro on renewal; `subscription.deleted` revokes it
- Free users hitting item/collection limits get a clear error message
- File/image item types and the upload route are blocked for free users
- Settings page shows billing section with live usage counts and upgrade cards or "Manage Billing"
- Upgrade success toast fires once after checkout redirect, then cleans up the URL
- Reusable `UpgradePrompt` component ready for future gating surfaces

## Stripe Dashboard Setup (do before coding)

1. **Create product:** `DevMemory Pro`
   - Monthly price: $8.00/mo → copy Price ID to `STRIPE_PRICE_ID_MONTHLY`
   - Annual price: $72.00/yr → copy Price ID to `STRIPE_PRICE_ID_YEARLY`
2. **Configure Customer Portal:** Billing → Customer Portal
   - Enable: cancel subscriptions, update payment method, view invoices
   - Return URL: `http://localhost:3000/settings` (update to prod URL before launch)
3. **Webhook endpoint** — handled by Stripe CLI for local dev (see Testing section)

## Stripe CLI Setup

Phase 2 requires the Stripe CLI for end-to-end webhook testing.

```bash
# Install (macOS)
brew install stripe/stripe-cli/stripe

# Authenticate
stripe login

# Terminal 1: run dev server
npm run dev

# Terminal 2: forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` printed by the CLI to `.env` as `STRIPE_WEBHOOK_SECRET`, then restart the dev server.

## Files to Create

### `src/app/api/stripe/webhook/route.ts`

The source of truth for `isPro`. Must use `req.text()` — never `req.json()` — to preserve the exact bytes Stripe signs. Webhook payload fields like `customer` and `subscription` may arrive as a string ID or an expanded object; always cast to string via `as string` (or use `typeof` checks if expanding).

`updateMany` is used instead of `update` for idempotency — duplicate event delivery is safe.

Handles:
- `checkout.session.completed` — set `isPro: true`, store both Stripe IDs (keyed by `metadata.userId`)
- `invoice.paid` — ensure `isPro: true` on renewal (keyed by `stripeCustomerId`)
- `invoice.payment_failed` — log only; Stripe retries automatically, don't revoke
- `customer.subscription.updated` — set `isPro` based on status (`active`/`trialing` = true, else false)
- `customer.subscription.deleted` — set `isPro: false`, clear `stripeSubscriptionId`

```typescript
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const userId = session.metadata?.userId;
        if (!userId) {
          console.error("checkout.session.completed: missing userId in metadata");
          break;
        }
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await prisma.user.updateMany({
          where: { stripeCustomerId: invoice.customer as string },
          data: { isPro: true },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const isActive = ["active", "trialing"].includes(sub.status);
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: { isPro: isActive, stripeSubscriptionId: sub.id },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: { isPro: false, stripeSubscriptionId: null },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("Payment failed for customer:", invoice.customer);
        break;
      }
    }
  } catch (err) {
    console.error(`Error handling Stripe event ${event.type}:`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
```

### `src/components/settings/BillingSection.tsx`

Client component. Accepts `isPro`, `itemCount`, and `collectionCount` as props (counts come from `getUserUsage` called server-side in the settings page).

**Free user view:** shows `{itemCount}/50 items` and `{collectionCount}/3 collections` usage, plus monthly ($8/mo) and yearly ($72/yr) upgrade cards with a "Save 25%" badge on yearly.

**Pro user view:** Pro plan badge and "Manage Billing" button that opens the customer portal.

Loading state per button; all buttons disabled during any in-flight request. Errors via `toast.error`.

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";

type Props = {
  isPro: boolean;
  itemCount: number;
  collectionCount: number;
};

export function BillingSection({ isPro, itemCount, collectionCount }: Props) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success("Welcome to DevMemory Pro!");
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

  async function handleUpgrade(plan: "monthly" | "yearly") {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open billing portal");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Plan</h2>
        {isPro && (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}
      </div>

      {isPro ? (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            You&apos;re on the Pro plan. Unlimited items, collections, file uploads, and AI features.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePortal}
            disabled={loading === "portal"}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading === "portal" ? "Opening..." : "Manage Billing"}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            You&apos;re on the Free plan. Upgrade to Pro for unlimited items, collections,
            file uploads, AI features, and export.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{itemCount}/50 items</span>
            <span>{collectionCount}/3 collections</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 rounded-md border border-border p-3 space-y-2">
              <p className="text-sm font-medium">Monthly</p>
              <p className="text-2xl font-bold">$8<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleUpgrade("monthly")}
                disabled={loading !== null}
              >
                {loading === "monthly" ? "Redirecting..." : "Upgrade Monthly"}
              </Button>
            </div>
            <div className="flex-1 rounded-md border border-purple-500/30 bg-purple-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Yearly</p>
                <Badge variant="secondary" className="text-xs">Save 25%</Badge>
              </div>
              <p className="text-2xl font-bold">$72<span className="text-sm font-normal text-muted-foreground">/yr</span></p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleUpgrade("yearly")}
                disabled={loading !== null}
              >
                {loading === "yearly" ? "Redirecting..." : "Upgrade Yearly"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
```

### `src/components/upgrade/UpgradePrompt.tsx`

Reusable inline upgrade prompt for any gating surface. Accepts `title` and `description` props. Links to `/settings#billing`.

```typescript
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
};

export function UpgradePrompt({ title, description }: Props) {
  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <p className="text-sm font-medium text-purple-300">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild size="sm" variant="outline" className="border-purple-500/30 text-purple-300">
        <Link href="/settings#billing">Upgrade to Pro</Link>
      </Button>
    </div>
  );
}
```

## Files to Modify

### `src/lib/db/items.ts` — `createItem`

Add two checks before the existing create logic:

1. **Pro type check:** if the item type slug is `files` or `images` and the user is not Pro, throw. This guards at the DB layer — the upload route is also gated, but a crafty user could craft a DB row referencing an upload URL obtained elsewhere.
2. **Usage limit check:** use `isItemLimitReached` from `usage-limits.ts`.

```typescript
import { isItemLimitReached } from "@/lib/db/usage-limits";
import { FREE_TIER_ITEM_LIMIT } from "@/lib/db/limits";

export async function createItem(userId: string, data: CreateItemData) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (!user?.isPro) {
    // Block file/image types for free users at the DB layer
    if (data.typeSlug === "files" || data.typeSlug === "images") {
      throw new Error("PRO_TYPE_REQUIRED");
    }

    const count = await prisma.item.count({ where: { userId } });
    if (isItemLimitReached(count, false)) {
      throw new Error("FREE_TIER_LIMIT_REACHED");
    }
  }

  // ...existing create logic
}
```

### `src/actions/items.ts`

Catch both new error codes and return user-facing messages.

```typescript
} catch (err) {
  if (err instanceof Error && err.message === "PRO_TYPE_REQUIRED") {
    return { success: false, error: "File and image uploads require a Pro subscription." };
  }
  if (err instanceof Error && err.message === "FREE_TIER_LIMIT_REACHED") {
    return {
      success: false,
      error: `You've reached the ${FREE_TIER_ITEM_LIMIT}-item limit on the free plan. Upgrade to Pro for unlimited items.`,
    };
  }
  return { success: false, error: "Failed to create item" };
}
```

### `src/lib/db/collections.ts` — `createCollection`

Same pattern as items, without the type check.

```typescript
import { isCollectionLimitReached } from "@/lib/db/usage-limits";
import { FREE_TIER_COLLECTION_LIMIT } from "@/lib/db/limits";

export async function createCollection(userId: string, data: CreateCollectionData) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (!user?.isPro) {
    const count = await prisma.collection.count({ where: { userId } });
    if (isCollectionLimitReached(count, false)) {
      throw new Error("FREE_TIER_LIMIT_REACHED");
    }
  }

  // ...existing create logic
}
```

### `src/actions/collections.ts`

```typescript
} catch (err) {
  if (err instanceof Error && err.message === "FREE_TIER_LIMIT_REACHED") {
    return {
      success: false,
      error: `You've reached the ${FREE_TIER_COLLECTION_LIMIT}-collection limit on the free plan. Upgrade to Pro for unlimited collections.`,
    };
  }
  return { success: false, error: "Failed to create collection" };
}
```

### `src/app/api/upload/route.ts`

Gate file/image uploads behind `isPro`. Query the DB directly — don't rely on the JWT-enhanced session, which may lag behind a fresh webhook update.

```typescript
const user = await prisma.user.findUnique({
  where: { id: session.user.id },
  select: { isPro: true },
});
if (!user?.isPro) {
  return NextResponse.json(
    { error: "File uploads require a Pro subscription" },
    { status: 403 }
  );
}
```

### `src/app/(app)/settings/page.tsx`

Fetch `isPro` and usage counts server-side. Pass all three to `BillingSection`.

```typescript
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUserUsage } from "@/lib/db/usage-limits";
import { BillingSection } from "@/components/settings/BillingSection";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const isPro = session.user.isPro ?? false;
  const usage = await getUserUsage(session.user.id, isPro);

  return (
    <div className="space-y-8">
      {/* ...existing sections */}
      <BillingSection
        isPro={isPro}
        itemCount={usage.itemCount}
        collectionCount={usage.collectionCount}
      />
      {/* ...existing sections */}
    </div>
  );
}
```

## New Files Summary

| File | Purpose |
|------|---------|
| `src/app/api/stripe/webhook/route.ts` | Handle Stripe webhook events |
| `src/components/settings/BillingSection.tsx` | Billing UI with usage counts and upgrade cards |
| `src/components/upgrade/UpgradePrompt.tsx` | Reusable inline upgrade prompt |

## Modified Files Summary

| File | Changes |
|------|---------|
| `src/lib/db/items.ts` | Pro type check + item limit check in `createItem` |
| `src/actions/items.ts` | Catch `PRO_TYPE_REQUIRED` and `FREE_TIER_LIMIT_REACHED` errors |
| `src/lib/db/collections.ts` | Collection limit check in `createCollection` |
| `src/actions/collections.ts` | Catch `FREE_TIER_LIMIT_REACHED` error |
| `src/app/api/upload/route.ts` | Pro check before file upload |
| `src/app/(app)/settings/page.tsx` | Fetch usage, render `BillingSection` |

## Testing

### Stripe CLI webhook testing

```bash
# Trigger individual events
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### Test cards

| Card | Scenario |
|------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 3220` | 3D Secure required |

Use any future expiry date and any CVC.

### Manual testing checklist

**Webhook**
- [ ] Tampered body returns 400 (signature mismatch)
- [ ] `checkout.session.completed` sets `isPro = true`, persists `stripeCustomerId` + `stripeSubscriptionId`
- [ ] `invoice.paid` sets `isPro = true` (renewal confirmation)
- [ ] `customer.subscription.deleted` sets `isPro = false`, clears `stripeSubscriptionId`
- [ ] `customer.subscription.updated` with `status = "past_due"` sets `isPro = false`
- [ ] Unhandled event types return 200 (no crash)

**Checkout flow**
- [ ] Monthly checkout redirects to Stripe and returns to `/settings?upgraded=true`
- [ ] Yearly checkout redirects correctly
- [ ] Already-Pro user receives 409 — no duplicate checkout session created
- [ ] Upgrade success toast fires on return, URL cleaned up to `/settings`

**Customer Portal**
- [ ] Pro user can open the billing portal
- [ ] Free user without `stripeCustomerId` gets 404
- [ ] Cancellation via portal fires webhook and revokes `isPro`

**Feature gating**
- [ ] Free user's 51st item create returns the limit error (not a server crash)
- [ ] Free user's 4th collection create returns the limit error
- [ ] Free user attempting to create a file/image item type gets `PRO_TYPE_REQUIRED` error
- [ ] Free user attempting a file upload receives 403 from `/api/upload`
- [ ] Pro user has no limits on items, collections, or uploads

**Settings page**
- [ ] Free user sees `{n}/50 items` and `{n}/3 collections` usage counts
- [ ] Free user sees monthly and yearly upgrade cards with correct pricing
- [ ] Pro user sees the Pro badge and "Manage Billing" button
- [ ] Both upgrade buttons show loading state and redirect correctly

## Notes

- **Webhook idempotency:** `updateMany` makes duplicate event delivery safe. If side effects are added later (e.g. welcome email), gate them on `isPro` transitioning `false → true`.
- **Feature flag during dev:** wrap limit guards in `if (process.env.NEXT_PUBLIC_FEATURE_GATING_ENABLED !== "false")` so they stay off until launch.
- **Export gating:** when export is implemented, check `isPro` in the server action — same pattern as upload.
- **AI gating:** check `session.user.isPro` at the top of any AI server action before calling OpenAI.
- **Customer Portal activation:** must be enabled in Stripe Dashboard before the portal route works.
- **Session sync:** `isPro` updates in the session after a page reload — the JWT callback picks up the DB change set by the webhook.
