import { resend, EMAIL_FROM, getAppBaseUrl } from "@/lib/email/resend";

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
    html: buildPasswordResetHtml(resetUrl),
  });

  if (error) {
    throw new Error(`Failed to send password-reset email: ${error.message}`);
  }
}

// Plain HTML template for v1 (no react-email dependency). Inline styles keep it
// resilient across email clients.
function buildPasswordResetHtml(resetUrl: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #111827;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">Reset your password</h1>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      We received a request to reset your DevMemory password. Click the button below to choose a new one. This link expires in 24 hours.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${resetUrl}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;">
        Reset password
      </a>
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 0 0 8px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; word-break: break-all; margin: 0;">
      ${resetUrl}
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 24px 0 0;">
      If you didn't request a password reset, you can safely ignore this email — your password won't change.
    </p>
  </div>`;
}
