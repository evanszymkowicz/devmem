import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

const redis = createRedis();

function makeLimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) });
}

// One limiter per endpoint. null when Redis is unconfigured — callers fail open.
export const loginLimiter = makeLimiter(5, "15 m");
export const registerLimiter = makeLimiter(3, "1 h");
export const forgotPasswordLimiter = makeLimiter(3, "1 h");
export const resetPasswordLimiter = makeLimiter(5, "15 m");
export const resendVerificationLimiter = makeLimiter(3, "15 m");
export const uploadLimiter = makeLimiter(10, "1 h");
export const aiTagLimiter = makeLimiter(20, "1 h");
export const aiDescriptionLimiter = makeLimiter(20, "1 h");
export const aiExplainLimiter = makeLimiter(20, "1 h");

export function getIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

type RateLimitOutcome = { limited: false } | { limited: true; retryAfter: number };

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string,
): Promise<RateLimitOutcome> {
  if (!limiter) return { limited: false };
  try {
    const { success, reset } = await limiter.limit(key);
    if (!success) {
      return { limited: true, retryAfter: Math.ceil((reset - Date.now()) / 1000) };
    }
    return { limited: false };
  } catch {
    // Fail open: never block a request because Redis is down.
    return { limited: false };
  }
}

export function rateLimitResponse(retryAfter: number): NextResponse {
  const minutes = Math.ceil(retryAfter / 60);
  return NextResponse.json(
    {
      success: false,
      error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    },
  );
}
