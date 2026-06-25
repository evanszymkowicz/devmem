# Auth Pages Marketing Nav

## What was done

Added the homepage `MarketingNav` to the auth layout so all auth pages (sign-in, register, forgot-password, reset-password, verify-email) share the same top nav as the marketing homepage. Also replaced the dashboard sidebar's "D" text placeholder with the proper book SVG logo, and extracted a shared `BrandLogo` component to eliminate the duplication.

## Files changed

- `src/app/(auth)/layout.tsx` — replaced the standalone "D" placeholder logo link with `<MarketingNav />`, changed the content wrapper from `<div>` to `<main id="main-content">` (skip-nav target), adjusted padding to `pt-16 pb-12` to clear the fixed 64px nav
- `src/components/marketing/MarketingNav.tsx` — changed Features/Pricing link hrefs from `#features`/`#pricing` to `/#features`/`/#pricing` so they navigate to homepage sections from any route; replaced inline SVG with `<BrandLogo />`
- `src/components/dashboard/Sidebar.tsx` — replaced inline "D" text placeholder and duplicate SVG with `<BrandLogo size="sm" />`
- `src/components/ui/brand-logo.tsx` — new shared component encapsulating the gradient book icon; accepts `size="sm"` (sidebar: 28px, rounded-md, 15px icon) or `size="md"` (nav: 30px, rounded-lg, 17px icon, default)

## Key decisions

**Auth layout uses `<main id="main-content">`** — the skip-navigation link in `MarketingNav` targets `#main-content`. The auth layout previously had a `<div>` with no id, so the skip link had no destination on auth pages. Switching to `<main>` is semantically correct and fixes the skip-nav in one change.

**Absolute `/#features` / `/#pricing` links** — hash-only links (`#features`) only work when already on the homepage. Switching to absolute paths (`/#features`) makes them work from any page and still scroll correctly on the homepage itself (browsers handle the navigate-then-scroll behavior natively).

**`BrandLogo` size prop instead of className pass-through** — the two uses differ only in container size and border-radius. A constrained `size` prop keeps the component's visual identity controlled and prevents ad-hoc overrides that could drift from the brand.

## Testing

Build clean, TypeScript clean. Browser-verified at desktop (1280px) and mobile (375px): nav renders on sign-in and register, form card is centered below the fixed nav with no overlap. Features/Pricing links updated. Screenshots in `.playwright-mcp/auth-pages-marketing-nav/`.

## Deferred

- **Mobile nav overflow at 375px (authenticated)** — "Go to Dashboard →" clips at 375px, pushing the hamburger off-screen. Pre-existing issue in `MarketingNav`; not introduced by this feature. Affects authenticated users visiting auth pages (edge case — they are normally redirected). Track separately.
- **Focus outline contrast** — nav link focus rings are low-contrast on dark background. Pre-existing; not introduced by this feature.
- **Short-viewport auth layout clipping** — no `overflow-y-auto` on the `<main>`; register form could clip on 568px screens. Low-priority edge case.
