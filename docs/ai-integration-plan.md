# AI Integration Plan

> Reference document for implementing Pro-only AI features using OpenAI `gpt-5-nano` in the DevMemory Next.js app.

---

## Table of Contents

- [Features in Scope](#features-in-scope)
- [Model Selection](#model-selection)
- [SDK Setup & Configuration](#sdk-setup--configuration)
- [Server Action Pattern](#server-action-pattern)
- [Streaming vs Non-Streaming](#streaming-vs-non-streaming)
- [Feature-by-Feature Implementation](#feature-by-feature-implementation)
- [Error Handling](#error-handling)
- [Pro User Gating](#pro-user-gating)
- [Cost Optimization](#cost-optimization)
- [UI Patterns](#ui-patterns)
- [Security Considerations](#security-considerations)
- [Implementation Roadmap](#implementation-roadmap)
- [File Structure](#file-structure)
- [Dependencies](#dependencies)

---

## Features in Scope

| Feature | Trigger | Response style | Input |
|---|---|---|---|
| Auto-tagging | After item save | JSON (tag list) | title + content snippet |
| AI summary | On demand | Non-streaming text | title + content |
| Code explanation | On demand | Streaming text | code content + language |
| Prompt optimizer | On demand | Non-streaming text | prompt content |

---

## Model Selection

### GPT-5 Nano

| Property | Value |
|---|---|
| **Model ID** | `gpt-5-nano` |
| **Input Cost** | $0.05 / 1M tokens |
| **Output Cost** | $0.40 / 1M tokens |
| **Strengths** | Ultra-low latency, cost-effective, good for classification/summarization |
| **Supports** | Structured outputs, function calling, streaming |

GPT-5 Nano is ideal for DevMemory's AI features because:

- **Auto-tagging** = classification task (nano's sweet spot)
- **Summaries** = summarization task (nano's sweet spot)
- **Code explanation** = moderate reasoning (nano handles well for short snippets)
- **Prompt optimization** = rewriting task (nano handles well)

### Cost Estimates

Assuming average item content is ~500 tokens input, ~200 tokens output:

| Feature | Est. Input Tokens | Est. Output Tokens | Cost per Call |
|---|---|---|---|
| Auto-tag | ~600 | ~50 | ~$0.00005 |
| Summary | ~600 | ~150 | ~$0.00009 |
| Code Explanation | ~800 | ~300 | ~$0.00016 |
| Prompt Optimizer | ~500 | ~400 | ~$0.00019 |

At these rates, even 10,000 AI calls/month costs ~$1.50. Very sustainable.

### Estimated Monthly Costs by Scale

| Scenario | AI Calls/Month | Estimated Cost |
|---|---|---|
| Light usage (10 Pro users) | ~1,000 | ~$0.15 |
| Moderate (100 Pro users) | ~10,000 | ~$1.50 |
| Heavy (1,000 Pro users) | ~100,000 | ~$15.00 |

Monitor usage in the OpenAI dashboard and set a spend alert before launch.

---

## SDK Setup & Configuration

### Recommended: Vercel AI SDK + OpenAI Provider

Use the **Vercel AI SDK** (`ai` + `@ai-sdk/openai`) instead of the raw OpenAI SDK. Benefits:

- Native Next.js integration with server actions
- Built-in streaming support (`streamText`, `streamObject`)
- Structured output with Zod schemas (`generateObject`) — no manual JSON schema wiring
- Provider-agnostic (easy to swap models later)
- React hooks for client-side streaming (`useCompletion`)

### Installation

```bash
npm install ai @ai-sdk/openai @ai-sdk/react
```

`OPENAI_API_KEY` is already in `.env.example` — just fill it in `.env`. The `@ai-sdk/openai` provider reads it automatically.

### AI Rate Limiter — extend `src/lib/rate-limit.ts`

Add a dedicated limiter alongside the existing ones using the same `makeLimiter` pattern:

```ts
export const aiLimiter = makeLimiter(20, "1 h"); // 20 AI calls per user per hour
```

### AI Config — `src/lib/ai.ts`

Centralise the model constant and all system prompts here. This keeps prompt text out of individual actions and makes it easy to tune them in one place:

```ts
import { openai } from "@ai-sdk/openai";

export const AI_MODEL = openai("gpt-5-nano");

export const SYSTEM_PROMPTS = {
  autoTag: `You are a developer tool assistant. Given a code snippet, command, prompt, note, or link, suggest relevant tags for categorization. Return only lowercase, hyphenated tags relevant to developers (e.g., "react-hooks", "git", "python", "api-design").`,

  summarize: `You are a developer tool assistant. Summarize the given content concisely in 1-2 sentences. Focus on what the content does or is about from a developer's perspective.`,

  explainCode: `You are a senior developer and educator. Explain the given code clearly and concisely. Cover what it does, key concepts used, and any important details. Use plain language suitable for intermediate developers.`,

  optimizePrompt: `You are an AI prompt engineering expert. Optimize the given prompt to be more effective. Improve clarity, add specificity, and structure it for better AI responses. Return only the optimized prompt text.`,
} as const;
```

---

## Server Action Pattern

Every AI server action follows this skeleton, which matches the existing pattern in `src/actions/items.ts`. Note: `session.user.isPro` is synced from the DB on every JWT refresh (`src/auth.ts`) so it is safe to read directly in server actions without an extra DB round-trip.

```ts
"use server";

import { auth } from "@/auth";
import { generateObject } from "ai";
import { z } from "zod";
import { AI_MODEL, SYSTEM_PROMPTS } from "@/lib/ai";
import { FEATURE_GATING_ENABLED } from "@/lib/config/features";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const inputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  typeName: z.string(),
});

export async function aiFeature(raw: unknown): Promise<ActionResult<string[]>> {
  // 1. Auth
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };

  // 2. Pro gate — FEATURE_GATING_ENABLED=false in dev to allow all users through
  if (FEATURE_GATING_ENABLED && !session.user.isPro) {
    return { success: false, error: "This feature requires a Pro subscription." };
  }

  // 3. Rate limit (per user, not per IP — AI calls are authenticated)
  const rl = await checkRateLimit(aiLimiter, `ai:${session.user.id}`);
  if (rl.limited) {
    return {
      success: false,
      error: `AI rate limit reached. Try again in ${Math.ceil(rl.retryAfter / 60)} minutes.`,
    };
  }

  // 4. Validate input
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  // 5. AI call
  try {
    const { object } = await generateObject({ model: AI_MODEL, /* ... */ });
    return { success: true, data: object.tags };
  } catch (err) {
    console.error("AI feature error:", err);
    return { success: false, error: handleAIError(err) };
  }
}
```

---

## Streaming vs Non-Streaming

### Decision Matrix

| Feature | Streaming? | Reason |
|---|---|---|
| Auto-tag | No | Short response (~50 tokens), structured data needed |
| Summary | No | Short response (~150 tokens), fills a single field |
| Code Explanation | **Yes** | Longer response (~300–500 tokens), better UX to show progress |
| Prompt Optimizer | No | Replaces content atomically; user sees accept/reject after full result |

### Streaming (Code Explanation only)

Server Actions cannot stream directly — use an API route with `streamText` and return `toDataStreamResponse()`:

**`src/app/api/ai/explain/route.ts`:**

```ts
import { streamText } from "ai";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AI_MODEL, SYSTEM_PROMPTS } from "@/lib/ai";
import { FEATURE_GATING_ENABLED } from "@/lib/config/features";
import { aiLimiter, checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  if (FEATURE_GATING_ENABLED) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isPro: true },
    });
    if (!user?.isPro) return new Response("Pro required", { status: 403 });
  }

  const rl = await checkRateLimit(aiLimiter, `ai:${session.user.id}`);
  if (rl.limited) {
    return new Response("Rate limit exceeded", {
      status: 429,
      headers: { "Retry-After": String(rl.retryAfter) },
    });
  }

  const { content, language } = await req.json();

  const result = streamText({
    model: AI_MODEL,
    system: SYSTEM_PROMPTS.explainCode,
    prompt: `Language: ${language ?? "unknown"}\n\nCode:\n\`\`\`\n${content.slice(0, 4000)}\n\`\`\``,
    maxTokens: 500,
  });

  return result.toDataStreamResponse();
}
```

**Client-side consumption using `useCompletion`:**

```tsx
"use client";

import { useCompletion } from "@ai-sdk/react";

function CodeExplanation({ content, language }: Props) {
  const { completion, isLoading, complete, stop } = useCompletion({
    api: "/api/ai/explain",
  });

  return (
    <div>
      <button onClick={() => complete("", { body: { content, language } })} disabled={isLoading}>
        {isLoading ? "Explaining..." : "Explain This Code"}
      </button>
      {isLoading && <button onClick={stop}>Stop</button>}
      {completion && <div className="prose dark:prose-invert">{completion}</div>}
    </div>
  );
}
```

### Non-Streaming (Auto-tag, Summary, Prompt Optimizer)

Call server actions directly from the client; manage `isLoading` state manually:

```tsx
const [isLoading, setIsLoading] = useState(false);

async function handleSuggestTags() {
  setIsLoading(true);
  const result = await suggestTags({ title, content, typeName });
  setIsLoading(false);
  if (result.success) setSuggestedTags(result.data);
  else toast.error(result.error);
}
```

---

## Feature-by-Feature Implementation

### Auto-tagging

- **Location:** `src/actions/ai.ts`
- **When:** After a successful `createItem` or `updateItem` — fire as a non-blocking follow-up, not part of the save
- **Input limit:** Truncate content to 1 500 chars before sending
- **Output:** 3–5 lowercase tag strings; show as accept/reject suggestions
- **Token budget:** ~250 total

```ts
import { generateObject } from "ai";
import { z } from "zod";

const autoTagSchema = z.object({
  tags: z.array(z.string()).min(1).max(8).describe("Relevant developer tags"),
});

export async function suggestTags(raw: unknown): Promise<ActionResult<string[]>> {
  // ... auth + gate + rate limit + validate ...
  const { title, content, typeName } = parsed.data;

  const { object } = await generateObject({
    model: AI_MODEL,
    system: SYSTEM_PROMPTS.autoTag,
    prompt: `Type: ${typeName}\nTitle: ${title}\nContent: ${content.slice(0, 1500)}`,
    schema: autoTagSchema,
    maxTokens: 100,
  });

  return { success: true, data: object.tags };
}
```

### AI Summary

- **Location:** `src/actions/ai.ts`
- **When:** On-demand button in item drawer
- **Input limit:** 3 000 chars
- **Output:** 1–3 sentence plain-text summary; display below the description field
- **Token budget:** ~700 total
- **Cache:** Store result in `Item.aiSummary` (optional DB field) to avoid re-calling for the same content

```ts
import { generateText } from "ai";

export async function generateSummary(raw: unknown): Promise<ActionResult<string>> {
  // ... auth + gate + rate limit + validate ...
  const { title, content } = parsed.data;

  const { text } = await generateText({
    model: AI_MODEL,
    system: SYSTEM_PROMPTS.summarize,
    prompt: `Title: ${title}\n\nContent: ${content.slice(0, 3000)}`,
    maxTokens: 150,
  });

  return { success: true, data: text };
}
```

### Code Explanation

- **Location:** `src/app/api/ai/explain/route.ts` (streaming API route, see above)
- **When:** On-demand button in item drawer for Snippet/Command types only
- **Input limit:** 4 000 chars of code
- **Output:** Streamed markdown explanation rendered in a read-only prose pane

### Prompt Optimizer

- **Location:** `src/actions/ai.ts`
- **When:** On-demand button in item drawer for Prompt type only
- **Input limit:** 3 000 chars
- **Output:** Rewritten prompt; show side-by-side with original and accept/discard

```ts
export async function optimizePrompt(raw: unknown): Promise<ActionResult<string>> {
  // ... auth + gate + rate limit + validate ...
  const { content } = parsed.data;

  const { text } = await generateText({
    model: AI_MODEL,
    system: SYSTEM_PROMPTS.optimizePrompt,
    prompt: content.slice(0, 3000),
    maxTokens: 400,
  });

  return { success: true, data: text };
}
```

---

## Error Handling

Centralise error mapping in `src/lib/ai.ts`:

```ts
export function handleAIError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message.includes("rate_limit")) {
      return "OpenAI rate limit reached. Please try again in a moment.";
    }
    if (err.message.includes("context_length")) {
      return "Content is too long for AI processing. Try with shorter content.";
    }
    if (err.message.includes("authentication") || err.message.includes("401")) {
      console.error("[AI] Authentication error:", err.message);
      return "AI service unavailable. Please contact support.";
    }
    if (err.message.includes("400")) {
      return "The content could not be processed by the AI.";
    }
  }
  console.error("[AI] Unexpected error:", err);
  return "An unexpected error occurred. Please try again.";
}
```

**Error scenarios to handle:**

- Rate limit (429) — user-friendly retry message
- Context length (400) — guide user to shorten content
- Authentication (401) — server misconfiguration; log but never expose to client
- Bad request (400) — content policy violation or malformed request
- Connection error — retry is appropriate; surface generic message

---

## Pro User Gating

### In Server Actions

`isPro` is synced into the JWT on every token refresh (`src/auth.ts:85`), so reading it from the session is safe and avoids an extra DB query:

```ts
if (FEATURE_GATING_ENABLED && !session.user.isPro) {
  return { success: false, error: "This feature requires a Pro subscription." };
}
```

### In API Routes

API routes use the same `auth()` call, but follow the established codebase pattern of a DB lookup (matches `src/app/api/upload/route.ts`):

```ts
if (FEATURE_GATING_ENABLED) {
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true },
  });
  if (!user?.isPro) return new Response("Pro required", { status: 403 });
}
```

### Key rules

- `FEATURE_GATING_ENABLED` defaults to `true`; set `NEXT_PUBLIC_FEATURE_GATING_ENABLED=false` in `.env` during development so all users can access AI features without a subscription
- `isPro` is set exclusively by the Stripe webhook — never trust client input

### In UI

Show AI buttons only when `session.user.isPro || !FEATURE_GATING_ENABLED`. For gated users, show a disabled button with a "Pro" badge linking to `/upgrade`:

```tsx
{isPro ? (
  <Button onClick={handleSuggestTags}>
    <Sparkles className="mr-2 h-4 w-4" /> Suggest Tags
  </Button>
) : (
  <Tooltip content="Upgrade to Pro for AI features">
    <Button disabled>Suggest Tags <Badge>Pro</Badge></Button>
  </Tooltip>
)}
```

---

## Cost Optimization

| Strategy | How |
|---|---|
| Truncate inputs | Cap content at 1 500–4 000 chars per feature before sending |
| `maxTokens` cap | Always set an explicit ceiling on every call |
| Non-streaming for structured data | Short JSON responses don't benefit from streaming |
| Rate limit per user | 20 AI calls / hour / user blocks abuse without hurting normal usage |
| No auto-trigger | Fire AI only on explicit button click — never on keystroke or content change |
| Cache summaries | Optional `Item.aiSummary` field: store on accept, skip the API call on re-open |
| Skip embeddings for now | Postgres full-text search is already implemented; add embedding costs only when needed |

**Don't auto-trigger on content change:**

```tsx
// Good: explicit button
<Button onClick={handleSuggestTags}>Suggest Tags</Button>

// Bad: fires on every edit
useEffect(() => { suggestTags(content); }, [content]);
```

---

## UI Patterns

### Loading States

```tsx
<Button onClick={handleAI} disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <Sparkles className="mr-2 h-4 w-4" />
      Suggest Tags
    </>
  )}
