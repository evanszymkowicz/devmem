import { Code, Link2, Sparkles, Terminal } from "lucide-react";

import { SignInForm } from "@/components/auth/SignInForm";

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

// Custom sign-in page (replaces NextAuth's default). The proxy redirects
// unauthenticated /dashboard visitors here with a callbackUrl to return to.
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="w-full max-w-3xl">
      <div className="grid md:grid-cols-2 gap-0 rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Left — form */}
        <div className="bg-card p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your DevMemory account
            </p>
          </div>
          <SignInForm callbackUrl={callbackUrl ?? "/dashboard"} />
        </div>

        {/* Right — value prop (hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-center gap-8 bg-muted/40 border-l border-border px-8 py-10">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Your developer knowledge hub</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              One place for every snippet, prompt, command, and link you reach for daily.
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {[
              { icon: Code, label: "Snippets & prompts", desc: "Save and retrieve code instantly" },
              { icon: Terminal, label: "Commands & notes", desc: "Never lose a useful one-liner" },
              { icon: Link2, label: "Links & files", desc: "Bookmark docs, tools, and resources" },
              { icon: Sparkles, label: "AI-powered", desc: "Auto-tag, explain, and optimize" },
            ].map(({ icon: Icon, label, desc }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="size-3.5 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
