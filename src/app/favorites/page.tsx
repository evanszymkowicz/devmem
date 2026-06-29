import { redirect } from "next/navigation";
import { Star } from "lucide-react";

import { auth } from "@/auth";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSystemItemTypes } from "@/lib/db/items";
import { getEditorPreferences } from "@/lib/db/editor-preferences";
import { getFavorites } from "@/lib/db/favorites";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ItemDrawerWrapper } from "@/components/items/ItemDrawerWrapper";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const userId = session.user.id;

  const [itemTypes, sidebarCollections, favorites, editorPreferences] =
    await Promise.all([
      getSystemItemTypes(userId),
      getSidebarCollections(userId),
      getFavorites(userId),
      getEditorPreferences(userId),
    ]);

  const totalCount = favorites.items.length + favorites.collections.length;

  const sidebarUser = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image ?? null,
    isPro: session.user.isPro ?? false,
  };

  return (
    <DashboardShell
      itemTypes={itemTypes}
      collections={sidebarCollections}
      user={sidebarUser}
      editorPreferences={editorPreferences}
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-8">
        <header className="mb-6 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
            <Star className="size-5" />
          </span>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight">Favorites</h1>
            <p className="text-sm text-muted-foreground">
              {totalCount} favorited {totalCount === 1 ? "entry" : "entries"}
            </p>
          </div>
        </header>

        <ItemDrawerWrapper collections={sidebarCollections}>
          <FavoritesView
            items={favorites.items}
            collections={favorites.collections}
          />
        </ItemDrawerWrapper>
      </div>
    </DashboardShell>
  );
}
