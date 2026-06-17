import { notFound } from "next/navigation";
import { Code } from "lucide-react";

import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getItemsByType, getSystemItemTypes } from "@/lib/db/items";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemCard } from "@/components/items/ItemCard";
import { ICON_MAP } from "@/lib/icon-map";

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsTypePage({ params }: PageProps) {
  const { type: typeSlug } = await params;
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!userId) notFound();

  const [itemTypes, collections, result] = await Promise.all([
    getSystemItemTypes(userId),
    getSidebarCollections(userId),
    getItemsByType(userId, typeSlug),
  ]);

  if (!result) notFound();

  const { type, items } = result;
  const Icon = ICON_MAP[type.icon] ?? Code;

  const sidebarUser = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? null,
  };

  return (
    <DashboardShell itemTypes={itemTypes} collections={collections} user={sidebarUser}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex items-center gap-3">
          <span
            className="flex size-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${type.color}1f`, color: type.color }}
          >
            <Icon className="size-5" />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{type.name}</h1>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span
              className="mb-4 flex size-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${type.color}1f`, color: type.color }}
            >
              <Icon className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              No {type.name.toLowerCase()} yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
