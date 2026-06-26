"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";

type Props = {
  isPro: boolean;
  itemCount: number;
  collectionCount: number;
};

export function BillingSection({ isPro, itemCount, collectionCount }: Props) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success("Welcome to DevMemory Pro!");
      window.history.replaceState({}, "", "/settings");
    }
  }, [searchParams]);

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

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open billing portal");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Plan</h2>
        {isPro && (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        )}
      </div>

      {isPro ? (
        <div className="rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            You&apos;re on the Pro plan. Unlimited items, collections, file uploads, and AI features.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePortal}
            disabled={loading === "portal"}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {loading === "portal" ? "Opening..." : "Manage Billing"}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            You&apos;re on the Free plan. Upgrade to Pro for unlimited items, collections,
            file uploads, AI features, and export.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{itemCount}/50 items</span>
            <span>{collectionCount}/3 collections</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 rounded-md border border-border p-3 space-y-2">
              <p className="text-sm font-medium">Monthly</p>
              <p className="text-2xl font-bold">
                $8<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleUpgrade("monthly")}
                disabled={loading !== null}
              >
                {loading === "monthly" ? "Redirecting..." : "Upgrade Monthly"}
              </Button>
            </div>
            <div className="flex-1 rounded-md border border-purple-500/30 bg-purple-500/5 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Yearly</p>
                <Badge variant="secondary" className="text-xs">Save 25%</Badge>
              </div>
              <p className="text-2xl font-bold">
                $72<span className="text-sm font-normal text-muted-foreground">/yr</span>
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => handleUpgrade("yearly")}
                disabled={loading !== null}
              >
                {loading === "yearly" ? "Redirecting..." : "Upgrade Yearly"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
