import { resend, EMAIL_FROM, getAppBaseUrl } from "@/lib/email/resend";
import { buildEmailHtml } from "@/lib/email/template";

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
    html: buildEmailHtml({
      heading: "Verify your email",
      body: "Thanks for signing up for DevMemory. Click the button below to verify your email address and activate your account. This link expires in 24 hours.",
      buttonLabel: "Verify email",
      buttonUrl: verifyUrl,
      footer:
        "If you didn't create a DevMemory account, you can safely ignore this email.",
    }),
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
