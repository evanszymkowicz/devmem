// Plain HTML email scaffold for v1 (no react-email dependency). Inline styles
// keep it resilient across email clients. Senders supply their copy + link; the
// wrapper, button, and "copy this link" fallback live here so a brand/style
// tweak only happens once.
export interface EmailTemplateOptions {
  heading: string;
  body: string;
  buttonLabel: string;
  buttonUrl: string;
  footer: string;
}

export function buildEmailHtml({
  heading,
  body,
  buttonLabel,
  buttonUrl,
  footer,
}: EmailTemplateOptions): string {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #111827;">
    <h1 style="font-size: 20px; margin: 0 0 16px;">${heading}</h1>
    <p style="font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
      ${body}
    </p>
    <p style="margin: 0 0 24px;">
      <a href="${buttonUrl}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; font-weight: 600;">
        ${buttonLabel}
      </a>
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 0 0 8px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; word-break: break-all; margin: 0;">
      ${buttonUrl}
    </p>
    <p style="font-size: 12px; line-height: 1.6; color: #6b7280; margin: 24px 0 0;">
      ${footer}
    </p>
  </div>`;
}
