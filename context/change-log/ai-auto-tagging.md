# AI Auto-Tagging

## What was done

Added AI-powered tag suggestions to both the New Item dialog and Item Drawer edit mode. Pro users see a "Suggest Tags" button (Sparkles icon) in the tags section; clicking it calls the OpenAI Responses API and returns 3–5 tag badges, each with an accept ✓ or reject ✗ control. Accepted tags merge into the tag field; rejected ones are dismissed. Free users do not see the button, and the server action enforces Pro gating independently. This feature also establishes the OpenAI client utility and AI rate limiter that subsequent AI features will share.

As part of this work, the language dropdown for code items was also added and several code-review findings were fixed (wrong Monaco language IDs, blank Select for legacy values, `plaintext` sentinel mutation).

## Files added

- `src/lib/openai.ts` — lazy singleton OpenAI client (`getOpenAIClient()`) and `AI_MODEL = "gpt-5-nano"` constant
- `src/lib/languages.ts` — shared list of Monaco-compatible language values for the language Select
- `src/actions/ai.ts` — `generateAutoTags` server action: auth, Pro gating, Zod validation, rate limiting, Responses API call, dual JSON-shape handling, lowercase normalization, 2000-char content truncation
- `src/actions/ai.test.ts` — 10 unit tests covering all branches (unauthorized, Pro gate, rate limit, validation, both response shapes, cap, truncation, bad JSON, unexpected format, network error)
- `src/components/items/LanguageSelect.tsx` — shared Select component; maps unknown/empty values to a "None" sentinel so legacy free-text languages never render blank
- `src/components/items/TagSuggestions.tsx` — renders suggestion badges with per-tag accept/reject buttons
- `src/components/items/use-new-item-form.ts` — custom hook extracted from `NewItemDialog` managing all form state + AI suggestion state (`tagSuggestions`, `suggestingTags`, accept/reject handlers)

## Files changed

- `src/lib/rate-limit.ts` — added `aiTagLimiter` (20 req/hr sliding window)
- `src/lib/validations/items.ts` — added shared `CONTENT_TYPE_SLUGS`, `LANGUAGE_TYPE_SLUGS`, `URL_TYPE_SLUGS` Set constants; added `.max(50)` to `language` field for server-side bounding
- `src/components/items/NewItemDialog.tsx` — uses `useNewItemForm` hook; adds `LanguageSelect` above content editor; adds Suggest Tags button + `TagSuggestions` in tags section (Pro-only button)
- `src/components/items/ItemDrawerEditBody.tsx` — adds `LanguageSelect` above content editor; adds optional Suggest Tags button and `TagSuggestions` in tags section via new props (`isPro`, `tagSuggestions`, `suggestingTags`, `onSuggestTags`, `onAcceptTag`, `onRejectTag`)
- `src/components/items/ItemDrawer.tsx` — adds `isPro` prop; owns `tagSuggestions`/`suggestingTags` state and all AI handler functions; passes them to `ItemDrawerEditBody`; clears suggestions on cancel
- `src/components/items/ItemDrawerWrapper.tsx` — added `isPro` prop, forwarded to `ItemDrawer`
- `src/components/dashboard/SearchCommand.tsx` — added `isPro` prop, forwarded to `ItemDrawerWrapper`
- `src/components/dashboard/DashboardShell.tsx` — passes `isPro={user.isPro}` to `SearchCommand`
- `src/app/dashboard/page.tsx` — passes `isPro={sidebarUser.isPro}` to `ItemDrawerWrapper`
- `src/app/favorites/page.tsx` — passes `isPro={sidebarUser.isPro}` to `ItemDrawerWrapper`
- `src/app/collections/[id]/page.tsx` — passes `isPro={sidebarUser.isPro}` to `ItemDrawerWrapper`
- `src/app/items/[type]/page.tsx` — passes `isPro={sidebarUser.isPro}` to `ItemDrawerWrapper`

## Key decisions

**Responses API, not Chat Completions** — gpt-5-nano returns empty content with the Chat Completions API. The Responses API (`client.responses.create`) with `text: { format: { type: "json_object" } }` and reading from `response.output_text` is the only path that works.

**Dual JSON-shape handling** — the model sometimes returns `{"tags": [...]}` and sometimes `[...]`. Both shapes are handled; unexpected formats return a graceful error.

**`__none__` sentinel in LanguageSelect** — storing `""` in state for "no language" is correct, but Radix Select renders blank when `value` has no matching `SelectItem`. Solved by mapping `""` to a real `__none__` sentinel item; unknown legacy free-text values also map to it so old data never breaks the Select.

**`useNewItemForm` hook extraction** — the New Item dialog's state grew large enough that extracting it into a custom hook made the AI state additions clean rather than sprawling. The hook owns form, type, collection, upload, and AI suggestion state in one place.

**`isPro` threaded as a prop** — rather than reading `isPro` client-side via a fetch, it's fetched once in the server component and passed down through `DashboardShell` → `SearchCommand` → `ItemDrawerWrapper` → `ItemDrawer` → `ItemDrawerEditBody`. No extra round-trip.

**Server-side Pro gating** — UI hiding is convenience only; the server action independently checks `session.user.isPro` and returns an error for non-Pro users, so the gate cannot be bypassed by calling the action directly.
