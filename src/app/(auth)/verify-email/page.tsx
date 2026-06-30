import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResendVerificationForm } from "@/components/auth/ResendVerificationForm";

interface VerifyEmailPageProps {
  searchParams: Promise<{ status?: string }>;
}

type Status = "success" | "expired" | "invalid" | "error";

const VALID_STATUSES: Status[] = ["success", "expired", "invalid", "error"];

const CARD = "w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm";

// Result page for the email-verification flow. The verify-email API route
// redirects here with a ?status flag after consuming the token.
export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { status } = await searchParams;
  const resolved: Status = VALID_STATUSES.includes(status as Status)
    ? (status as Status)
    : "invalid";

  if (resolved === "success") {
    return (
      <div className={CARD}>
        <div className="flex flex-col items-center gap-6 text-center">
          <CheckCircle2 className="size-12 text-emerald-500" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">Email verified</h1>
            <p className="text-sm text-muted-foreground">
              Your account is now active. You can sign in.
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href="/sign-in">Continue to sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Failure states (expired / invalid / error) all offer a resend path.
  const isError = resolved === "error";
  const heading = isError ? "Something went wrong" : "Link expired or invalid";
  const description = isError
    ? "We couldn't verify your email. Request a new link below."
    : "This verification link is no longer valid. Request a new one below.";

  return (
    <div className={CARD}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-6 text-center">
          {isError ? (
            <AlertTriangle className="size-12 text-amber-500" />
          ) : (
            <XCircle className="size-12 text-destructive" />
          )}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <ResendVerificationForm />

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="font-medium text-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
