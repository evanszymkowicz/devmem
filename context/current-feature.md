# Current Feature: Pinned Items

## Status

In Progress

## Goals

- Make the existing Pin button in `ItemDrawer` functional (it exists but has no `onClick`)
- Pinned items appear at the top of listings and in the dashboard's pinned items section
- Provide optimistic UI updates for instant feedback
- Show a toast notification on success/error

## TODOs

- Create `toggleItemPin` server action
- Wire up the Pin button in `ItemDrawer` with an `onClick` handler
- Add optimistic UI updates
- Add success/error toast notifications
- Sort pinned items to the top of listings
- Keep the Pin icon on `ItemCard` as a static indicator

## Notes

- Follow the existing Favorite Button pattern.
- Items only — not collections.
- The Pin icon on `ItemCard` remains a static indicator (display only, not interactive).

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
