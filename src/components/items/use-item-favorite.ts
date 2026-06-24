"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { toggleItemFavorite } from "@/actions/items";

// Optimistic favorite toggle shared by item cards and rows. Flips state
// immediately for snappy feedback, reverts on failure, and refreshes the
// route so server-rendered lists (sidebar, favorites) stay in sync.
export function useItemFavorite(itemId: string, initial: boolean) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initial);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isFavorite;
    setIsFavorite(next);
    startTransition(async () => {
      const result = await toggleItemFavorite(itemId);
      if (!result.success) {
        setIsFavorite(!next);
        toast.error(result.error);
        return;
      }
      setIsFavorite(result.data.isFavorite);
      router.refresh();
    });
  }

  return { isFavorite, toggle, pending };
}
