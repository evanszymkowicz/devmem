import { Code, Pin, Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ItemWithType } from "@/lib/db/items";
import { ICON_MAP } from "@/lib/icon-map";

interface ItemCardProps {
  item: ItemWithType;
}

export function ItemCard({ item }: ItemCardProps) {
  const Icon = ICON_MAP[item.itemType.icon] ?? Code;
  const accent = item.itemType.color;

  return (
    <Card
      size="sm"
      className="h-full border-l-4 transition-colors hover:bg-accent/40"
      style={{ borderLeftColor: accent }}
    >
      <CardHeader>
        <div className="flex items-start gap-2">
          <span
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <CardTitle className="truncate text-sm">{item.title}</CardTitle>
              {item.isPinned && (
                <Pin
                  className="size-3 shrink-0 text-muted-foreground"
                  aria-label="Pinned"
                />
              )}
              {item.isFavorite && (
                <Star
                  className="size-3 shrink-0 fill-amber-400 text-amber-400"
                  aria-label="Favorite"
                />
              )}
            </div>
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {formatDate(item.updatedAt)}
          </time>
        </div>
      </CardHeader>

      {(item.description || item.tags.length > 0) && (
        <CardContent className="flex flex-col gap-2">
          {item.description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
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
        </CardContent>
      )}
    </Card>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
