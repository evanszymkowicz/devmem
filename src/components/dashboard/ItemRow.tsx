"use client";

import { Code, Pin } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { type ItemWithType } from "@/lib/db/items";
import { ICON_MAP } from "@/lib/icon-map";
import { formatDateShort } from "@/lib/format-date";
import { useItemDrawer } from "@/components/items/ItemDrawerContext";
import { ItemFavoriteButton } from "@/components/items/ItemFavoriteButton";

interface ItemRowProps {
  item: ItemWithType;
}

export function ItemRow({ item }: ItemRowProps) {
  const { openDrawer } = useItemDrawer();
  const Icon = ICON_MAP[item.itemType.icon] ?? Code;
  const accent = item.itemType.color;

  return (
    <Card
      size="sm"
      className="group cursor-pointer border-l-4 transition-colors hover:bg-accent/40"
      style={{ borderLeftColor: accent }}
      onClick={() => openDrawer(item.id)}
    >
      <CardContent className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-medium">{item.title}</h3>
            {item.isPinned && (
              <Pin
                className="size-3 shrink-0 text-muted-foreground"
                aria-label="Pinned"
              />
            )}
          </div>
          {item.description && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {item.description}
            </p>
          )}
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <time className="text-xs text-muted-foreground">
            {formatDateShort(item.updatedAt)}
          </time>
          <ItemFavoriteButton itemId={item.id} initialFavorite={item.isFavorite} />
        </div>
      </CardContent>
    </Card>
  );
}
