import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Assert an API route handler is authenticated. Returns the authed `userId`, or a
 * 401 `NextResponse` the caller returns as-is. This is the API-route mirror of the
 * Server Action `requireUserId` guard — every protected route opens with it so the
 * 401 shape stays consistent.
 *
 * Usage:
 *   const authed = await requireApiSession();
 *   if (authed instanceof NextResponse) return authed;
 *   const { userId } = authed;
 */
export async function requireApiSession(): Promise<{ userId: string } | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId: session.user.id };
}
