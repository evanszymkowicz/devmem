import { createResetToken } from "@/lib/auth/reset-token";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";

/**
 * Issue a fresh password-reset token for an email and send the reset link.
 * Shared so the forgot-password route stays in sync with the token module.
 * Throws if email delivery fails (callers decide how to surface it).
 */
export async function issueAndSendPasswordReset(email: string): Promise<void> {
  const token = await createResetToken(email);
  await sendPasswordResetEmail({ to: email.toLowerCase(), token });
}
