# AI Prompt Optimizer

## What was done

Added a Pro-only "Optimize" button to the MarkdownEditor header for Prompt-type items in read-only view. Clicking it calls the OpenAI API to refine the prompt for clarity, specificity, and effectiveness while preserving intent. When the result arrives, Original / Optimized tabs appear inside the editor — the user can review the optimized version and either accept it ("Use This" opens edit mode with the optimized content pre-filled) or dismiss it.

## Files changed

- `src/actions/ai.ts` — added `optimizePrompt` server action with auth, Pro gate, Zod validation, rate limiting, 4000-char content truncation, and a prompt-engineering system instruction; reuses the shared `aiError()` helper for 429 detection
- `src/lib/rate-limit.ts` — added `aiOptimizeLimiter` (20 req/hour)
- `src/components/ui/markdown-editor.tsx` — added `onOptimize`, `optimizing`, `optimizedContent`, `isPro`, `onUseOptimized`, and `onDismissOptimized` props; Optimize button renders in the window-controls header (Sparkles + spinner for Pro users, Crown + disabled for free users); Original / Optimized tab toggle renders when optimization is active; Optimized pane shows markdown result with "Use This" / "Dismiss" action bar pinned below the scrollable content
- `src/components/items/ItemDrawerViewBody.tsx` — added `onUseOptimized` callback prop; derives `showOptimize` from `typeSlug === "prompts"`; manages `optimizing` and `optimizedContent` state; calls `optimizePrompt` action and wires results into `MarkdownEditor`
- `src/components/items/ItemDrawer.tsx` — added `handleUseOptimized` which dispatches `START_EDIT` followed by `SET_FIELD` to pre-populate edit state with the optimized content, then passes it as `onUseOptimized` to `ItemDrawerViewBody`
- `src/actions/ai.test.ts` — added 9 tests for `optimizePrompt` covering auth, Pro gate, rate limit, empty content validation, happy path trimming, 4000-char truncation, empty-output error, service error, and OpenAI 429 quota error

## Key decisions

**Same pattern as Explain** — the Optimize button is placed in the MarkdownEditor header (matching where Explain sits in CodeEditor), keeping the interaction model consistent across item types.

**View mode only** — the Optimize button lives in `ItemDrawerViewBody` (read-only view), not in the edit form. There is no value in optimizing unsaved or mid-edit content.

**Scrollable content, pinned action bar** — the Optimized pane uses `flex-col` with a `max-height` outer container, a scrollable inner prose div, and a `shrink-0` action bar beneath it. This ensures "Use This" / "Dismiss" buttons stay visible even for long optimized prompts.

**"Use This" opens edit mode, doesn't auto-save** — dispatching `START_EDIT` then `SET_FIELD` pre-fills the content field for the user to review before committing, matching the principle that AI suggestions should require human confirmation before saving.

**Type guard via slug** — `showOptimize = typeSlug === "prompts"` mirrors the existing pattern used for `showExplain`, keeping type-specific behavior gated at the view layer.

**4000-char truncation** — prompts can be longer than code snippets; the truncation limit is doubled compared to `explainCode` to accommodate typical prompt sizes.
