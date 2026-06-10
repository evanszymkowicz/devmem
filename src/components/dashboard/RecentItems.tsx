import { Clock } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { getRecentItems } from "@/lib/db/items";

interface RecentItemsProps {
  userId: string | null;
}

export async function RecentItems({ userId }: RecentItemsProps) {
  const recent = userId ? await getRecentItems(userId) : [];

  if (recent.length === 0) return null;

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
