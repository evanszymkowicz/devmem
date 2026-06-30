# Current Feature: AI Description Generator

## Status

In Progress

## Goals

- An icon button appears next to the description input in the item drawer (edit mode) that triggers AI generation
- Clicking the button calls an AI endpoint to generate a 1-2 sentence description based on whatever is currently in the title, content, type, language, and any other available fields — no save required first
- Works for all content types (TEXT, FILE, URL) using whatever fields are available (e.g. URL items use title + url, file items use title + filename, text items use title + content)
- The generated description is inserted directly into the description input field, ready for the user to accept or edit
- Button shows a loading state while the AI is generating
- Errors are shown via toast without breaking the form

## TODOs

- [ ] Add OpenAI credits — account hit quota limit (429) during testing; add at platform.openai.com/settings/billing

## Notes

- Model: OpenAI `gpt-5-nano` (matches existing AI features)
- This is a Pro-only AI feature — gate behind the existing feature flag pattern
- No need to save the item before generating; read directly from the current form state
- Keep the prompt concise: title + content type + content (truncated if long) + language + url/filename as available
- The button should be a small icon button (e.g. Sparkles icon) placed inline with the description label or at the end of the description textarea

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
