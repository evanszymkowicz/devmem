import { issueHashedToken, consumeHashedToken } from "@/lib/auth/hashed-token";

// Email-verification tokens use the bare (lowercased) email as the identifier.
// The single-use, hashed, expiring lifecycle lives in `hashed-token.ts`, shared
// with the password-reset flow.

/**
 * Issue a fresh verification token for an email. Returns the raw token to embed in
 * the link. Supersedes any prior verification token for that email.
 */
export async function createVerificationToken(email: string): Promise<string> {
  return issueHashedToken(email.toLowerCase());
}

interface ConsumeResult {
  /** The email the token was issued for, when valid. */
  email: string;
}

/**
 * Validate and consume a raw verification token. Returns the associated email on
 * success and deletes the token (single-use). Returns null when the token is
 * unknown or expired.
 */
export async function consumeVerificationToken(
  rawToken: string,
): Promise<ConsumeResult | null> {
  const identifier = await consumeHashedToken(rawToken);
  if (identifier === null) return null;
  return { email: identifier };
}
