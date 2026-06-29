# Stripe Subscription Integration Plan

DevMemory Pro — $8/mo (monthly) or $72/yr (annual).

---

## Current State

The schema is already ready:

```prisma
model User {
  isPro                Boolean  @default(false)
  stripeCustomerId     String?  @unique
  stripeSubscriptionId String?  @unique
}
```

The `.env.example` already declares all required vars:

```bash
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PRICE_ID_MONTHLY=""
STRIPE_PRICE_ID_YEARLY=""
```

**No schema migration needed.** The Stripe fields, env vars, and session extension points are all in place.

---

## Implementation Order

1. Stripe SDK + env validation
2. Session type extension + JWT callback update
3. Free-tier limit constants
4. Webhook handler
5. Checkout session route
6. Customer portal route
7. Subscription server action
8. Feature gating in `createItem` and `createCollection`
9. Settings page billing section
10. Upgrade prompt components

---

## Files to Create

### `src/lib/stripe.ts`

Initializes the Stripe client and validates required env vars at module load.

```typescript
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY is not set");

// No apiVersion specified — the SDK defaults to the version it was built against.
// Check node_modules/stripe/src/stripe.core.ts DEFAULT_API_VERSION after install,
// and pin it here explicitly once you know the exact string.
export const stripe = new Stripe(key);

export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY!;
export const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY!;

if (!STRIPE_PRICE_MONTHLY) throw new Error("STRIPE_PRICE_ID_MONTHLY is not set");
if (!STRIPE_PRICE_YEARLY) throw new Error("STRIPE_PRICE_ID_YEARLY is not set");
```

Install: `npm install stripe`

---

### `src/app/api/stripe/webhook/route.ts`

Stripe sends events here after subscription changes. This is the **source of truth** for `isPro`.

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

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error("checkout.session.completed: missing userId in metadata");
          break;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            isPro: true,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = ["active", "trialing"].includes(subscription.status);

        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            isPro: isActive,
            stripeSubscriptionId: subscription.id,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            isPro: false,
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        // Log only — don't revoke immediately. Stripe will retry and eventually
        // fire customer.subscription.updated with status "past_due" then "canceled".
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

> **Note:** The webhook body must be the raw string — do **not** call `req.json()` before passing it to `constructEvent`. Next.js App Router routes get the raw body via `req.text()`, which preserves the exact bytes Stripe signs.

---

### `src/app/api/stripe/checkout/route.ts`

Creates a Stripe Checkout session and returns the redirect URL.

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

---

### `src/app/api/stripe/portal/route.ts`

Redirects a Pro user to the Stripe Customer Portal to manage billing.

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

---

### `src/actions/subscription.ts`

Client-callable action to fetch current subscription status for the settings page.

```typescript
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type SubscriptionStatus = {
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function getSubscriptionStatus(): Promise<ActionResult<SubscriptionStatus>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isPro: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  return { success: true, data: user };
}
```

---

### `src/components/settings/BillingSection.tsx`

Billing section for the settings page. Shows plan status and upgrade/manage controls.

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";

type Props = {
  isPro: boolean;
};

export function BillingSection({ isPro }: Props) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);

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

---

### `src/components/upgrade/UpgradePrompt.tsx`

Reusable inline prompt shown when a free-tier user hits a limit.

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

---

## Files to Modify

### `src/types/next-auth.d.ts`

Add `isPro` to the session type so it's available everywhere.

```typescript
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;              // add this
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    isPro?: boolean;               // add this
  }
}
```

---

### `src/auth.ts`

Modify the JWT callback to always sync `isPro` from the database. This ensures the session stays in sync after webhook updates without requiring a manual `session.update()` call — a simple page reload after checkout is enough.

```typescript
callbacks: {
  async jwt({ token, user }) {
    if (user) token.id = user.id;

    // Always sync isPro from DB so webhook-driven changes (Stripe events)
    // are reflected on the next session validation without a manual update().
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

This adds one small DB query per session validation. Acceptable for a low-traffic app. Add Redis caching later if needed.

---

### `src/lib/db/limits.ts`

Add free-tier plan limits alongside existing query-size constants.

```typescript
// Existing constants...
export const ITEMS_PER_PAGE = 21;
export const COLLECTIONS_PER_PAGE = 21;
export const DASHBOARD_COLLECTIONS_LIMIT = 6;
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10;
export const FAVORITES_PER_SECTION = 100;
export const ACCOUNT_DELETE_FILE_BATCH = 200;

// Free tier hard limits
export const FREE_TIER_ITEM_LIMIT = 50;
export const FREE_TIER_COLLECTION_LIMIT = 3;
```

---

### `src/lib/db/items.ts` — `createItem` function

Add a free-tier item count check before inserting.

```typescript
import { FREE_TIER_ITEM_LIMIT } from "@/lib/db/limits";

