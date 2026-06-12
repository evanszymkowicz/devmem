import { CredentialsSignin } from "next-auth";
import { SIGN_IN_ERROR_CODE } from "@/lib/auth/error-codes";

// Thrown from authorize when the password is correct but the email isn't verified,
// so the client can show a "verify your email / resend" message rather than the
// generic invalid-credentials one.
export class EmailUnverifiedError extends CredentialsSignin {
  code = SIGN_IN_ERROR_CODE.EMAIL_UNVERIFIED;
}
