"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getOpenAIClient, AI_MODEL } from "@/lib/openai";
import { aiTagLimiter, aiDescriptionLimiter, checkRateLimit } from "@/lib/rate-limit";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function aiError(err: unknown): string {
  if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 429) {
    return "OpenAI quota exceeded. Add credits at platform.openai.com.";
  }
  return "AI service error. Please try again.";
}

const generateAutoTagsSchema = z.object({
  title: z.string().trim().min(1),
  content: z.string().nullable().optional(),
});

export async function generateAutoTags(
  input: z.infer<typeof generateAutoTagsSchema>,
): Promise<ActionResult<string[]>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!session.user.isPro) {
    return { success: false, error: "AI features require a Pro subscription." };
  }

  const parsed = generateAutoTagsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const outcome = await checkRateLimit(aiTagLimiter, `ai-tags:${session.user.id}`);
  if (outcome.limited) {
    const minutes = Math.ceil(outcome.retryAfter / 60);
    return {
      success: false,
      error: `Rate limit reached. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const { title, content } = parsed.data;
  const truncated = content ? content.slice(0, 2000) : "";

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions: "You are a developer tool assistant. Respond only with valid JSON.",
      input: `Suggest 3 to 5 short, relevant tags for this developer item. Tags must be lowercase, single words or short hyphenated phrases.\n\nTitle: ${title}\nContent:\n${truncated}\n\nRespond with JSON: {"tags": ["tag1", "tag2", ...]}`,
      text: { format: { type: "json_object" } },
    });

    let json: unknown;
    try {
      json = JSON.parse(response.output_text);
    } catch {
      return { success: false, error: "Failed to parse AI response" };
    }

    // Model may return {"tags": [...]} or [...]
    const rawTags = Array.isArray(json)
      ? json
      : json && typeof json === "object" && "tags" in json
        ? (json as { tags: unknown }).tags
        : null;

    if (!Array.isArray(rawTags)) {
      return { success: false, error: "Unexpected AI response format" };
    }

    const tags = rawTags
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 5);

    return { success: true, data: tags };
  } catch (err) {
    return { success: false, error: aiError(err) };
  }
}

const generateDescriptionSchema = z.object({
  title: z.string().trim().min(1),
  typeSlug: z.string().optional(),
  content: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
});

export async function generateDescription(
  input: z.infer<typeof generateDescriptionSchema>,
): Promise<ActionResult<string>> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Unauthorized" };
  if (!session.user.isPro) {
    return { success: false, error: "AI features require a Pro subscription." };
  }

  const parsed = generateDescriptionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid input" };

  const outcome = await checkRateLimit(aiDescriptionLimiter, `ai-desc:${session.user.id}`);
  if (outcome.limited) {
    const minutes = Math.ceil(outcome.retryAfter / 60);
    return {
      success: false,
      error: `Rate limit reached. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }

  const { title, typeSlug, content, url, language, fileName } = parsed.data;

  const contextParts: string[] = [`Title: ${title}`];
  if (typeSlug) contextParts.push(`Type: ${typeSlug}`);
  if (language) contextParts.push(`Language: ${language}`);
  if (url) contextParts.push(`URL: ${url}`);
  if (fileName) contextParts.push(`File: ${fileName}`);
  if (content) contextParts.push(`Content:\n${content.slice(0, 2000)}`);

  try {
    const client = getOpenAIClient();
    const response = await client.responses.create({
      model: AI_MODEL,
      instructions:
        "You are a developer tool assistant. Write concise, useful descriptions for developer knowledge items. Respond with only the description text — no quotes, no labels, no extra commentary.",
      input: `Write a 1-2 sentence description for this developer item.\n\n${contextParts.join("\n")}`,
    });

    const description = response.output_text.trim();
    if (!description) return { success: false, error: "AI returned an empty description" };

    return { success: true, data: description };
  } catch (err) {
    return { success: false, error: aiError(err) };
  }
}
