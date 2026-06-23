import { notFound, redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";

import { auth } from "@/auth";
import {
  getCollectionWithItems,
  getSidebarCollections,
} from "@/lib/db/collections";
import { ITEMS_PER_PAGE } from "@/lib/db/limits";
import { getSystemItemTypes } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemCard } from "@/components/items/ItemCard";
import { FileListRow } from "@/components/items/FileListRow";
import { ItemDrawerWrapper } from "@/components/items/ItemDrawerWrapper";
import { CollectionDetailActions } from "@/components/collections/CollectionDetailActions";
import { Pagination } from "@/components/ui/pagination";
import { pageHref, parsePageParam } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const page = parsePageParam((await searchParams).page);
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [itemTypes, sidebarCollections, collection, editorPreferences] =
    await Promise.all([
      getSystemItemTypes(userId),
      getSidebarCollections(userId),
      getCollectionWithItems(userId, id, page),
      getEditorPreferences(userId),
    ]);

  if (!collection) notFound();

  const totalPages = Math.max(
    1,
    Math.ceil(collection.totalItemCount / ITEMS_PER_PAGE),
  );
  // Out-of-range page — redirect to the last real page rather than rendering
  // an empty collection state.
  if (page > totalPages) {
    redirect(pageHref(`/collections/${collection.id}`, totalPages));
  }

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
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">
              {collection.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {collection.totalItemCount}{" "}
              {collection.totalItemCount === 1 ? "item" : "items"}
            </p>
            {collection.description && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {collection.description}
              </p>
            )}
          </div>
          <CollectionDetailActions
            collectionId={collection.id}
            name={collection.name}
            description={collection.description}
            isFavorite={collection.isFavorite}
          />
        </header>

        {collection.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <FolderOpen className="size-6" />
            </span>
            <p className="text-sm text-muted-foreground">
              This collection is empty. Add items to it from the item editor.
            </p>
          </div>
        ) : (
          <ItemDrawerWrapper collections={sidebarCollections}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collection.items.map((item) =>
                item.itemType.slug === "files" ? (
                  <FileListRow key={item.id} item={item} />
                ) : (
                  <ItemCard key={item.id} item={item} />
                ),
              )}
            </div>
          </ItemDrawerWrapper>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/collections/${collection.id}`}
        />
      </div>
    </DashboardShell>
  );
}
