import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
};

export function UpgradePrompt({ title, description }: Props) {
  return (
    <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-4 space-y-2">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <p className="text-sm font-medium text-purple-300">{title}</p>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Button asChild size="sm" variant="outline" className="border-purple-500/30 text-purple-300">
        <Link href="/settings#billing">Upgrade to Pro</Link>
      </Button>
    </div>
  );
}
