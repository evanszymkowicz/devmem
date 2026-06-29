# Upgrade Button & Page

## What was done

Added a clear upgrade path for free users: a ghost "Upgrade" button in the app header links to a dedicated `/upgrade` page with pricing cards. Wired `UpgradePrompt` into the New Item dialog so free users see an inline gate when selecting Pro-only item types (Files, Images).

## Files changed

- `src/components/dashboard/TopBar.tsx` — added ghost "Upgrade to Pro" button with Sparkles icon; only renders when `isPro` is false
- `src/components/dashboard/DashboardShell.tsx` — added `isPro: boolean` to the `user` prop type; threads it to `TopBar` and `NewItemDialog`
- `src/components/items/NewItemDialog.tsx` — added `isPro` prop; Files/Images type buttons show a faint Sparkles badge; selecting a Pro-only type replaces the form with `UpgradePrompt`; fixed pre-existing `useEffect` setState lint error by replacing it with the React `useState` previous-value pattern (getDerivedStateFromProps equivalent)
- `src/components/upgrade/UpgradePrompt.tsx` — updated link target from `/settings#billing` to `/upgrade`
- `src/app/dashboard/page.tsx` — added `isPro` to `sidebarUser`
- `src/app/settings/page.tsx` — added `isPro` to `sidebarUser`
- `src/app/profile/page.tsx` — added `isPro` to `sidebarUser`
- `src/app/favorites/page.tsx` — added `isPro` to `sidebarUser`
- `src/app/collections/page.tsx` — added `isPro` to `sidebarUser`
- `src/app/collections/[id]/page.tsx` — added `isPro` to `sidebarUser`
- `src/app/items/[type]/page.tsx` — added `isPro` to `sidebarUser`

## Files added

- `src/app/upgrade/page.tsx` — server component; redirects unauthenticated users to `/sign-in` and Pro users to `/settings#billing`; renders `DashboardShell` + `UpgradePricing`
- `src/components/upgrade/UpgradePricing.tsx` — client component matching the marketing page's `PricingToggle` style: monthly/annual toggle, Free card with "Current Plan" label, Pro card with gradient checkout button that calls `/api/stripe/checkout`

## Key decisions

**Ghost button** — kept subtle (`variant="ghost"`) so it doesn't compete visually with "New Collection" (outline) and "New Item" (filled). A sparkles icon provides visual recognition without being loud.

**Dedicated `/upgrade` page inside the shell** — shows the pricing UI within the authenticated app rather than sending users to the marketing page. Gives the user full context (they're already signed in) and a one-click path to checkout.

**Checkout success stays at `/settings?upgraded=true`** — reuses the existing success toast flow in `BillingSection` rather than duplicating it on `/upgrade`.

**UpgradePrompt replaces the entire form** — rather than disabling the submit button or showing an error after submission, the form body is fully replaced when a Pro-only type is selected. This makes the gate immediately obvious before the user invests time filling out fields.

**`useState` previous-value pattern** — replaced the `useEffect`-based form reset (which violated `react-hooks/set-state-in-effect`) with React's recommended getDerivedStateFromProps equivalent: comparing current props against previous values stored in state and calling setState synchronously during render.
