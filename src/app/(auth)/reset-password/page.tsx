import Link from "next/link";
import { XCircle } from "lucide-react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

// Set a new password from a reset-email link. Reads the raw token from the query
// string and hands it to the form, which POSTs to /api/auth/reset-password.
// The API re-validates and consumes the token — this page only guards the
// obvious missing-token case so the user gets a clear path back.
export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <XCircle className="size-12 text-destructive" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">Invalid reset link</h1>
            <p className="text-sm text-muted-foreground">
              This link is missing its reset token. Request a new one below.
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="font-medium text-foreground hover:underline"
          >
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter a new password for your DevMemory account
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  );
}
