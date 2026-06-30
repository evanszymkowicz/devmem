import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/openai", () => ({
  AI_MODEL: "gpt-5-nano",
  getOpenAIClient: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  aiTagLimiter: null,
  aiDescriptionLimiter: null,
  aiExplainLimiter: null,
  checkRateLimit: vi.fn(),
}));

import { generateAutoTags, generateDescription, explainCode } from "./ai";
import { auth } from "@/auth";
import { getOpenAIClient } from "@/lib/openai";
import { checkRateLimit } from "@/lib/rate-limit";

const mockAuth = vi.mocked(auth);
const mockGetClient = vi.mocked(getOpenAIClient);
const mockCheckRateLimit = vi.mocked(checkRateLimit);

const PRO_SESSION = { user: { id: "user-1", isPro: true } };
const FREE_SESSION = { user: { id: "user-1", isPro: false } };

function makeClient(outputText: string) {
  return {
    responses: {
      create: vi.fn().mockResolvedValue({ output_text: outputText }),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCheckRateLimit.mockResolvedValue({ limited: false });
});

describe("generateAutoTags", () => {
  it("returns unauthorized when not logged in", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns Pro-gating error for free users", async () => {
    mockAuth.mockResolvedValue(FREE_SESSION as never);
    const result = await generateAutoTags({ title: "Test" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/Pro/i);
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns rate-limit error when limit is hit", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    mockCheckRateLimit.mockResolvedValue({ limited: true, retryAfter: 120 });
    const result = await generateAutoTags({ title: "Test" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/rate limit/i);
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns validation error when title is empty", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const result = await generateAutoTags({ title: "" });
    expect(result).toEqual({ success: false, error: "Invalid input" });
  });

  it("returns normalized tags from {tags:[...]} response shape", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient(JSON.stringify({ tags: ["React", "TypeScript", "Hooks"] }));
    mockGetClient.mockReturnValue(client as never);

    const result = await generateAutoTags({ title: "React hook example", content: "useEffect(() => {})" });
    expect(result).toEqual({ success: true, data: ["react", "typescript", "hooks"] });
  });

  it("returns normalized tags from [...] (array) response shape", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient(JSON.stringify(["SQL", "Postgres", "query"]));
    mockGetClient.mockReturnValue(client as never);

    const result = await generateAutoTags({ title: "SQL query" });
    expect(result).toEqual({ success: true, data: ["sql", "postgres", "query"] });
  });

  it("caps results at 5 tags", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient(JSON.stringify({ tags: ["a", "b", "c", "d", "e", "f", "g"] }));
    mockGetClient.mockReturnValue(client as never);

    const result = await generateAutoTags({ title: "Many tags" });
    expect(result.success).toBe(true);
    expect((result as { success: true; data: string[] }).data).toHaveLength(5);
  });

  it("truncates content to 2000 chars before sending to API", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const longContent = "x".repeat(5000);
    const client = makeClient(JSON.stringify({ tags: ["code"] }));
    mockGetClient.mockReturnValue(client as never);

    await generateAutoTags({ title: "Long snippet", content: longContent });

    const callArg = client.responses.create.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("x".repeat(2000));
    expect(callArg.input).not.toContain("x".repeat(2001));
  });

  it("returns error when AI response is invalid JSON", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("not valid json");
    mockGetClient.mockReturnValue(client as never);

    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "Failed to parse AI response" });
  });

  it("returns error when AI response has unexpected format", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient(JSON.stringify({ result: "something" }));
    mockGetClient.mockReturnValue(client as never);

    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "Unexpected AI response format" });
  });

  it("returns service error when client.responses.create throws", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = {
      responses: { create: vi.fn().mockRejectedValue(new Error("Network error")) },
    };
    mockGetClient.mockReturnValue(client as never);

    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "AI service error. Please try again." });
  });

  it("returns quota exceeded message on OpenAI 429", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const quotaError = Object.assign(new Error("quota"), { status: 429 });
    const client = { responses: { create: vi.fn().mockRejectedValue(quotaError) } };
    mockGetClient.mockReturnValue(client as never);

    const result = await generateAutoTags({ title: "Test" });
    expect(result).toEqual({ success: false, error: "OpenAI quota exceeded. Add credits at platform.openai.com." });
  });
});

