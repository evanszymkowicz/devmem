import { resend, EMAIL_FROM, getAppBaseUrl } from "@/lib/email/resend";
import { buildEmailHtml } from "@/lib/email/template";

interface SendPasswordResetEmailArgs {
  to: string;
  /** Raw (unhashed) token to embed in the reset link. */
  token: string;
}

/**
 * Send the password-reset email. Builds an absolute link to the /reset-password
 * page carrying the raw token (a page, not an API route, since the user must
 * enter a new password). Throws if Resend reports an error so callers can decide
 * how to surface a delivery failure.
 */
export async function sendPasswordResetEmail({ to, token }: SendPasswordResetEmailArgs) {
  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Reset your DevMemory password",
    html: buildEmailHtml({
      heading: "Reset your password",
      body: "We received a request to reset your DevMemory password. Click the button below to choose a new one. This link expires in 24 hours.",
      buttonLabel: "Reset password",
      buttonUrl: resetUrl,
      footer:
        "If you didn't request a password reset, you can safely ignore this email — your password won't change.",
    }),
  });

  if (error) {
    throw new Error(`Failed to send password-reset email: ${error.message}`);
  }
}
