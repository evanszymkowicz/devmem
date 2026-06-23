# Current Feature: Editor Preferences Settings

## Status

In Progress

## Goals

- Add an editor preferences section to the settings page that auto-saves to the database
- Font size dropdown
- Tab size dropdown
- Word wrap toggle (default: on)
- Minimap toggle (default: off)
- Theme dropdown: `vs-dark`, `monokai`, `github-dark` (default: `vs-dark`)
- Store preferences in a JSON column `editorPreferences` on the `User` model
- Server action to update preferences
- Apply the saved settings to the Monaco editor component
- Auto-save on change (no save button), with a success toast on save
- `EditorPreferencesContext` to expose preferences to client components

## TODOs

## Notes

- Schema change must go through a Prisma migration (`prisma migrate dev`) — never `prisma db push`. This feature requires running a migration to complete.
- Server action must read the session and scope the update to `userId: session.user.id` (never trust a client-supplied userId).
- Monaco theme values: `vs-dark`, `monokai`, `github-dark`. Custom themes (`monokai`, `github-dark`) likely need to be defined/registered with Monaco.

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
