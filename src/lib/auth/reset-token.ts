import { issueHashedToken, consumeHashedToken } from "@/lib/auth/hashed-token";

// Reset tokens share the VerificationToken table with email-verification tokens.
// We namespace the `identifier` so the two purposes never clobber one another:
// verification stores the bare email, reset stores `reset:<email>`. The shared
// single-use, hashed, expiring lifecycle lives in `hashed-token.ts`.
const RESET_IDENTIFIER_PREFIX = "reset:";

function resetIdentifier(email: string): string {
  return `${RESET_IDENTIFIER_PREFIX}${email.toLowerCase()}`;
}

/**
 * Issue a fresh password-reset token for an email. Returns the raw token to embed
 * in the link. Supersedes any prior reset token for that email; verification
 * tokens for the same email are left intact (different identifier namespace).
 */
export async function createResetToken(email: string): Promise<string> {
  return issueHashedToken(resetIdentifier(email));
}

interface ConsumeResult {
  /** The email the reset token was issued for, when valid. */
  email: string;
}

/**
 * Validate and consume a raw password-reset token. Returns the associated email on
 * success and deletes the token (single-use). Returns null when the token is
 * unknown, expired, or not a reset token. The `accept` guard rejects a replayed
 * verification token without consuming it.
 */
export async function consumeResetToken(
  rawToken: string,
): Promise<ConsumeResult | null> {
  const identifier = await consumeHashedToken(rawToken, (id) =>
    id.startsWith(RESET_IDENTIFIER_PREFIX),
  );
  if (identifier === null) return null;
  return { email: identifier.slice(RESET_IDENTIFIER_PREFIX.length) };
}
