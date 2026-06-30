import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parseJsonBody } from "@/lib/api/parse-body";
import { hashPassword } from "@/lib/auth/password";
import { issueAndSendVerification } from "@/lib/auth/send-verification";
import { registerSchema } from "@/lib/validations/auth";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/config/features";
import { registerLimiter, checkRateLimit, getIp, rateLimitResponse } from "@/lib/rate-limit";

// POST /api/auth/register — create an email/password user.
// Returns the standard { success, data, error } shape with matching status codes.
export async function POST(request: Request) {
  const rl = await checkRateLimit(registerLimiter, `register:${getIp(request)}`);
  if (rl.limited) return rateLimitResponse(rl.retryAfter);

  const parsed = await parseJsonBody(request, registerSchema);
  if (parsed instanceof NextResponse) return parsed;

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email: normalizedEmail, password: passwordHash },
      select: { id: true, name: true, email: true },
    });

    // Send the verification email when verification is enabled. A delivery failure
    // shouldn't roll back the account — the user can request a fresh link via the
    // resend flow — so we log and still return success. When verification is
    // disabled, skip the send entirely (the user is created with emailVerified:
    // null and the sign-in gate is likewise skipped).
    if (EMAIL_VERIFICATION_ENABLED) {
      try {
        await issueAndSendVerification(normalizedEmail);
      } catch (emailError) {
        console.error("Failed to send verification email on register:", emailError);
      }
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    // P2002 = unique constraint violation (email already registered). Don't leak
    // which field collided beyond the email the caller already supplied.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    console.error("Registration failed:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
