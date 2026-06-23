import { FolderOpen } from "lucide-react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCollections, getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { CollectionCard } from "@/components/dashboard/CollectionCard";

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [itemTypes, sidebarCollections, collections] = await Promise.all([
    getSystemItemTypes(userId),
    getSidebarCollections(userId),
    getCollections(userId),
  ]);

  const sidebarUser = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
  };

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={sidebarCollections}
      user={sidebarUser}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground">
            {collections.length}{" "}
            {collections.length === 1 ? "collection" : "collections"}
          </p>
        </header>

        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <FolderOpen className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              No collections yet. Use “New Collection” to create one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((col) => (
              <CollectionCard key={col.id} collection={col} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
