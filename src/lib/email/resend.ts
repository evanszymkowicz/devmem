import { Resend } from "resend";

// Fail loud at module load if the key is missing, per coding standards — better a
// clear startup error than an opaque failure deep inside the Resend SDK later.
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error("RESEND_API_KEY is not set");

export const resend = new Resend(apiKey);

// Sender for all transactional mail. onboarding@resend.dev is Resend's shared dev
// sender — it only delivers to the account owner's email. Swap to a verified-domain
// address (and move this to env) before sending to real users.
export const EMAIL_FROM = "DevMemory <onboarding@resend.dev>";

// Absolute base URL used to build links inside emails (which can't be relative).
// Reuse the Auth.js URL env if present; fall back to localhost for dev. No trailing slash.
export function getAppBaseUrl(): string {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}
