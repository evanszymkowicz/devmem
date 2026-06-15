"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signInWithGitHub } from "@/actions/auth";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SIGN_IN_ERROR_CODE } from "@/lib/auth/error-codes";

// Brand GitHub mark — lucide-react no longer ships brand icons, so inline the SVG.
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

interface SignInFormProps {
  /** Where to land after a successful sign-in; defaults to the dashboard. */
  callbackUrl: string;
}

export function SignInForm({ callbackUrl }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Set when sign-in failed specifically because the email isn't verified, so we
  // can offer an inline link to the resend flow.
  const [unverified, setUnverified] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setPending(true);

    // redirect: false so we can surface errors inline rather than bouncing to
    // NextAuth's default error page.
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      // `code` distinguishes specific failure modes from generic bad credentials.
      if (result.code === SIGN_IN_ERROR_CODE.EMAIL_UNVERIFIED) {
        setUnverified(true);
        setError("Please verify your email before signing in.");
      } else if (result.code === SIGN_IN_ERROR_CODE.RATE_LIMITED) {
        setError("Too many sign-in attempts. Please try again in a few minutes.");
      } else {
        setError("Invalid email or password.");
      }
      setPending(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCredentials} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="flex flex-col gap-1" role="alert">
            <p className="text-sm text-destructive">{error}</p>
            {unverified && (
              <Link
                href="/verify-email?status=expired"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Resend verification email
              </Link>
            )}
          </div>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending && <Loader2 className="size-4 animate-spin" />}
          Sign in
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <form action={signInWithGitHub}>
        <Button type="submit" variant="outline" className="w-full">
          <GithubIcon className="size-4" />
          Sign in with GitHub
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
