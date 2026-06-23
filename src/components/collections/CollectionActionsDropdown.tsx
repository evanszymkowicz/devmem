"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toggleCollectionFavorite } from "@/actions/collections";
import { EditCollectionDialog } from "./EditCollectionDialog";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";

interface CollectionActionsDropdownProps {
  collectionId: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
}

export function CollectionActionsDropdown({
  collectionId,
  name,
  description,
  isFavorite,
}: CollectionActionsDropdownProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Collection actions"
            className="-mr-1 -mt-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => toggleCollectionFavorite(collectionId)}>
            <Star
              className={cn(isFavorite && "fill-amber-400 text-amber-400")}
            />
            {isFavorite ? "Unfavorite" : "Favorite"}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirmDelete(true)}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditCollectionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        collectionId={collectionId}
        initialName={name}
        initialDescription={description}
      />

      <DeleteCollectionDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        collectionId={collectionId}
        name={name}
        onDeleted={() => router.refresh()}
      />
    </>
  );
}
