import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

// Request a password-reset link. Submits to POST /api/auth/forgot-password,
// which responds generically so account existence is never revealed.
export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset it
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