</Button>
```

### Accept / Reject — Auto-tag

Show suggested tags as clickable chips below the tag input. Each click adds the tag; the `✕` dismisses all suggestions without saving:

```tsx
{suggestedTags && (
  <div className="flex flex-wrap gap-1">
    {suggestedTags.map((tag) => (
      <Badge
        key={tag}
        variant="outline"
        className="cursor-pointer hover:bg-accent"
        onClick={() => addTag(tag)}
      >
        + {tag}
      </Badge>
    ))}
    <button onClick={() => setSuggestedTags(null)}>✕</button>
  </div>
)}
```

### Accept / Reject — Summary and Prompt Optimizer

```tsx
{generatedText && (
  <div className="border rounded-md p-3 space-y-2">
    <p className="text-sm text-muted-foreground">{generatedText}</p>
    <div className="flex gap-2">
      <Button size="sm" onClick={() => acceptResult(generatedText)}>Accept</Button>
      <Button size="sm" variant="ghost" onClick={() => setGeneratedText(null)}>Dismiss</Button>
    </div>
  </div>
)}
```

### Prompt Optimizer — Side-by-Side

Show original and optimized versions side by side so the user can compare before accepting:

```
[Original]           [Optimized ✨]
<read-only pane>     <read-only pane>
                 [Accept]  [Discard]
