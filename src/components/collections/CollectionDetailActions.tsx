"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toggleCollectionFavorite } from "@/actions/collections";
import { EditCollectionDialog } from "./EditCollectionDialog";
import { DeleteCollectionDialog } from "./DeleteCollectionDialog";

interface CollectionDetailActionsProps {
  collectionId: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
}

export function CollectionDetailActions({
  collectionId,
  name,
  description,
  isFavorite,
}: CollectionDetailActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  async function handleFavorite() {
    setFavoriting(true);
    await toggleCollectionFavorite(collectionId);
    setFavoriting(false);
    router.refresh();
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={handleFavorite}
        disabled={favoriting}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className={isFavorite ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5"}
        />
        Favorite
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setEditOpen(true)}
      >
        <Pencil className="size-3.5" />
        Edit
      </Button>
      <Button
        variant="destructive"
        size="icon-sm"
        onClick={() => setConfirmDelete(true)}
        aria-label="Delete collection"
      >
        <Trash2 className="size-3.5" />
      </Button>

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
        onDeleted={() => router.push("/collections")}
      />
    </div>
  );
}
