import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/api/parse-body";
import { hashPassword } from "@/lib/auth/password";
import { consumeResetToken } from "@/lib/auth/reset-token";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { resetPasswordLimiter, checkRateLimit, getIp, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/auth/reset-password — consume a reset token and set a new password.
// Returns the standard { success, data, error } shape. Token consumption is
// single-use; invalid/expired tokens get a generic 400 so they can't be probed.
export async function POST(request: Request) {
  const rl = await checkRateLimit(resetPasswordLimiter, `reset-password:${getIp(request)}`);
  if (rl.limited) return rateLimitResponse(rl.retryAfter);

  const parsed = await parseJsonBody(request, resetPasswordSchema);
  if (parsed instanceof NextResponse) return parsed;

  const { token, password } = parsed.data;

  // Consume the token first (single-use). An invalid/expired/already-used token
  // is rejected before we touch any password.
  const consumed = await consumeResetToken(token);
  if (!consumed) {
    return NextResponse.json(
      { success: false, error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = await hashPassword(password);

    // updateMany so a since-deleted user doesn't throw. Completing a reset proves
    // control of the inbox, so we also stamp emailVerified when it's still null —
    // the link is functionally equivalent to a verification link. Already-verified
    // users keep their original timestamp (the `emailVerified: null` filter skips
    // them, so only the password is updated for them below).
    const now = new Date();
    const verifiedUpdate = await prisma.user.updateMany({
      where: { email: consumed.email, password: { not: null }, emailVerified: null },
      data: { password: passwordHash, emailVerified: now },
    });

    // If the user was already verified, the filtered update above matched nothing;
    // update the password without touching emailVerified.
    if (verifiedUpdate.count === 0) {
      await prisma.user.updateMany({
        where: { email: consumed.email, password: { not: null } },
        data: { password: passwordHash },
      });
    }
  } catch (error) {
    console.error("Failed to reset password:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { message: "Your password has been reset." },
  });
}
