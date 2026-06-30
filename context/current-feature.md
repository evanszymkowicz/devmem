# Current Feature: AI Prompt Optimizer

## Status

In Progress

## Goals

- An "Optimize" button appears in the MarkdownEditor header when viewing a Prompt item (read-only mode), positioned like the "Explain" button in the CodeEditor for snippets/commands
- Clicking "Optimize" calls an AI server action that reviews the prompt and returns a refined version
- While the AI call is in flight, the button shows "Optimizing…" and is disabled
- When the result arrives, an "Optimized" tab appears in the MarkdownEditor alongside the existing "Preview" tab
- The optimized content is displayed in that tab with a "Use This" button and a "Dismiss" button
- "Use This" opens the item in edit mode with the optimized prompt pre-filled as the content
- "Dismiss" clears the optimized result and returns to the Preview tab
- Non-pro users see a disabled "Optimize" button with a Crown icon (same pattern as "Explain" in CodeEditor)
- Rate limiter added for the optimize endpoint (20 req / 1 h)
- `optimizePrompt` server action and its rate limiter are covered in `ai.test.ts`

## TODOs

- [ ] Add `aiOptimizeLimiter` to `src/lib/rate-limit.ts`
- [ ] Add `optimizePrompt` server action to `src/actions/ai.ts`
- [ ] Extend `MarkdownEditor` props: `onOptimize`, `optimizing`, `optimizedContent`, `isPro`, `onUseOptimized`, `onDismissOptimized`
- [ ] Add Optimize button to `MarkdownEditor` header (Crown when non-pro, Sparkles+spinner when pro)
- [ ] Add "Optimized" tab in `MarkdownEditor` when `optimizedContent` is present; tab shows content + "Use This" / "Dismiss" buttons
- [ ] Wire up optimize state and handlers in `ItemDrawerViewBody` for `prompts` type slug
- [ ] Pass `onUseOptimized` callback from `ItemDrawer` into `ItemDrawerViewBody`; handler starts edit mode with optimized content as the content field
- [ ] Add `optimizePrompt` tests to `src/actions/ai.test.ts`

## Notes

- Only the `prompts` type slug shows the Optimize button
- The `onOptimize` / explain pattern mirrors the existing CodeEditor implementation closely — MarkdownEditor gains the same props structure
- "Use This" should NOT auto-save; it opens edit mode so the user can review and tweak before saving
- The AI prompt for optimization should instruct the model to refine clarity, structure, and specificity while preserving the intent — and only return the improved prompt text, no commentary
- Keep truncation to 4000 chars for the server action input (prompts can be longer than code snippets)
- Since `ItemDrawerViewBody` is read-only, the `onUseOptimized(content: string)` callback is passed in from `ItemDrawer`, which calls `dispatch({ type: "START_EDIT", item })` then patches the `editState.content`

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
- AI Explain Code
