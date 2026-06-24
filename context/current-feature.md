# Current Feature: Favorite Toggle Buttons

## Status

In Progress

## Goals

- Add a favorite (star) toggle button to the item drawer that toggles `Item.isFavorite`
- Add a favorite toggle to collection cards/pages that toggles `Collection.isFavorite`
- Add a favorite toggle to item cards so favoriting works inline without opening the drawer
- Reflect favorite state instantly in the UI (optimistic update) and persist via Server Action
- Keep favorited collections/items in sync with the existing Favorites page and sidebar Favorites group

## TODOs

## Notes

- The Favorites page already exists (see History); this feature is the per-item / per-collection toggle controls that drive it.
- Both `Item` and `Collection` already have an `isFavorite` boolean in the schema — no migration required.
- Toggle via Server Actions: read the session, scope queries to `userId: session.user.id`, prefer a single atomic update over read-then-write.
- Use semantically distinct icons (filled vs. outline star) for on/off state; show a toast on action.

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