```

### Streaming — Code Explanation

Render markdown as it streams in using `useCompletion` (see Streaming section). The `stop` button lets the user abort a long explanation mid-stream.

### Feature Placement

| Feature | Location | Trigger |
|---|---|---|
| Auto-tag | NewItemDialog + ItemDrawer edit mode | "Suggest Tags" button near tag input |
| Summary | NewItemDialog + ItemDrawer edit mode | "Generate Summary" button near description field |
| Code Explanation | ItemDrawer view mode (Snippet/Command types) | "Explain This Code" in action bar |
| Prompt Optimizer | ItemDrawer edit mode (Prompt type only) | "Optimize Prompt" near content editor |

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| API key exposure | `OPENAI_API_KEY` only imported in server actions / API routes — never in client components |
| Prompt injection | Use `system` param for instructions, `prompt` for user content; `generateObject` with a Zod schema constrains output to a fixed shape and eliminates freeform injection channels |
| Content policy | Catch errors with `400` / bad-request messages; surface a user-friendly message, not the raw API error |
| Input length | Truncate all content before sending — prevents oversized requests and limits cost from malicious inputs |
| Rate limiting | Per-user `aiLimiter` on top of OpenAI's own limits; never expose raw rate-limit errors to the client |
| IDOR | All actions read `session.user.id` from the verified session; item content is fetched server-side by `userId` — never trust a client-supplied id |
| Logging | Log authentication errors and unexpected errors to the server; never forward raw error messages to the client |

**Prompt injection is further neutralised by structured output:** `generateObject` with a strict Zod schema means the model must respond inside a fixed JSON shape, giving injected instructions no freeform channel to exploit.

---

## Implementation Roadmap

### Phase 1: Foundation

1. Install `ai`, `@ai-sdk/openai`, `@ai-sdk/react`
2. Create `src/lib/ai.ts` with `AI_MODEL`, `SYSTEM_PROMPTS`, and `handleAIError`
3. Add `aiLimiter` to `src/lib/rate-limit.ts`
4. Verify `OPENAI_API_KEY` is in `.env`

### Phase 2: Auto-Tag

1. Create `suggestTags` server action in `src/actions/ai.ts`
2. Add "Suggest Tags" button to NewItemDialog near tag input
3. Add "Suggest Tags" button to ItemDrawer edit mode
4. Show suggested tags as clickable accept/dismiss chips
5. Write unit tests for the server action

### Phase 3: AI Summary

1. Create `generateSummary` server action in `src/actions/ai.ts`
2. Add "Generate Summary" button near description field in NewItemDialog
3. Add "Generate Summary" button in ItemDrawer edit mode
4. Show accept/dismiss UI for generated text
5. Write unit tests

### Phase 4: Code Explanation (Streaming)

1. Create `src/app/api/ai/explain/route.ts` with `streamText` + `toDataStreamResponse`
2. Create `src/components/ai/CodeExplanation.tsx` using `useCompletion`
3. Add "Explain This Code" to ItemDrawer action bar for Snippet/Command types
4. Render streamed markdown in a read-only prose pane
5. Write tests for the API route

### Phase 5: Prompt Optimizer

1. Create `optimizePrompt` server action in `src/actions/ai.ts`
2. Create `src/components/ai/OptimizePromptButton.tsx`
3. Add "Optimize Prompt" to ItemDrawer edit mode for Prompt type only
4. Show side-by-side original vs. optimized with accept/discard
5. Write unit tests

### Phase 6: Polish

1. Add Pro badges / upgrade prompts for free-tier users on all AI buttons
2. Confirm all AI buttons are disabled/hidden when `FEATURE_GATING_ENABLED && !isPro`
3. Add toast notifications for all AI actions
4. Test edge cases: empty content, very long content, rate limit hit
5. Run full test suite and build

---

## File Structure

```
src/
├── lib/
│   └── ai.ts                         # AI_MODEL, SYSTEM_PROMPTS, handleAIError
├── actions/
│   └── ai.ts                         # suggestTags, generateSummary, optimizePrompt
├── app/
│   └── api/
│       └── ai/
│           └── explain/
│               └── route.ts          # Streaming code explanation endpoint
└── components/
    └── ai/
        ├── SuggestTagsButton.tsx     # Auto-tag trigger + chip results
        ├── GenerateSummaryButton.tsx
        ├── CodeExplanation.tsx       # useCompletion streaming panel
        └── OptimizePromptButton.tsx
```

---

## Dependencies

```json
{
  "ai": "^5.x",
  "@ai-sdk/openai": "^1.x",
  "@ai-sdk/react": "^1.x"
}
```

No additional runtime dependencies beyond these — the project already has `react-markdown`, `zod`, `sonner` (toasts), and `lucide-react` (icons) which cover all UI needs for these features.
