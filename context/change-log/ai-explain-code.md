# AI Explain Code

## What was done

Added a Pro-only "Explain" button to the code editor window controls in the item drawer read view, available for snippet and command item types only. Clicking it calls the OpenAI API and renders a concise markdown explanation (~200–300 words) inside the same code editor container. A Code / Explain tab toggle appears once an explanation is generated, letting the user switch back and forth without regenerating.

## Files changed

- `src/actions/ai.ts` — added `explainCode` server action with auth, Pro gate, Zod validation (`content` + `typeSlug` + optional `language`), rate limiting, content truncation at 4000 chars, and language-aware prompt; uses the shared `aiError()` helper for 429 detection
- `src/lib/rate-limit.ts` — added `aiExplainLimiter` (20 req/hour)
- `src/components/ui/code-editor.tsx` — added `onExplain`, `explaining`, `explanation`, and `isPro` props; renders Explain button (Loader2 spinner while generating, Crown + tooltip for free users) in the window controls header; Code/Explain tab toggle renders when an explanation is available; markdown explanation rendered below tabs using `react-markdown`
- `src/components/items/ItemDrawerViewBody.tsx` — added `isPro` prop; derives `showExplain` from item type slug (`snippets` / `commands`); manages `explaining` and `explanation` state; calls `explainCode` action and passes results down to `CodeEditor`
- `src/actions/ai.test.ts` — added 9 tests for `explainCode` covering auth, Pro gate, rate limit, empty content, language-aware prompt, command type, content truncation, happy path, and OpenAI error cases

## Key decisions

**Tab toggle, not a separate panel** — explanation renders inside the existing code editor container behind a Code/Explain tab rather than a separate drawer section. Keeps layout stable and avoids reflowing surrounding content.

**Read view only, not create/edit** — the Explain button lives in `ItemDrawerViewBody`, not the edit form or `NewItemDialog`. Explaining unsaved code isn't useful and the feature spec explicitly scoped it to read view.

**Type guard via slug** — `showExplain` is derived from `item.itemType.slug` matching `snippets` or `commands`, matching how the project already gates type-specific behavior rather than using a separate boolean prop.

**Content truncated at 4000 chars** — avoids unexpectedly large token counts for very long snippets; the prompt tells the model it may be truncated.
