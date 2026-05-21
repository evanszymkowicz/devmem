import { Pin } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { mockItems } from "@/lib/mock-data";

export function PinnedItems() {
  const pinned = mockItems.filter((i) => i.isPinned);

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
