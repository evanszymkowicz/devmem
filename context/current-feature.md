# Current Feature: Marketing Homepage

## Status

In Progress

## Goals

- Convert `prototypes/homepage/` into the real Next.js marketing homepage at `/`
- Public page accessible without auth; middleware updated to allow unauthenticated visitors
- Auth-aware nav: authenticated users see "Go to Dashboard →" instead of Sign In + Get Started
- Animated hero chaos icons using `requestAnimationFrame` (static grid for `prefers-reduced-motion`)
- Pricing toggle (monthly vs annual) using ShadCN `Switch`, swapping Pro price accordingly
- Scroll reveal on static sections via IntersectionObserver
- Frosted-glass nav border on scroll via `NavScrollEffect` client component
- Ambient radial-gradient glow background in the marketing layout
- Fully responsive: stacked hero on mobile, single-column features/pricing grids

## TODOs

- [x] `/` is public — `src/proxy.ts` (Next.js 16 convention) never included it in the protected matcher
- [x] Create `src/app/(marketing)/layout.tsx` — dark bg + ambient glow, scroll-padding-top 64px
- [x] Create `src/app/(marketing)/page.tsx` — assembles all sections
- [x] Create `src/components/marketing/MarketingNav.tsx` — server component, auth-aware
- [x] Create `src/components/marketing/NavScrollEffect.tsx` — `'use client'` scroll listener
- [x] Create `src/components/marketing/HeroChaos.tsx` — `'use client'` rAF animation
- [x] Create `src/components/marketing/PricingToggle.tsx` — `'use client'` billing toggle + plan cards
- [x] Implement static sections inline in `page.tsx`: Hero, Features, AI, CTA, Footer
- [x] Add ScrollReveal client wrapper for section entrance animations
- [x] Check `src/app/globals.css` for existing color vars before adding new ones

## Notes

- **File structure:** New files in `src/app/(marketing)/` and `src/components/marketing/`
- **Links:** Logo → `/`, Features → `#features`, Pricing → `#pricing`, Sign In → `/auth/signin`, Get Started → `/auth/register`, Dashboard → `/dashboard`, Go Pro → `/auth/register`, Footer links → `#` (placeholder)
- **Dashboard preview panel** (hero right): static JSX with colored dot + label rows and skeleton cards
- **Editor mockup** (AI section): static `<pre><code>` with `<span>` syntax highlighting + animated tag chips
- **Font:** `font-mono` for the editor mockup (JetBrains Mono already loaded or system mono)
- **Scroll padding:** `scroll-padding-top: 64px` in layout to account for fixed nav height
- **No dashboard sidebar** on marketing pages
- **Item-type colors:** check `globals.css` `@theme` for existing `--color-snippet` etc. vars before adding

## History

- Security & Quality Audit
- Phase 1: Foundation Layout
- Phase 2: Sidebar
- Phase 3: Main Area
- Prisma 7 + Neon PostgreSQL setup
- Seed sample data
- Dashboard Collections (real data)
- Dashboard Items (real data)
- Stats & Sidebar (real data)
- Pro Badge in Sidebar
- Code Quality Quick Wins
- Auth Phase 1: NextAuth v5 + GitHub OAuth
- Auth Phase 2: Credentials provider + registration API
- Auth Phase 3: Auth UI (sign in, register, sign out)
- Email Verification on Register
- Email Verification Toggle
- Forgot Password (reset via email link)
- Rate Limiting for Auth
- Profile Page
- Fix GitHub OAuth Redirect
- Items List View
- Item List Three-Column Layout
- Vitest Unit Testing Setup
- Item Drawer
- Item Drawer Edit Mode
- Item Delete
- Item Create
- Code Editor (Monaco)
- Markdown Editor
- File Upload with Cloudflare R2
- File List View
- Collections & Settings
- Global Search/Command Palette
- Pagination
- Editor Preferences Settings
- Favorites Page
- Favorite Toggle Buttons
- Favorites Page Client-Side Sorting
- Marketing Homepage Mockup
