import { Pin } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { getPinnedItems } from "@/lib/db/items";
import { prisma } from "@/lib/prisma";

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: "demo@devmemory.io" },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function PinnedItems() {
  const userId = await getDemoUserId();
  const pinned = userId ? await getPinnedItems(userId) : [];

  if (pinned.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Pin className="size-4 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight">Pinned</h2>
      </div>
      <div className="flex flex-col gap-3">
        {pinned.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
