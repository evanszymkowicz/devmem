import { Clock } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { getRecentItems } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devmemory.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function RecentItems() {
  const userId = await getDemoUserId();
  const recent = userId ? await getRecentItems(userId) : [];

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight">Recent</h2>
      </div>
      <div className="flex flex-col gap-3">
        {recent.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
