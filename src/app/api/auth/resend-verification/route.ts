import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { issueAndSendVerification } from "@/lib/auth/send-verification";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/config/features";
import { resendVerificationLimiter, checkRateLimit, getIp, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/auth/resend-verification — issue a fresh verification email for an
// unverified account. Always responds generically (success shape, 200) so it
// can't be used to probe which emails are registered.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  let parsed;
  try {
    parsed = resendVerificationSchema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    throw error;
  }

  const email = parsed.email.toLowerCase();

  const rl = await checkRateLimit(resendVerificationLimiter, `resend-verification:${getIp(request)}:${email}`);
  if (rl.limited) return rateLimitResponse(rl.retryAfter);

  // When verification is disabled there's nothing to resend. Skip the lookup and
  // send, but still fall through to the identical generic response below so the
  // endpoint's behavior (and enumeration-safety) is unchanged from the client's view.
  if (EMAIL_VERIFICATION_ENABLED) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { password: true, emailVerified: true },
      });

      // Only send for a real, password-based, not-yet-verified account. We do this
      // silently — the response below is identical regardless of the outcome so the
      // endpoint never reveals whether an account exists or its verification state.
      if (user?.password && !user.emailVerified) {
        await issueAndSendVerification(email);
      }
    } catch (error) {
      // Log internally but still respond generically (don't leak failures either).
      console.error("Failed to resend verification email:", error);
    }
  }

  return NextResponse.json({
    success: true,
    data: { message: "If that account exists and isn't verified, a new link was sent." },
  });
}
