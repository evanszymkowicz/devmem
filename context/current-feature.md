# Current Feature: Pagination

## Status

In Progress

## Goals

- Add pagination to `/items/[type]` and `/collections/[id]` listing pages
- Pagination controls at the bottom showing numbered page links plus prev/next
- Prev/next links are interactive; greyed out (disabled) when not available
- Use `null` for prev/next when there is no previous/next page
- Only fetch the rows a single page needs — never fetch all resources at once

## TODOs

- Add constants: `ITEMS_PER_PAGE = 21`, `COLLECTIONS_PER_PAGE = 21`
- Add dashboard constants: `DASHBOARD_COLLECTIONS_LIMIT = 6`, `DASHBOARD_RECENT_ITEMS_LIMIT = 10`
- Paginate items listing query (`take` + `skip`, with total count for page numbers)
- Paginate collections listing query (`take` + `skip`, with total count)
- Build a reusable pagination control component (page numbers + prev/next)
- Wire dashboard collections/recent items to the new dashboard limits

## Notes

- Source spec: `context/features/pagination-spec.md`
- Likely fewer than 21 items exist in dev data, so verify the single-page (no prev/next) state renders correctly
- Keep limit constants in `src/lib/db/limits.ts` per coding standards (centralize magic numbers, bounded queries)
- Each `findMany` must keep an explicit `take` — pagination should reduce, not remove, query bounds

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
