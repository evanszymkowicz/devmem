"use client";

import { Check, ChevronsUpDown, FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SidebarCollection } from "@/lib/db/collections";

interface CollectionPickerProps {
  collections: SidebarCollection[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CollectionPicker({
  collections,
  selectedIds,
  onChange,
}: CollectionPickerProps) {
  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((s) => s !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  const selectedCount = selectedIds.length;
  const label =
    selectedCount === 0
      ? "No collections"
      : selectedCount === 1
        ? "1 collection"
        : `${selectedCount} collections`;

  if (collections.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground">
        No collections yet. Create one to organize items.
      </p>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 text-sm">
            <FolderPlus className="size-3.5 text-muted-foreground" />
            {label}
          </span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-56 p-1">
        <ul className="max-h-56 overflow-y-auto">
          {collections.map((col) => {
            const checked = selectedIds.includes(col.id);
            return (
              <li key={col.id}>
                <button
                  type="button"
                  onClick={() => toggle(col.id)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input",
                    )}
                  >
                    {checked && <Check className="size-3" />}
                  </span>
                  <span className="flex-1 truncate">{col.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
