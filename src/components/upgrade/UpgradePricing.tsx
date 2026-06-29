"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function UpgradePricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null);

  async function handleUpgrade(plan: "monthly" | "yearly") {
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  const selectedPlan = isAnnual ? "yearly" : "monthly";

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Billing toggle */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-4">
          <span
            className={`text-[0.95rem] font-medium transition-colors ${
              !isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Monthly
          </span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            aria-label="Toggle annual billing"
          />
          <span
            className={`text-[0.95rem] font-medium transition-colors ${
              isAnnual ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Annual{" "}
            <span className="ml-1 rounded-full border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.12)] px-2 py-0.5 text-[0.72rem] font-bold text-[#22c55e]">
              Save 25%
            </span>
          </span>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Free plan */}
        <div className="relative rounded-[14px] border border-[#232838] bg-card p-8">
          <p className="text-[1.05rem] font-semibold text-muted-foreground">Free</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[2.8rem] font-extrabold tracking-tight">$0</span>
            <span className="text-muted-foreground">/forever</span>
          </div>
          <ul className="mt-4 mb-6 grid gap-2.5">
            {[
              "50 items",
              "3 collections",
              "All text item types",
              "Basic search",
              "Community support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-[0.95rem] text-muted-foreground">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
          <div className="block w-full rounded-[9px] border border-border bg-muted/30 py-2.5 text-center text-sm font-semibold text-muted-foreground">
            Current Plan
          </div>
        </div>

        {/* Pro plan */}
        <div
          className="relative rounded-[14px] border bg-card p-8"
          style={{
            borderColor: "color-mix(in srgb, #6366f1 55%, #232838)",
            boxShadow:
              "0 0 0 1px color-mix(in srgb, #6366f1 40%, transparent), 0 20px 50px rgba(99,102,241,0.18)",
          }}
        >
          <span
            className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[0.74rem] font-bold uppercase tracking-wider text-white shadow-[0_6px_18px_rgba(99,102,241,0.4)]"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            Most Popular
          </span>
          <p className="text-[1.05rem] font-semibold text-muted-foreground">Pro</p>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-[2.8rem] font-extrabold tracking-tight">
              {isAnnual ? "$6" : "$8"}
            </span>
            <span className="text-muted-foreground">/mo</span>
          </div>
          <p className="mb-4 min-h-[1.2em] text-[0.85rem] text-muted-foreground">
            {isAnnual ? "$72 billed annually" : "Billed monthly"}
          </p>
          <ul className="mb-6 grid gap-2.5">
            {[
              "Unlimited items",
              "Unlimited collections",
              "File & image uploads",
              "AI tagging, summaries & explain",
              "Prompt optimizer",
              "Export (JSON/ZIP)",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-[0.95rem] text-muted-foreground">
                <CheckIcon />
                {f}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => handleUpgrade(selectedPlan)}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-[9px] py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-shadow hover:shadow-[0_8px_26px_rgba(99,102,241,0.45)] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            <Sparkles className="size-4" />
            {loading ? "Redirecting to checkout..." : `Upgrade to Pro — ${isAnnual ? "$72/yr" : "$8/mo"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <span
      role="img"
      aria-label="Included"
      className="flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full"
      style={{
        background:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E\") center / 11px no-repeat, rgba(34,197,94,0.12)",
      }}
    />
  );
}
