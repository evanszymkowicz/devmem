"use client";

import { useEffect, useState } from "react";
import { Code, Copy, Pencil, Pin, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ICON_MAP } from "@/lib/icon-map";
import type { ItemDetail } from "@/lib/db/items";
import { useItemDrawer } from "./ItemDrawerContext";

export function ItemDrawer() {
  const { activeItemId, closeDrawer } = useItemDrawer();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeItemId) return;
    setLoading(true);
    fetch(`/api/items/${activeItemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item");
        return res.json() as Promise<ItemDetail>;
      })
      .then(setItem)
      .catch(() => toast.error("Failed to load item"))
      .finally(() => setLoading(false));
  }, [activeItemId]);

  const Icon = item ? (ICON_MAP[item.itemType.icon] ?? Code) : Code;
  const accent = item?.itemType.color ?? "#6b7280";

  function handleCopy() {
    const text = item?.content ?? item?.url ?? "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
  }

  return (
    <Sheet open={!!activeItemId} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]"
      >
        {/* Header */}
        <SheetHeader className="border-b px-6 py-4">
          {loading || !item ? (
            <>
              <SheetTitle className="sr-only">Item detail</SheetTitle>
              <SheetDescription className="sr-only">Loading item details</SheetDescription>
              <div className="flex items-center gap-3">
                <div className="size-8 animate-pulse rounded-md bg-muted" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3 pr-8">
                <span
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${accent}1f`, color: accent }}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <SheetTitle className="leading-snug">{item.title}</SheetTitle>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span
                      className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${accent}1f`, color: accent }}
                    >
                      {item.itemType.name}
                    </span>
                    {item.language && (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {item.language}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <SheetDescription className="sr-only">
                Item detail for {item.title}
              </SheetDescription>
            </>
          )}
        </SheetHeader>

        {/* Action bar */}
        <div className="flex items-center gap-0.5 border-b px-3 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            disabled={!item}
            aria-label="Favorite"
          >
            <Star
              className={
                item?.isFavorite
                  ? "size-3.5 fill-amber-400 text-amber-400"
                  : "size-3.5"
              }
            />
            Favorite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            disabled={!item}
            aria-label="Pin"
          >
            <Pin
              className={
                item?.isPinned ? "size-3.5 fill-foreground" : "size-3.5"
              }
            />
            Pin
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            disabled={!item}
            onClick={handleCopy}
            aria-label="Copy"
          >
            <Copy className="size-3.5" />
            Copy
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            disabled={!item}
            aria-label="Edit"
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            className="ml-auto"
            disabled={!item}
            aria-label="Delete"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-4 px-6 py-5">
              <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-muted" />
              <div className="h-24 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                <div className="h-5 w-14 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ) : item ? (
            <div className="divide-y divide-border">
              {item.description && (
                <section className="px-6 py-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm">{item.description}</p>
                </section>
              )}

              {item.content && (
                <section className="px-6 py-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Content
                  </p>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                    <code>{item.content}</code>
                  </pre>
                </section>
              )}

              {item.url && (
                <section className="px-6 py-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    URL
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {item.url}
                  </a>
                </section>
              )}

              {item.tags.length > 0 && (
                <section className="px-6 py-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {item.collections.length > 0 && (
                <section className="px-6 py-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Collections
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.collections.map(({ collection }) => (
                      <span
                        key={collection.id}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {collection.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="px-6 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Details
                </p>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              </section>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
