import { auth } from "@/auth";

// Result of the shared Server Action auth guard. Discriminated so a successful
// gate narrows to a guaranteed `userId` (and `isPro`) at the call site.
type AuthGate =
  | { ok: true; userId: string; isPro: boolean }
  | { ok: false; error: string };

/**
 * Read the session and assert the request is authenticated — the auth invariant
 * every Server Action must enforce before scoping Prisma queries to the user.
 * Pass `{ requirePro: true }` to additionally gate Pro-only actions.
 *
 * Usage:
 *   const gate = await requireUserId();
 *   if (!gate.ok) return { success: false, error: gate.error };
 *   // ...use gate.userId
 */
export async function requireUserId(
  opts?: { requirePro?: boolean },
): Promise<AuthGate> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }
  if (opts?.requirePro && !session.user.isPro) {
    return { ok: false, error: "AI features require a Pro subscription." };
  }
  return { ok: true, userId: session.user.id, isPro: !!session.user.isPro };
}
