# Marketing Homepage Functionality

## What was done

Converted the static `prototypes/homepage/` into the real Next.js marketing homepage at `/`. Built as a `(marketing)` route group to scope its layout (ambient glow, no sidebar) without affecting dashboard or auth routes. Wired up auth-awareness, animated components, scroll effects, and the pricing toggle as proper React components.

## Files added

- `src/app/(marketing)/layout.tsx` — marketing-only layout: fixed ambient radial-gradient glow overlay, no sidebar
- `src/app/(marketing)/page.tsx` — server component assembling all sections inline: Hero → Features → AI → PricingToggle → CTA → Footer; exports page metadata
- `src/components/marketing/MarketingNav.tsx` — async server component; calls `auth()` to read session; authenticated users see "Go to Dashboard →", unauthenticated see Sign In + Get Started
- `src/components/marketing/NavScrollEffect.tsx` — `'use client'`; passive scroll listener that adds `is-scrolled` class to the nav element, triggering frosted-glass border via Tailwind arbitrary variant `[&.is-scrolled]`
- `src/components/marketing/HeroChaos.tsx` — `'use client'`; ports the `requestAnimationFrame` bounce + mouse-repulsion animation from `prototypes/homepage/script.js` using `useRef` + `useEffect`; skips animation and does static placement when `prefers-reduced-motion` is set (checked inside `useEffect` to avoid SSR hydration mismatch)
- `src/components/marketing/PricingToggle.tsx` — `'use client'`; owns `isAnnual` state; uses ShadCN `Switch` to toggle between monthly ($8/mo) and annual ($6/mo, $72 billed annually); both plan cards inline
- `src/components/marketing/ScrollReveal.tsx` — `'use client'`; IntersectionObserver wrapper that fades sections from `opacity-0 translate-y-6` to visible on scroll; no-ops immediately for `prefers-reduced-motion`

## Files modified

- `src/app/globals.css` — added 7 item-type color vars to `@theme` (`--color-snippet` through `--color-link`); added `scroll-padding-top: 80px` on `html` for fixed nav; added `tag-in` keyframe for AI section tag chip animation
- `src/app/page.tsx` — deleted (3-line placeholder; `(marketing)/page.tsx` now owns `/` — both can't coexist in Next.js App Router)

## Key decisions

**`(marketing)` route group** — scopes the ambient glow layout to marketing pages only. The existing root layout has no sidebar, so the only marketing-specific concern is the glow background and scroll padding. Dashboard/auth pages are unaffected.

**`proxy.ts` already covers `/`** — Next.js 16 renamed `middleware.ts` to `proxy.ts`. The proxy's matcher never included `/`, so the homepage was already public. A `middleware.ts` created to "add `/` to the public routes list" immediately conflicted with `proxy.ts` and was removed.

**No hydration mismatch in HeroChaos** — the original design had a `prefersReduced` variable read at render time (`typeof window !== "undefined" ? matchMedia(...).matches : false`), which returns `false` on the server but `true` on reduced-motion clients — a hydration mismatch. Fixed by always rendering the `fieldRef` div from SSR and handling both animated and reduced-motion paths entirely inside `useEffect`.

**`dangerouslySetInnerHTML` for feature icons and chaos icons** — all SVG content comes from hardcoded module-level constants, never user data, so there is no XSS risk.

**Item-type colors** — used the project-overview colors (blue snippet, purple prompt, orange command, yellow note, gray file, pink image, emerald link), not the prototype's CSS vars (which differed for prompt/command/note/link).

## Mobile fixes (found in browser testing)

- **Nav button wrapping**: "Go to Dashboard →" wrapped to two lines at 390px — added `whitespace-nowrap`
- **AI editor overflow**: `<pre>` intrinsic width pushed the editor card past the viewport — added `min-w-0` to the AI section grid and its `ScrollReveal` child so CSS Grid constrains the item width; the `<pre>` now scrolls internally

## Testing

Browser-verified at desktop and mobile (390px): hero chaos animation + mouse repulsion, dashboard preview panel, features 3→1 column reflow, AI editor mockup with animated tag chips, pricing toggle ($8→$6/mo), scroll reveal on all sections, nav frosted-glass on scroll, auth-aware nav ("Go to Dashboard →" with active session). Build clean, 139/139 tests pass. Screenshots in `.playwright-mcp/marketing-homepage/`.
