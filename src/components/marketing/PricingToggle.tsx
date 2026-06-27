"use client";

import { useState } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { ScrollReveal } from "./ScrollReveal";

export function PricingToggle() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="mx-auto max-w-[1180px] px-6 pb-22 pt-22" id="pricing">
      <div className="mb-12 text-center">
        <ScrollReveal>
          <h2 className="text-[clamp(1.7rem,3.5vw,2.6rem)] font-extrabold tracking-tight">
            Simple Pricing
          </h2>
          <p className="mt-3 text-[1.05rem] text-muted-foreground">
            Start free. Upgrade when you need more.
          </p>
          <div className="mt-6 inline-flex items-center gap-4">
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
        </ScrollReveal>
      </div>

      <div className="grid justify-center gap-6 sm:grid-cols-2 sm:max-w-[760px] mx-auto items-stretch">
        {/* Free plan */}
        <ScrollReveal className="h-full">
          <div className="relative flex flex-col h-full rounded-[14px] border border-[#232838] bg-[#11141d] p-8">
            <p className="text-[1.05rem] font-semibold text-muted-foreground">Free</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-[2.8rem] font-extrabold tracking-tight">$0</span>
              <span className="text-muted-foreground">/forever</span>
            </div>
            <p className="mb-4 min-h-[1.2em] text-[0.85rem] text-muted-foreground" />
            <ul className="mb-6 grid flex-1 content-start gap-2.5">
              {["50 items", "3 collections", "All text item types", "Basic search", "Community support"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2 text-[0.95rem] text-muted-foreground">
                    <CheckIcon />
                    {f}
                  </li>
                )
              )}
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-[9px] border border-[#232838] bg-white/[0.03] py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-white/[0.07]"
            >
              Get Started
            </Link>
          </div>
        </ScrollReveal>

        {/* Pro plan */}
        <ScrollReveal className="h-full">
          <div
            className="relative flex flex-col h-full rounded-[14px] border bg-[#11141d] p-8"
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
            <ul className="mb-6 grid flex-1 content-start gap-2.5">
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
            <Link
              href="/register"
              className="block w-full rounded-[9px] py-2.5 text-center text-sm font-semibold text-white shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-shadow hover:shadow-[0_8px_26px_rgba(99,102,241,0.45)]"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
            >
              Go Pro
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
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
