// Sign-in error codes shared between the server (thrown from authorize) and the
// client (mapped to friendly messages). Kept free of any next-auth import so it's
// safe to include in client bundles.
//
// The `code` is surfaced in the redirect URL / signIn result, so it must not hint
// at anything sensitive — these are safe, user-facing categories.
export const SIGN_IN_ERROR_CODE = {
  INVALID_CREDENTIALS: "invalid-credentials",
  EMAIL_UNVERIFIED: "email-unverified",
} as const;
