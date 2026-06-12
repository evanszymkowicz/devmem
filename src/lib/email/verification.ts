import { resend, EMAIL_FROM, getAppBaseUrl } from "@/lib/email/resend";

interface SendVerificationEmailArgs {
  to: string;
  /** Raw (unhashed) token to embed in the verification link. */
  token: string;
}

/**
 * Send the post-registration verification email. Builds an absolute link to the
 * verify-email API route carrying the raw token. Throws if Resend reports an error
 * so callers can decide how to surface a delivery failure.
 */
export async function sendVerificationEmail({ to, token }: SendVerificationEmailArgs) {
  const verifyUrl = `${getAppBaseUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Verify your DevMemory email",
    html: buildVerificationHtml(verifyUrl),
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}

// Plain HTML template for v1 (no react-email dependency). Inline styles keep it
// resilient across email clients.
function buildVerificationHtml(verifyUrl: string): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #111827;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">Verify your email</h1>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      Thanks for signing up for DevMemory. Click the button below to verify your email address and activate your account. This link expires in 24 hours.
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${verifyUrl}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;">
        Verify email
      </a>
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 0 0 8px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; word-break: break-all; margin: 0;">
      ${verifyUrl}
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 24px 0 0;">
      If you didn't create a DevMemory account, you can safely ignore this email.
    </p>
  </div>`;
}
