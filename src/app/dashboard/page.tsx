import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PinnedItems } from "@/components/dashboard/PinnedItems";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ItemDrawerWrapper } from "@/components/items/ItemDrawerWrapper";

export default async function DashboardPage() {
  // The proxy guards /dashboard, so a session is expected here; fall back to null
  // defensively rather than assuming it.
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [itemTypes, collections] = userId
    ? await Promise.all([
        getSystemItemTypes(userId),
        getSidebarCollections(userId),
      ])
    : [[], []];

  const sidebarUser = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? null,
  };

  return (
    <DashboardShell itemTypes={itemTypes} collections={collections} user={sidebarUser}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Your developer knowledge hub
          </p>
        </header>

        <div className="flex flex-col gap-8">
          <StatsCards userId={userId} />
          <RecentCollections userId={userId} />
          <ItemDrawerWrapper collections={collections}>
            <PinnedItems userId={userId} />
            <RecentItems userId={userId} />
          </ItemDrawerWrapper>
        </div>
      </div>
    </DashboardShell>
  );
}