export async function createItem(userId: string, data: CreateItemData) {
  // Feature gate: enforce free tier item limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (!user?.isPro) {
    const count = await prisma.item.count({ where: { userId } });
    if (count >= FREE_TIER_ITEM_LIMIT) {
      throw new Error("FREE_TIER_LIMIT_REACHED");
    }
  }

  // ...existing create logic
}
```

In `src/actions/items.ts`, catch this specific error and return a user-friendly message:

```typescript
} catch (err) {
  if (err instanceof Error && err.message === "FREE_TIER_LIMIT_REACHED") {
    return {
      success: false,
      error: "You've reached the 50-item limit on the free plan. Upgrade to Pro for unlimited items.",
    };
  }
  return { success: false, error: "Failed to create item" };
}
```

---

### `src/lib/db/collections.ts` — `createCollection` function

Same pattern for collections.

```typescript
import { FREE_TIER_COLLECTION_LIMIT } from "@/lib/db/limits";

export async function createCollection(userId: string, data: CreateCollectionData) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPro: true },
  });

  if (!user?.isPro) {
    const count = await prisma.collection.count({ where: { userId } });
    if (count >= FREE_TIER_COLLECTION_LIMIT) {
      throw new Error("FREE_TIER_LIMIT_REACHED");
    }
  }

  // ...existing create logic
}
```

---

### `src/app/(app)/settings/page.tsx`

Fetch the user's subscription status server-side and pass it to `BillingSection`.

```typescript
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BillingSection } from "@/components/settings/BillingSection";
// ...other imports

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });

  return (
    <div className="space-y-8">
      {/* ...existing sections */}
      <BillingSection isPro={user?.isPro ?? false} />
      {/* ...existing sections */}
    </div>
  );
}
```

---

### `src/app/api/upload/route.ts`

Block file/image uploads for free-tier users.

```typescript
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ...rate limit check...

  // File/Image uploads are Pro-only
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  if (!user?.isPro) {
    return NextResponse.json({ error: "File uploads require a Pro subscription" }, { status: 403 });
  }

  // ...rest of handler unchanged
}
```

---

### `.env.example`

Add `NEXT_PUBLIC_APP_URL` if not already present:

```bash
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Stripe Dashboard Setup

1. **Create products:**
   - Product name: `DevMemory Pro`
   - Add two prices under the same product:
     - Monthly recurring: $8.00 / month → copy the Price ID to `STRIPE_PRICE_ID_MONTHLY`
     - Annual recurring: $72.00 / year → copy to `STRIPE_PRICE_ID_YEARLY`

2. **Configure Customer Portal:**
   - Stripe Dashboard → Billing → Customer Portal
   - Enable: cancel subscriptions, update payment method, view invoices
   - Set return URL to `https://yourapp.com/settings`

3. **Set up webhook endpoint:**
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yourapp.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

4. **Local testing with Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the `whsec_...` it prints to `.env` as `STRIPE_WEBHOOK_SECRET`.

---

## Testing Checklist

### Webhook
- [ ] Signature verification rejects a tampered body
- [ ] `checkout.session.completed` sets `isPro = true` and persists both Stripe IDs
- [ ] `customer.subscription.deleted` sets `isPro = false` and clears `stripeSubscriptionId`
- [ ] `customer.subscription.updated` with `status = "past_due"` sets `isPro = false`
- [ ] Handler returns 200 even for unhandled event types (no crash)

### Checkout flow
- [ ] Monthly checkout redirects to Stripe and returns to `/settings?upgraded=true`
- [ ] Annual checkout redirects correctly
- [ ] Already-Pro user gets 409 and no duplicate checkout session
- [ ] `isPro` updates in the session after a page reload (JWT callback picks up DB change)

### Customer Portal
- [ ] Pro user can open billing portal
- [ ] Free user without `stripeCustomerId` gets a 404 response
- [ ] Cancellation via portal fires webhook and clears `isPro`

### Feature Gating
- [ ] Free user creating their 51st item gets the limit error (not a crash)
- [ ] Free user creating their 4th collection gets the limit error
- [ ] Free user attempting a file upload gets a 403 from the upload API
- [ ] Pro user has no limits on any of the above

### Settings Page
- [ ] Free user sees upgrade cards with monthly and yearly pricing
- [ ] Pro user sees plan badge and "Manage Billing" button
- [ ] `?upgraded=true` param on `/settings` can show a success toast (optional, add if desired)

---

## Notes

- **Session sync strategy:** The JWT callback always fetches `isPro` from the DB on every session validation (one extra query). This is the simplest approach for a low-traffic app — the session stays in sync after any webhook update with just a page reload. Add a Redis cache on the DB lookup later if it becomes a bottleneck.
- **Feature flag during development:** The project spec says all Pro features stay open during dev. Wire in a `NEXT_PUBLIC_FEATURE_GATING_ENABLED=false` env check in the item/collection limit guards until you're ready to enforce.
- **File/Image type gating:** The `createItem` action with a `files` or `images` type slug should also check `isPro` before writing to the DB, not just the upload route. Otherwise a crafty user could craft a DB row that references an upload URL they obtained via a different means.
- **Export gating:** When export is implemented, scope it behind `isPro` in the server action or API route — same pattern as upload.
- **AI gating:** Check `session.user.isPro` (or DB `isPro`) at the top of any AI server action before calling OpenAI.
- **Idempotency:** Stripe may deliver the same webhook event more than once. The `update` calls above are idempotent (setting the same value twice is safe), but add a check if you add any side-effectful logic (e.g. sending a welcome email — gate that on `isPro` transitioning from `false` to `true`).