describe("generateDescription", () => {
  it("returns unauthorized when not logged in", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await generateDescription({ title: "Test" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns Pro-gating error for free users", async () => {
    mockAuth.mockResolvedValue(FREE_SESSION as never);
    const result = await generateDescription({ title: "Test" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/Pro/i);
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns rate-limit error when limit is hit", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    mockCheckRateLimit.mockResolvedValue({ limited: true, retryAfter: 60 });
    const result = await generateDescription({ title: "Test" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/rate limit/i);
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns validation error when title is empty", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const result = await generateDescription({ title: "" });
    expect(result).toEqual({ success: false, error: "Invalid input" });
  });

  it("returns the trimmed description on success", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("  A TypeScript hook for debouncing values.  ");
    mockGetClient.mockReturnValue(client as never);

    const result = await generateDescription({ title: "useDebounce", typeSlug: "snippets", language: "typescript" });
    expect(result).toEqual({ success: true, data: "A TypeScript hook for debouncing values." });
  });

  it("includes all available context fields in the prompt", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("A useful link.");
    mockGetClient.mockReturnValue(client as never);

    await generateDescription({
      title: "React docs",
      typeSlug: "links",
      url: "https://react.dev",
      content: null,
      language: null,
      fileName: null,
    });

    const callArg = client.responses.create.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("React docs");
    expect(callArg.input).toContain("links");
    expect(callArg.input).toContain("https://react.dev");
  });

  it("truncates content to 2000 chars before sending to API", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("A snippet.");
    mockGetClient.mockReturnValue(client as never);

    await generateDescription({ title: "Big snippet", content: "z".repeat(5000) });

    const callArg = client.responses.create.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("z".repeat(2000));
    expect(callArg.input).not.toContain("z".repeat(2001));
  });

  it("returns error when AI returns empty output", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("   ");
    mockGetClient.mockReturnValue(client as never);

    const result = await generateDescription({ title: "Test" });
    expect(result).toEqual({ success: false, error: "AI returned an empty description" });
  });

  it("returns service error when client.responses.create throws", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = {
      responses: { create: vi.fn().mockRejectedValue(new Error("Network error")) },
    };
    mockGetClient.mockReturnValue(client as never);

    const result = await generateDescription({ title: "Test" });
    expect(result).toEqual({ success: false, error: "AI service error. Please try again." });
  });

  it("returns quota exceeded message on OpenAI 429", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const quotaError = Object.assign(new Error("quota"), { status: 429 });
    const client = { responses: { create: vi.fn().mockRejectedValue(quotaError) } };
    mockGetClient.mockReturnValue(client as never);

    const result = await generateDescription({ title: "Test" });
    expect(result).toEqual({ success: false, error: "OpenAI quota exceeded. Add credits at platform.openai.com." });
  });
});

describe("explainCode", () => {
  it("returns unauthorized when not logged in", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await explainCode({ content: "console.log('hi')", typeSlug: "snippets" });
    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns Pro-gating error for free users", async () => {
    mockAuth.mockResolvedValue(FREE_SESSION as never);
    const result = await explainCode({ content: "console.log('hi')", typeSlug: "snippets" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/Pro/i);
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns rate-limit error when limit is hit", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    mockCheckRateLimit.mockResolvedValue({ limited: true, retryAfter: 90 });
    const result = await explainCode({ content: "console.log('hi')", typeSlug: "snippets" });
    expect(result.success).toBe(false);
    expect((result as { success: false; error: string }).error).toMatch(/rate limit/i);
    expect(mockGetClient).not.toHaveBeenCalled();
  });

  it("returns validation error when content is empty", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const result = await explainCode({ content: "", typeSlug: "snippets" });
    expect(result).toEqual({ success: false, error: "Invalid input" });
  });

  it("returns trimmed explanation on success", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("  This snippet logs 'hi' to the console.  ");
    mockGetClient.mockReturnValue(client as never);

    const result = await explainCode({ content: "console.log('hi')", typeSlug: "snippets", language: "javascript" });
    expect(result).toEqual({ success: true, data: "This snippet logs 'hi' to the console." });
  });

  it("includes language and command kind hint in the prompt", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("Runs docker compose.");
    mockGetClient.mockReturnValue(client as never);

    await explainCode({ content: "docker compose up -d", typeSlug: "commands", language: null });

    const callArg = client.responses.create.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("terminal command");
    expect(callArg.input).toContain("docker compose up -d");
  });

  it("truncates content to 2000 chars before sending to API", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("A long snippet.");
    mockGetClient.mockReturnValue(client as never);

    await explainCode({ content: "x".repeat(5000), typeSlug: "snippets" });

    const callArg = client.responses.create.mock.calls[0][0] as { input: string };
    expect(callArg.input).toContain("x".repeat(2000));
    expect(callArg.input).not.toContain("x".repeat(2001));
  });

  it("returns error when AI returns empty output", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = makeClient("   ");
    mockGetClient.mockReturnValue(client as never);

    const result = await explainCode({ content: "console.log('hi')", typeSlug: "snippets" });
    expect(result).toEqual({ success: false, error: "AI returned an empty explanation" });
  });

  it("returns service error when client.responses.create throws", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const client = { responses: { create: vi.fn().mockRejectedValue(new Error("Network error")) } };
    mockGetClient.mockReturnValue(client as never);

    const result = await explainCode({ content: "console.log('hi')", typeSlug: "snippets" });
    expect(result).toEqual({ success: false, error: "AI service error. Please try again." });
  });

  it("returns quota exceeded message on OpenAI 429", async () => {
    mockAuth.mockResolvedValue(PRO_SESSION as never);
    const quotaError = Object.assign(new Error("quota"), { status: 429 });
    const client = { responses: { create: vi.fn().mockRejectedValue(quotaError) } };
    mockGetClient.mockReturnValue(client as never);

    const result = await explainCode({ content: "console.log('hi')", typeSlug: "snippets" });
    expect(result).toEqual({ success: false, error: "OpenAI quota exceeded. Add credits at platform.openai.com." });
  });
});
