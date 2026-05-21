import Link from "next/link";

import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { mockCollections } from "@/lib/mock-data";

export function RecentCollections() {
  // Show the 6 most-recent collections (favorites first, then the rest).
  const ordered = [
    ...mockCollections.filter((c) => c.isFavorite),
    ...mockCollections.filter((c) => !c.isFavorite),
  ].slice(0, 6);

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
        {ordered.map((col) => (
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>
    </section>
  );
}
