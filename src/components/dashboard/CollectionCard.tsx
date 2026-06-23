"use client";

import Link from "next/link";
import {
  Code,
  Star,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CollectionWithTypes } from "@/lib/db/collections";
import { toggleCollectionFavorite } from "@/actions/collections";
import { CollectionActionsDropdown } from "@/components/collections/CollectionActionsDropdown";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/lib/icon-map";

interface CollectionCardProps {
  collection: CollectionWithTypes;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const accent = collection.itemTypes[0]?.color ?? "#6b7280";

  return (
    <div className="group relative focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-lg">
      {/* Full-area navigation link — sits below the action buttons */}
      <Link
        href={`/collections/${collection.id}`}
        className="absolute inset-0 z-0 rounded-lg"
        aria-label={`Open ${collection.name}`}
        tabIndex={0}
      />

      <Card
        size="sm"
        className={cn(
          "relative h-full gap-3 border-l-4 transition-colors pointer-events-none",
          "group-hover:bg-accent/40",
        )}
        style={{ borderLeftColor: accent }}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="truncate">
              <span className="truncate">{collection.name}</span>
            </CardTitle>
            <div className="relative z-10 flex shrink-0 items-center gap-0.5 pointer-events-auto">
              <button
                type="button"
                aria-label={collection.isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleCollectionFavorite(collection.id)}
                className={cn(
                  "-mt-1 rounded-md p-1 transition-opacity hover:bg-accent",
                  collection.isFavorite
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 focus:opacity-100",
                )}
              >
                <Star
                  className={cn(
                    "size-3.5",
                    collection.isFavorite
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground",
                  )}
                />
              </button>
              <CollectionActionsDropdown
                collectionId={collection.id}
                name={collection.name}
                description={collection.description}
                isFavorite={collection.isFavorite}
              />
            </div>
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
            {collection.itemTypes.map((type) => {
              const Icon = ICON_MAP[type.icon] ?? Code;
              return (
                <Icon
                  key={type.id}
                  className="size-3.5"
                  style={{ color: type.color }}
                  aria-label={type.name}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
