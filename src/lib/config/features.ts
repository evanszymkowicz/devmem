// Feature flags read once from the environment. Plain `process.env` reads only —
// no Node-only APIs — so this module stays safe to import from the edge runtime
// (it is pulled in transitively via `src/auth.ts`).

// Email verification (send-on-register + block-unverified-sign-in). Defaults ON:
// only an explicit "false" disables it, so a missing var in production fails safe
// and keeps verification enabled. Disable locally while Resend has no verified
// domain (the dev sender only delivers to the account owner).
export const EMAIL_VERIFICATION_ENABLED =
  process.env.EMAIL_VERIFICATION_ENABLED !== "false";

// Free-tier usage limits (item/collection caps, Pro-only type blocks, upload gate).
// Set NEXT_PUBLIC_FEATURE_GATING_ENABLED=false in .env to disable during development.
// Remove or set to any other value to enable at launch.
export const FEATURE_GATING_ENABLED =
  process.env.NEXT_PUBLIC_FEATURE_GATING_ENABLED !== "false";
