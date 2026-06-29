import { notFound, redirect } from "next/navigation";
import { Code } from "lucide-react";

import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getItemsByType, getSystemItemTypes } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { ITEMS_PER_PAGE } from "@/lib/db/limits";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemCard } from "@/components/items/ItemCard";
import { FileListRow } from "@/components/items/FileListRow";
import { ItemDrawerWrapper } from "@/components/items/ItemDrawerWrapper";
import { NewItemButton } from "@/components/items/NewItemButton";
import { Pagination } from "@/components/ui/pagination";
import { ICON_MAP } from "@/lib/icon-map";
import { pageHref, parsePageParam } from "@/lib/utils";

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsTypePage({ params, searchParams }: PageProps) {
  const { type: typeSlug } = await params;
  const page = parsePageParam((await searchParams).page);
  const session = await auth();
  const userId = session?.user?.id ?? null;

  if (!userId) notFound();

  const [itemTypes, collections, result, editorPreferences] =
    await Promise.all([
      getSystemItemTypes(userId),
      getSidebarCollections(userId),
      getItemsByType(userId, typeSlug, page),
      getEditorPreferences(userId),
    ]);

  if (!result) notFound();

  const { type, items, totalCount } = result;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  // Out-of-range page (e.g. ?page=999) — send the user to the last real page
  // rather than rendering an empty "no items yet" state.
  if (page > totalPages) redirect(pageHref(`/items/${type.slug}`, totalPages));
  const Icon = ICON_MAP[type.icon] ?? Code;

  const sidebarUser = {
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
    image: session?.user?.image ?? null,
    isPro: session?.user?.isPro ?? false,
  };

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={collections}
      user={sidebarUser}
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex items-center gap-3">
          <span
            className="flex size-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${type.color}1f`, color: type.color }}
          >
            <Icon className="size-5" />
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">{type.name}</h1>
            <p className="text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? "item" : "items"}
            </p>
          </div>
          <NewItemButton
            typeSlug={type.slug}
            label={`New ${type.name.replace(/s$/, "")}`}
          />
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
          <ItemDrawerWrapper collections={collections}>
            {typeSlug === "files" ? (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <FileListRow key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </ItemDrawerWrapper>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath={`/items/${type.slug}`}
        />
      </div>
    </DashboardShell>
  );
}
