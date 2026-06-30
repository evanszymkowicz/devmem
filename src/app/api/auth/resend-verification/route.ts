import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/api/parse-body";
import { issueAndSendVerification } from "@/lib/auth/send-verification";
import { resendVerificationSchema } from "@/lib/validations/auth";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/config/features";
import { resendVerificationLimiter, checkRateLimit, getIp, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/auth/resend-verification — issue a fresh verification email for an
// unverified account. Always responds generically (success shape, 200) so it
// can't be used to probe which emails are registered.
export async function POST(request: Request) {
  const rl = await checkRateLimit(resendVerificationLimiter, `resend-verification:${getIp(request)}`);
  if (rl.limited) return rateLimitResponse(rl.retryAfter);

  const parsed = await parseJsonBody(request, resendVerificationSchema);
  if (parsed instanceof NextResponse) return parsed;

  const email = parsed.data.email.toLowerCase();

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
