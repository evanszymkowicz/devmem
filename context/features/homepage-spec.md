# Marketing Homepage

## Overview

Convert `prototypes/homepage/` into the real Next.js marketing homepage at `/`. Public page, auth-aware nav, built with Tailwind CSS v4 + ShadCN. No dashboard sidebar on this page.

---

## File Structure

**New**

- `src/app/(marketing)/page.tsx` — Homepage server component (assembles sections)
- `src/app/(marketing)/layout.tsx` — Layout without sidebar; ambient glow background
- `src/components/marketing/MarketingNav.tsx` — Server component, auth-aware nav
- `src/components/marketing/NavScrollEffect.tsx` — `'use client'` scroll opacity handler
- `src/components/marketing/HeroChaos.tsx` — `'use client'` animated chaos icons
- `src/components/marketing/PricingToggle.tsx` — `'use client'` monthly/annual billing toggle + plan cards

**Modified**

- `src/middleware.ts` — Add `/` to the public routes list so unauthenticated visitors aren't redirected

---

## Component Breakdown

### Server

**`page.tsx`** — Renders sections in order: MarketingNav → Hero → Features → AI → PricingToggle → CTA → Footer. All static sections are inline JSX here.

**`MarketingNav.tsx`** — Calls `auth()` to read the session. Authenticated users see a "Go to Dashboard →" link instead of Sign In + Get Started buttons.

**`(marketing)/layout.tsx`** — Sets dark background and the ambient radial-gradient glow (as a fixed pseudo-element via Tailwind `before:` or a `<div aria-hidden>` overlay). Includes scroll-behavior smooth.

### Client

**`NavScrollEffect.tsx`** — Mounts a passive `scroll` listener, toggles a `data-scrolled` attribute (or a Tailwind class) on the `<nav>` element for the frosted-glass border effect.

**`HeroChaos.tsx`** — Ports the `requestAnimationFrame` animation from `script.js`. Uses a `useRef` on a container div, creates icon elements, runs the bounce + mouse-repulsion loop. Skips the loop and renders a static grid when `prefers-reduced-motion` is set. Icons from Lucide React.

**`PricingToggle.tsx`** — Owns `isAnnual` state. Renders the billing toggle (ShadCN `Switch`) and both plan cards. Swaps Pro price between `$8/mo` and `$6/mo ($72/yr)` based on state.

---

## Links

| Element | Destination |
|---|---|
| Logo | `/` |
| Features nav link | `#features` |
| Pricing nav link | `#pricing` |
| Sign In | `/auth/signin` |
| Get Started (nav + hero + free plan) | `/auth/register` |
| Go to Dashboard (authed nav) | `/dashboard` |
| Hero "See Features" | `#features` |
| Go Pro button | `/auth/register` |
| Footer Changelog / About / Blog / Contact / Privacy / Terms | `#` (placeholder) |

---

## Implementation Notes

- **Item-type colors:** Check `src/app/globals.css` for existing `--color-snippet` etc. vars before adding new ones. If absent, add them to `@theme`.
- **Scroll reveal:** Use a small `ScrollReveal` client wrapper that applies `opacity-0 translate-y-6` initially and removes those classes after the element enters the viewport (IntersectionObserver). Wrap static sections in it.
- **Dashboard preview panel** (hero right side): static JSX with colored dot + label rows and skeleton cards — no real data.
- **Editor mockup** (AI section): static `<pre><code>` with `<span>` tags for syntax highlighting, plus animated tag chips using Tailwind `animate-` classes.
- **Scroll padding:** Set `scroll-padding-top` in the layout to account for the fixed nav height (`64px`).
- **Font:** Use `font-mono` (JetBrains Mono is already loaded or use system mono) for the editor mockup.
- **Responsive:** Stack the hero chaos/arrow/dashboard vertically below `md:`. Single-column feature and pricing grids on mobile. Hide nav links on small screens, keep action buttons.
