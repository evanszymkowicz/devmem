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

    const safeCb = callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/dashboard";
    router.push(safeCb);
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
