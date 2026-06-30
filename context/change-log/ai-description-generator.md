# AI Description Generator

## What was done

Added a Pro-only "Generate" button next to the Description field in both the New Item dialog and the Item Drawer edit mode. Clicking it calls the OpenAI API with whatever is currently in the form — title, type, content, language, URL, and filename — and inserts a generated 1–2 sentence description directly into the field. No save required first. Works for all content types using whatever fields are available.

Also improved error handling across all AI actions: a shared `aiError()` helper now surfaces a clear "OpenAI quota exceeded" message (instead of a generic error) when the account hits its credit limit (HTTP 429).

## Files changed

- `src/actions/ai.ts` — added `generateDescription` server action (auth + Pro gate + rate limit + OpenAI call); added shared `aiError()` helper used by both actions for clean 429 detection; updated `generateAutoTags` catch to use `aiError()`
- `src/lib/rate-limit.ts` — added `aiDescriptionLimiter` (20 req/hour, matching tag limiter)
- `src/components/items/ItemDrawerEditBody.tsx` — added `generatingDescription` and `onGenerateDescription` props; renders Sparkles "Generate" button inline with Description label (Pro-only, disabled when title is empty)
- `src/components/items/ItemDrawer.tsx` — added `generatingDescription` state and `handleGenerateDescription` handler; passes both to `ItemDrawerEditBody`
- `src/components/items/NewItemDialog.tsx` — added Generate button to the Description section (present for all content types); pulls `generatingDescription` and `handleGenerateDescription` from the form hook
- `src/components/items/use-new-item-form.ts` — added `generatingDescription` state and `handleGenerateDescription` handler; exports both for use in `NewItemDialog`
- `src/actions/ai.test.ts` — added 8 new tests for `generateDescription` covering auth, Pro gate, rate limit, validation, happy path, context fields in prompt, content truncation, and error cases; updated rate-limit mock to include `aiDescriptionLimiter`

## Key decisions

**Description-level button, not content-type-gated** — the Generate button lives on the Description field rather than being conditional on content type. The server action uses whatever fields are populated, so URL items get title + url, file items get title + filename, and text items get title + content. One button, all types.

**`aiError()` shared helper** — rather than duplicating 429 detection in each catch block, a single helper handles quota errors for all current and future AI actions. Keeps error handling consistent and easy to extend (e.g. adding 503 handling later).

**Form state reads directly** — the handler reads from `editState` / `form` at call time rather than from the saved item, so the generated description reflects unsaved edits to content and title.

**Rate limiter per-action** — `aiDescriptionLimiter` is a separate limiter from `aiTagLimiter` (both 20/hr) so heavy use of one feature doesn't starve the other.

## Deferred

Browser end-to-end verification of a successful AI response is pending — the OpenAI account hit its quota limit (HTTP 429) during testing. TODOs added to `current-feature.md` to check OpenAI billing and Stripe API connection.
