import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// Shared lifetime for the single-use, hashed email tokens stored in the
// VerificationToken table (email verification and password reset). Short-lived;
// users who let one lapse can request a fresh link.
export const HASHED_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// We store only the SHA-256 hash of the token; the raw token lives solely in the
// emailed link. A DB leak therefore can't be replayed.
function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Issue a fresh token for an identifier. Invalidates any prior tokens for that
 * identifier first (so a re-request supersedes earlier links), then stores the new
 * token's hash with the shared expiry. Returns the raw token to embed in the link.
 *
 * Not wrapped in a transaction: worst case a stale token lingers until it expires,
 * which is harmless.
 */
export async function issueHashedToken(identifier: string): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const token = hashToken(rawToken);
  const expires = new Date(Date.now() + HASHED_TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({ data: { identifier, token, expires } });

  return rawToken;
}

/**
 * Validate and consume a raw token. Returns the stored `identifier` on success and
 * deletes the row (single-use). Returns null when the token is unknown, rejected by
 * the optional `accept` predicate, or expired — in the expired case the stale row
 * is cleaned up.
 *
 * `accept` runs before the expiry check (and without deleting the row), so a token
 * from another flow can be rejected without consuming it — e.g. a verification
 * token replayed against the reset flow.
 */
export async function consumeHashedToken(
  rawToken: string,
  accept?: (identifier: string) => boolean,
): Promise<string | null> {
  const token = hashToken(rawToken);

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;

  if (accept && !accept(record.identifier)) return null;

  if (record.expires < new Date()) {
    // Expired: remove the dead row so it can't accumulate, and reject.
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }

  // Valid: consume it (single-use) and return the identifier it was issued for.
  await prisma.verificationToken.delete({ where: { token } });
  return record.identifier;
}
