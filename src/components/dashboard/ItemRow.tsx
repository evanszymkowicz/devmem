import {
  Code,
  File as FileIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  Pin,
  Sparkles,
  Star,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { type Item, mockItemTypes } from "@/lib/mock-data";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File: FileIcon,
  Image: ImageIcon,
  Link: LinkIcon,
};

interface ItemRowProps {
  item: Item;
}

export function ItemRow({ item }: ItemRowProps) {
  const type = mockItemTypes.find((t) => t.id === item.itemTypeId);
  const Icon = type ? (ICON_MAP[type.icon] ?? Code) : Code;
  const accent = type?.color ?? "#6b7280";

  return (
    <Card
      size="sm"
      className="border-l-4 transition-colors hover:bg-accent/40"
      style={{ borderLeftColor: accent }}
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
            {item.isFavorite && (
              <Star
                className="size-3 shrink-0 fill-amber-400 text-amber-400"
                aria-label="Favorite"
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
                  key={tag}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <time className="shrink-0 text-xs text-muted-foreground">
          {formatDate(item.updatedAt)}
        </time>
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
