"use client";

import Link from "next/link";
import {
  Code,
  File as FileIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  MoreHorizontal,
  Sparkles,
  Star,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Collection, mockItemTypes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File: FileIcon,
  Image: ImageIcon,
  Link: LinkIcon,
};

interface CollectionCardProps {
  collection: Collection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const dominantType = mockItemTypes.find(
    (t) => t.id === collection.itemTypeIds[0],
  );
  const accent = dominantType?.color ?? "#6b7280";

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group block focus:outline-none"
    >
      <Card
        size="sm"
        className={cn(
          "relative h-full gap-3 border-l-4 transition-colors",
          "hover:bg-accent/40",
        )}
        style={{ borderLeftColor: accent }}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="flex items-center gap-1.5 truncate">
              <span className="truncate">{collection.name}</span>
              {collection.isFavorite && (
                <Star
                  className="size-3.5 shrink-0 fill-amber-400 text-amber-400"
                  aria-label="Favorite"
                />
              )}
            </CardTitle>
            <button
              type="button"
              aria-label="Collection actions"
              onClick={(e) => e.preventDefault()}
              className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100 focus:opacity-100"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
          <CardDescription className="text-xs">
            {collection.itemCount} items
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {collection.description}
          </p>
          <div className="flex items-center gap-2">
            {collection.itemTypeIds.map((id) => {
              const type = mockItemTypes.find((t) => t.id === id);
              if (!type) return null;
              const Icon = ICON_MAP[type.icon] ?? Code;
              return (
                <Icon
                  key={id}
                  className="size-3.5"
                  style={{ color: type.color }}
                  aria-label={type.name}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
