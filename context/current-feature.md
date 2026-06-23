# Current Feature: Global Search / Command Palette

## Status

In Progress

## Goals

- Open a command palette with Cmd+K (Mac) / Ctrl+K (Windows)
- Fuzzy search across all items and collections
- Group results into Items and Collections sections
- Keyboard navigation (arrow keys, Enter to select)
- Show item type icon and collection item count in results
- Navigate to the item drawer or collection page on select
- TopBar search input opens the palette on click
- Show ⌘K hint in the search input placeholder

## TODOs

## Notes

- Use shadcn `cmdk` (Command) component
- Client-side fuzzy search only — no server round-trips
- Pre-fetch searchable data on app load
- Search data shape:
  - items: `id`, `title`, `type`, `content preview`
  - collections: `id`, `name`, `itemCount`
- Reuse existing data fetching functions

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
