import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// Password-reset token lifetime. Single-use and short-lived; users who let it
// lapse can request a fresh one via the forgot-password flow.
export const RESET_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

// Reset tokens share the VerificationToken table with email-verification tokens.
// We namespace the `identifier` so the two purposes never clobber one another:
// verification stores the bare email, reset stores `reset:<email>`. The `token`
// column is globally unique, so consume-by-token stays unambiguous regardless.
const RESET_IDENTIFIER_PREFIX = "reset:";

function resetIdentifier(email: string): string {
  return `${RESET_IDENTIFIER_PREFIX}${email.toLowerCase()}`;
}

// We store only the SHA-256 hash of the token; the raw token lives solely in the
// emailed link. A DB leak therefore can't be replayed to reset passwords.
function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Issue a fresh password-reset token for an email. Invalidates any prior reset
 * tokens for that email first (so a re-request supersedes earlier links), then
 * stores the new token's hash with a 24h expiry. Returns the raw token to embed
 * in the link. Only touches `reset:`-namespaced rows — verification tokens for
 * the same email are left intact.
 */
export async function createResetToken(email: string): Promise<string> {
  const identifier = resetIdentifier(email);
  const rawToken = randomBytes(32).toString("hex");
  const token = hashToken(rawToken);
  const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  // Clear prior reset tokens for this email, then create the new one. Not wrapped
  // in a transaction: worst case a stale token lingers until it expires, harmless.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return rawToken;
}

interface ConsumeResult {
  /** The email the reset token was issued for, when valid. */
  email: string;
}

/**
 * Validate and consume a raw password-reset token. Returns the associated email
 * on success and deletes the token (single-use). Returns null when the token is
 * unknown, expired, or not a reset token — in the expired case the stale row is
 * cleaned up.
 */
export async function consumeResetToken(
  rawToken: string,
): Promise<ConsumeResult | null> {
  const token = hashToken(rawToken);

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;

  // Guard against a verification token being replayed against the reset flow:
  // only accept `reset:`-namespaced identifiers here.
  if (!record.identifier.startsWith(RESET_IDENTIFIER_PREFIX)) return null;

  if (record.expires < new Date()) {
    // Expired: remove the dead row so it can't accumulate, and reject.
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }

  // Valid: consume it (single-use) and return the email it was issued for, with
  // the namespace prefix stripped back off.
  await prisma.verificationToken.delete({ where: { token } });
  return { email: record.identifier.slice(RESET_IDENTIFIER_PREFIX.length) };
}
