"use client";

import { useState } from "react";
import { toast } from "sonner";

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
import { deleteCollection } from "@/actions/collections";

interface DeleteCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  name: string;
  /** Called after a successful delete — e.g. refresh the list or navigate away. */
  onDeleted: () => void;
}

export function DeleteCollectionDialog({
  open,
  onOpenChange,
  collectionId,
  name,
  onDeleted,
}: DeleteCollectionDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteCollection(collectionId);
    setDeleting(false);
    onOpenChange(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Collection deleted");
    onDeleted();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
  );
}
