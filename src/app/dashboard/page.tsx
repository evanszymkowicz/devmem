import { prisma } from "@/lib/prisma";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { PinnedItems } from "@/components/dashboard/PinnedItems";
import { RecentCollections } from "@/components/dashboard/RecentCollections";
import { RecentItems } from "@/components/dashboard/RecentItems";
import { StatsCards } from "@/components/dashboard/StatsCards";

async function getDemoUser() {
  return prisma.user.findUnique({
    where: { email: "demo@devmemory.io" },
    select: { id: true, name: true, email: true },
  });
}

export default async function DashboardPage() {
  const user = await getDemoUser();
  const userId = user?.id ?? null;

  const [itemTypes, collections] = userId
    ? await Promise.all([
        getSystemItemTypes(userId),
        getSidebarCollections(userId),
      ])
    : [[], []];

  const sidebarUser = {
    name: user?.name ?? "Demo User",
    email: user?.email ?? "demo@devmemory.io",
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
          <PinnedItems userId={userId} />
          <RecentItems userId={userId} />
        </div>
      </div>
    </DashboardShell>
  );
}
