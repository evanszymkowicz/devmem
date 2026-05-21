import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PinnedItems } from "@/components/dashboard/PinnedItems";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { StatsCards } from "@/components/dashboard/StatsCards";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your developer knowledge hub
          </p>
        </header>

        <div className="flex flex-col gap-8">
          <StatsCards />
          <RecentCollections />
          <PinnedItems />
          <RecentItems />
        </div>
      </div>
    </DashboardShell>
  );
}
