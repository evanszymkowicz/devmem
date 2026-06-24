# Current Feature: Favorites Page

## Status

In Progress

## Goals

- Add a star icon button to the TopBar linking to `/favorites`
- Create a protected `/favorites` route
- Fetch all of the user's favorited items and collections
- Display them in a compact, dev-focused list view (VS Code/terminal style, not cards)
- Each row shows: type icon, title, type badge, date added
- Separate sections for items and collections, each with a count
- Clicking an item opens the ItemDrawer; clicking a collection navigates to `/collections/[id]`
- Empty state when there are no favorites
- Sort by most recently favorited (`updatedAt`)

## TODOs

## Notes

- UI style: monospace or semi-monospace font, minimal padding / high density
- Subtle hover states; no cards or heavy borders — clean lines only
- Scope all queries to the signed-in user (`userId: session.user.id`)

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
