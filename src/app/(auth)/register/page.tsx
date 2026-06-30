import { Code, FolderOpen, Search, Sparkles } from "lucide-react";

import { RegisterForm } from "@/components/auth/RegisterForm";

// Custom registration page. Submits to POST /api/auth/register and redirects to
// /sign-in on success.
export default function RegisterPage() {
  return (
    <div className="w-full max-w-3xl">
      <div className="grid md:grid-cols-2 gap-0 rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Left — form */}
        <div className="bg-card p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-xl font-semibold tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Start building your developer knowledge hub
            </p>
          </div>
          <RegisterForm />
        </div>

        {/* Right — value prop (hidden on mobile) */}
        <div className="hidden md:flex flex-col justify-center gap-8 bg-muted/40 border-l border-border px-8 py-10">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Everything in one place</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Stop losing knowledge across chat histories, bookmarks, and random files.
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {[
              { icon: Code, label: "7 built-in types", desc: "Snippets, prompts, commands, notes, links, files, images" },
              { icon: FolderOpen, label: "Collections", desc: "Group items any way you like" },
              { icon: Search, label: "Fast search", desc: "Find anything across all your knowledge" },
              { icon: Sparkles, label: "AI features", desc: "Auto-tag, explain code, optimize prompts" },
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
