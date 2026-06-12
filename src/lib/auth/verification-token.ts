import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// Email-verification token lifetime. Single-use and short-lived; users who let it
// lapse can request a fresh one via the resend flow.
export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// We store only the SHA-256 hash of the token; the raw token lives solely in the
// emailed link. A DB leak therefore can't be replayed to verify accounts.
function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Issue a fresh verification token for an email. Invalidates any prior tokens for
 * that email first (so a re-send supersedes earlier links), then stores the new
 * token's hash with a 24h expiry. Returns the raw token to embed in the link.
 */
export async function createVerificationToken(email: string): Promise<string> {
  const identifier = email.toLowerCase();
  const rawToken = randomBytes(32).toString("hex");
  const token = hashToken(rawToken);
  const expires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  // Clear prior tokens for this email, then create the new one. Not wrapped in a
  // transaction: worst case a stale token lingers until it expires, which is harmless.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return rawToken;
}

interface ConsumeResult {
  /** The email the token was issued for, when valid. */
  email: string;
}

/**
 * Validate and consume a raw verification token. Returns the associated email on
 * success and deletes the token (single-use). Returns null when the token is
 * unknown or expired — in the expired case the stale row is cleaned up.
 */
export async function consumeVerificationToken(
  rawToken: string,
): Promise<ConsumeResult | null> {
  const token = hashToken(rawToken);

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;

  if (record.expires < new Date()) {
    // Expired: remove the dead row so it can't accumulate, and reject.
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }

  // Valid: consume it (single-use) and return the email it was issued for.
  await prisma.verificationToken.delete({ where: { token } });
  return { email: record.identifier };
}
