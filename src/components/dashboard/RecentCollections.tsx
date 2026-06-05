import Link from "next/link";

import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { getDashboardCollections } from "@/lib/db/collections";
import { prisma } from "@/lib/prisma";

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devmemory.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function RecentCollections() {
  const userId = await getDemoUserId();
  const collections = userId ? await getDashboardCollections(userId) : [];

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Collections</h2>
        <Link
          href="/collections"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          View all
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => (
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>
    </section>
  );
}
