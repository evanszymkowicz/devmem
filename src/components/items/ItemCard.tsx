"use client";

import { Check, Code, Copy, Pin, Star } from "lucide-react";
import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ItemWithType } from "@/lib/db/items";
import { ICON_MAP } from "@/lib/icon-map";
import { useItemDrawer } from "./ItemDrawerContext";

interface ItemCardProps {
  item: ItemWithType;
}

export function ItemCard({ item }: ItemCardProps) {
  const { openDrawer } = useItemDrawer();
  const [copied, setCopied] = useState(false);
  const Icon = ICON_MAP[item.itemType.icon] ?? Code;
  const accent = item.itemType.color;

  const copyValue = item.url ?? item.content ?? null;

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (!copyValue) return;
    navigator.clipboard.writeText(copyValue).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Card
      size="sm"
      className="group h-full cursor-pointer border-l-4 transition-colors hover:bg-accent/40"
      style={{ borderLeftColor: accent }}
      onClick={() => openDrawer(item.id)}
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
          <div className="flex shrink-0 items-center gap-1.5">
            <time className="text-xs text-muted-foreground">
              {formatDate(item.updatedAt)}
            </time>
            {copyValue && (
              <button
                onClick={handleCopy}
                className="rounded p-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
                aria-label="Copy"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
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
