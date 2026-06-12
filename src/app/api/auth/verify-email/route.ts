import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consumeVerificationToken } from "@/lib/auth/verification-token";
import { getAppBaseUrl } from "@/lib/email/resend";

// GET /api/auth/verify-email?token=… — consume a verification token, mark the
// user's email verified, and redirect to the /verify-email result page with a
// status flag. An API route (not a Server Action) because it needs redirects.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const resultUrl = (status: string) =>
    new URL(`/verify-email?status=${status}`, getAppBaseUrl());

  if (!token) {
    return NextResponse.redirect(resultUrl("invalid"));
  }

  const consumed = await consumeVerificationToken(token);
  if (!consumed) {
    // Unknown, expired, or already-used token.
    return NextResponse.redirect(resultUrl("expired"));
  }

  try {
    // updateMany so an already-deleted/missing user doesn't throw; emails are
    // stored lowercased, matching the token identifier.
    await prisma.user.updateMany({
      where: { email: consumed.email },
      data: { emailVerified: new Date() },
    });
  } catch (error) {
    console.error("Failed to set emailVerified:", error);
    return NextResponse.redirect(resultUrl("error"));
  }

  return NextResponse.redirect(resultUrl("success"));
}
