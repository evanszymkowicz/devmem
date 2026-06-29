# Current Feature: AI Auto-Tagging

## Status

In Progress

## Goals

- Add "Suggest Tags" button (Sparkles icon, ghost variant) near the tags input in the create item dialog and item drawer edit mode
- Button calls a `generateAutoTags` server action that uses OpenAI gpt-5-nano (Responses API) to return 3–5 tag suggestions based on item title and content
- Suggested tags appear as badges with per-tag accept (check) and reject (X) controls; accepted tags are added to the tag list
- Pro-only: button is hidden for free users; server action enforces Pro gating server-side
- Rate limited to 20 requests/hour per user (added to existing rate limit utility)
- Error handling via toast (Pro gating, rate limit, AI service errors)
- OpenAI client utility with `AI_MODEL` constant established for subsequent AI features
- Unit tests for the server action

## TODOs

- [ ] Create `src/lib/openai.ts` — lazy singleton OpenAI client + `AI_MODEL = "gpt-5-nano"` constant
- [ ] Add AI rate limit config (20 req/hr per user) to existing rate limit utility
- [ ] Create `src/actions/ai.ts` — `generateAutoTags` server action with auth, Pro gating, Zod validation, rate limiting, Responses API call
- [ ] Wire "Suggest Tags" button + suggestion badges into the tags section of `NewItemDialog` (via `useNewItemForm` or directly in the dialog)
- [ ] Wire the same UI into `ItemDrawerEditBody`
- [ ] Pass `isPro` to the create/edit UIs so the button can be hidden for free users
- [ ] Unit tests for `generateAutoTags`

## Notes

- **CRITICAL — use the Responses API, not Chat Completions.** gpt-5-nano returns empty content with Chat Completions.
  ```ts
  const response = await client.responses.create({
    model: 'gpt-5-nano',
    instructions: '...',
    input: '...',
    text: { format: { type: 'json_object' } },
  });
  const text = response.output_text;
  ```
- The model may return `{"tags": ["a","b"]}` OR `["a","b"]` — handle both shapes
- Normalize all tags to lowercase after receiving them
- Truncate content to 2000 chars before the API call
- `OPENAI_API_KEY` is already in `.env`
- `isPro` is available server-side via session; it is NOT currently passed to `NewItemDialog` or the drawer edit components — need to thread it through or pass it as a prop
- `zodResponseFormat` hits token limits with this model — use `json_object` format + manual JSON parse instead
- `max_tokens` is NOT supported; omit it or use `max_output_tokens` if needed

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
