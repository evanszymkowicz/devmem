import { createVerificationToken } from "@/lib/auth/verification-token";
import { sendVerificationEmail } from "@/lib/email/verification";

/**
 * Issue a fresh verification token for an email and send the verification link.
 * Shared by the register and resend-verification routes so both stay in sync.
 * Throws if email delivery fails (callers decide how to surface it).
 */
export async function issueAndSendVerification(email: string): Promise<void> {
  const token = await createVerificationToken(email);
  await sendVerificationEmail({ to: email.toLowerCase(), token });
}
