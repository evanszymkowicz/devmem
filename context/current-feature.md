# Current Feature: Marketing Homepage Mockup

## Status

In Progress

## Goals

- Build a static marketing homepage prototype in `prototypes/homepage/` (`index.html`, `styles.css`, `script.js`)
- Dark theme using item-type accent colors (Snippet blue, Prompt amber, Command cyan, Note green, File slate, Image pink, URL indigo)
- Hero section with a "chaos to order" visual: chaos container (left, 8 animated floating icons), pulsing transform arrow (center), dashboard preview (right)
- Supporting sections: fixed navigation, hero text with gradient headline + CTAs, 6-card features grid, AI/Pro section with code-editor mockup, pricing (Free vs Pro with monthly/annual toggle), bottom CTA, footer
- Animations: requestAnimationFrame chaos icons (drift, wall bounce, mouse repel), CSS arrow pulse, scroll fade-in, navbar opacity on scroll
- Responsive: stack chaos/arrow/dashboard vertically + single-column grids on mobile; arrow rotates 90° to point down

## TODOs

## Notes

- Source spec: `context/features/homepage-spec.md`
- The spec's wordmark says **DevMemory** — that is outdated. Use **DevMemory** (**DevMem** for short) throughout. See [[product-name]].
- This is a standalone static prototype (plain HTML/CSS/JS in `prototypes/`), not part of the Next.js app — no React/Tailwind/Prisma involved.
- Pricing: Free = $0 / 50 items / 3 collections; Pro = $8/mo or $72/yr, unlimited + AI features; Pro card highlighted "Most Popular".
- Footer copyright uses the current year.

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
