import { Clock } from "lucide-react";

import { ItemRow } from "@/components/dashboard/ItemRow";
import { mockItems } from "@/lib/mock-data";

export function RecentItems() {
  const recent = [...mockItems]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 10);

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
