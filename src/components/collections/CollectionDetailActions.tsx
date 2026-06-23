"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteCollection,
  toggleCollectionFavorite,
} from "@/actions/collections";
import { EditCollectionDialog } from "./EditCollectionDialog";

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
  const [deleting, setDeleting] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  async function handleFavorite() {
    setFavoriting(true);
    await toggleCollectionFavorite(collectionId);
    setFavoriting(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(collectionId);
    setDeleting(false);
    setConfirmDelete(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection deleted");
    router.push("/collections");
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

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the “{name}” collection. The items inside it are not
              deleted and remain in your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
