"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Code, Folder } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ICON_MAP } from "@/lib/icon-map";
import { getSearchData } from "@/actions/search";
import type { SearchData } from "@/lib/db/search";
import type { SidebarCollection } from "@/lib/db/collections";
import { ItemDrawerWrapper } from "@/components/items/ItemDrawerWrapper";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";

interface SearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: SidebarCollection[];
  isPro?: boolean;
}

// Wraps the palette in an ItemDrawerWrapper so selecting an item opens the
// existing drawer. This is a separate context instance from the page-level
// drawers, so the palette works on every page without conflicting with them.
export function SearchCommand({ open, onOpenChange, collections, isPro = false }: SearchCommandProps) {
  return (
    <ItemDrawerWrapper collections={collections} isPro={isPro}>
      <SearchCommandInner open={open} onOpenChange={onOpenChange} />
    </ItemDrawerWrapper>
  );
}

// cmdk's default filter does loose subsequence scoring, so "test" matches any
// row where t-e-s-t appear in order anywhere in the searchable text — far too
// generous. This requires every whitespace-separated term to appear as a literal
// substring of the row's keywords. The item value is just the id (for stable
// dedup), so it is deliberately ignored here.
function searchFilter(_value: string, search: string, keywords?: string[]): number {
  const haystack = (keywords?.join(" ") ?? "").toLowerCase();
  const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 1;
  return terms.every((term) => haystack.includes(term)) ? 1 : 0;
}

function SearchCommandInner({
  open,
  onOpenChange,
}: Omit<SearchCommandProps, "collections">) {
  const router = useRouter();
  const { openDrawer } = useItemDrawer();
  const [data, setData] = useState<SearchData | null>(null);

  // Pre-fetch once on mount so the palette is warm before the first open.
  useEffect(() => {
    let active = true;
    getSearchData().then((result) => {
      if (active && result.success) setData(result.data);
    });
    return () => {
      active = false;
    };
  }, []);

  // Refetch each time the palette opens so newly created/edited items stay in
  // sync — the shell stays mounted across client navigations, so without this
  // the prefetched set would go stale.
  useEffect(() => {
    if (!open) return;
    let active = true;
    getSearchData().then((result) => {
      if (active && result.success) setData(result.data);
    });
    return () => {
      active = false;
    };
  }, [open]);

  // Global ⌘K / Ctrl+K toggle.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function handleSelectItem(itemId: string) {
    onOpenChange(false);
    openDrawer(itemId);
  }

  function handleSelectCollection(collectionId: string) {
    onOpenChange(false);
    router.push(`/collections/${collectionId}`);
  }

  const items = data?.items ?? [];
  const collections = data?.collections ?? [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} filter={searchFilter}>
      <CommandInput placeholder="Search items and collections..." />
      <CommandList>
        {data === null ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {items.length > 0 && (
          <CommandGroup heading="Items">
            {items.map((item) => {
              const Icon = ICON_MAP[item.typeIcon] ?? Code;
              return (
                <CommandItem
                  key={item.id}
                  // value stays a stable unique id; searchable text (title +
                  // preview) goes in keywords, matched by searchFilter.
                  value={item.id}
                  keywords={[item.title, item.preview]}
                  onSelect={() => handleSelectItem(item.id)}
                >
                  <span
                    className="flex size-6 shrink-0 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: `${item.typeColor}1f`,
                      color: item.typeColor,
                    }}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.title}</p>
                    {item.preview && (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.preview}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.typeName}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {collections.length > 0 && (
          <CommandGroup heading="Collections">
            {collections.map((collection) => (
              <CommandItem
                key={collection.id}
                value={collection.id}
                keywords={[collection.name]}
                onSelect={() => handleSelectCollection(collection.id)}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Folder className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {collection.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {collection.itemCount}{" "}
                  {collection.itemCount === 1 ? "item" : "items"}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
