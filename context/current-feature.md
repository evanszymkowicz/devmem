# Current Feature: Auth Pages Marketing Nav

## Status

In Progress

## Goals

- Add the homepage `MarketingNav` to the auth layout so sign-in, register, forgot-password, reset-password, and verify-email pages all show the full top nav
- Remove the standalone "D" placeholder logo link from the auth layout (the MarketingNav already provides the brand)
- Adjust auth layout so the form card is centered in the space below the fixed 64px nav (no overlap)
- The dashboard Sidebar already has the correct book SVG logo matching the homepage nav — no change needed there

## TODOs

- [x] Document feature
- [x] Update `src/app/(auth)/layout.tsx`: add `<MarketingNav />`, remove standalone logo link, offset form area below nav
- [x] Verify sign-in, register, forgot-password, and reset-password pages all render correctly with the nav

## Notes

- `MarketingNav` is a Server Component (calls `auth()`) — safe to use directly in the auth layout
- The nav is fixed-positioned (`h-16`, `top-0`) — the layout wrapper needs `pt-16` or `min-h-[calc(100vh-4rem)]` to avoid overlap
- The existing standalone logo in the auth layout (`href="/"`, text "D") should be removed; the nav covers it
- The Sidebar's "D" was already replaced with the book SVG in the current working tree (from the previous in-progress session)

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
- Marketing Homepage Functionality
- UI Polish & Accessibility Fixes
