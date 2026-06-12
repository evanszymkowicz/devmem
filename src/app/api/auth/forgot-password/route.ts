import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { issueAndSendPasswordReset } from "@/lib/auth/send-password-reset";
import { forgotPasswordSchema } from "@/lib/validations/auth";

// POST /api/auth/forgot-password — issue a password-reset email for an account.
// Always responds generically (success shape, 200) so it can't be used to probe
// which emails are registered or which auth method they use.
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
    parsed = forgotPasswordSchema.parse(body);
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

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    // Only send for a real, password-based account. OAuth-only accounts have no
    // password to reset, so we silently no-op. We do this without changing the
    // response below so the endpoint never reveals whether an account exists or
    // how it authenticates.
    if (user?.password) {
      await issueAndSendPasswordReset(email);
    }
  } catch (error) {
    // Log internally but still respond generically (don't leak failures either).
    console.error("Failed to send password-reset email:", error);
  }

  return NextResponse.json({
    success: true,
    data: { message: "If an account with that email exists, a reset link was sent." },
  });
}
