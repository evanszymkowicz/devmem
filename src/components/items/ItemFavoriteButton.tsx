"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { useItemFavorite } from "./use-item-favorite";

interface ItemFavoriteButtonProps {
  itemId: string;
  initialFavorite: boolean;
}

// Star toggle shared by item cards and rows. Stops click propagation so it
// doesn't trigger the parent's open-drawer handler. Stays visible when
// favorited, hover-revealed otherwise.
export function ItemFavoriteButton({ itemId, initialFavorite }: ItemFavoriteButtonProps) {
  const { isFavorite, toggle, pending } = useItemFavorite(itemId, initialFavorite);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    toggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "rounded p-1.5 transition-opacity hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isFavorite
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100 focus:opacity-100",
      )}
    >
      <Star
        className={cn(
          "size-3.5",
          isFavorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
        )}
      />
    </button>
  );
}
