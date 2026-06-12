"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Standalone form to request a fresh verification email. The endpoint responds
// generically (never reveals whether the email exists), so we always show the
// same confirmation regardless of the result.
export function ResendVerificationForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Generic confirmation regardless of whether an account exists.
      setSent(true);
      toast.success("If that account exists and isn't verified, a new link is on its way.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        If that account exists and isn&apos;t verified, we&apos;ve sent a new
        verification link. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        id="resend-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Resend verification email
      </Button>
    </form>
  );
}
