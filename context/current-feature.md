# Current Feature: AI Explain Code

## Status

In Progress

## Goals

- `explainCode` server action with auth, Pro gating, Zod validation, and rate limiting
- "Explain" button (Sparkles icon) in the code editor window controls header, next to the Copy button
- Only shown for snippet and command item types in the item drawer (read view only, not create/edit)
- After generating, show Code/Explain tabs in the editor header to toggle between views
- Explanation rendered as markdown in the same container space as the code editor
- Concise explanation (~200–300 words) covering what the code does and key concepts
- Loading state: Loader2 spinner while generating
- Pro gating in UI: Crown icon + tooltip ("AI features require Pro subscription") for free users
- Error handling via toast (Pro gating, rate limit, AI service errors)
- Unit tests for the server action

## TODOs

- [ ] Create `src/actions/explain-code.ts` server action
- [ ] Add unit tests for the server action
- [ ] Pass `isPro` prop through to item drawer and code editor
- [ ] Add Explain button to code editor window controls header
- [ ] Add Code/Explain tab toggle state to code editor
- [ ] Render markdown explanation in the code editor container
- [ ] Add loading state (Loader2 spinner)
- [ ] Add Pro gating UI (Crown icon + tooltip for free users)

## Notes

- Explanations are NOT saved to the database — regenerated on each click
- Feature is only available in the item drawer read view (not create/edit forms)
- Only applies to snippet and command item types
- Model: OpenAI `gpt-5-nano`
- Follow existing AI action patterns (see `src/actions/generate-summary.ts` or similar)
- See `docs/ai-integration-plan.md` for full architectural context

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
- Pinned Items
- Favorite Toggle Buttons
- Favorites Page Client-Side Sorting
- Marketing Homepage Mockup
- Marketing Homepage Functionality
- UI Polish & Accessibility Fixes
- Auth Pages Marketing Nav
- Stripe Integration Phase 1: Core Infrastructure
- Stripe Integration Phase 2: Webhooks, Feature Gating & UI
- Upgrade Button & Page
- AI Auto-Tagging (language dropdown + tag suggestions)
- AI Description Generator
