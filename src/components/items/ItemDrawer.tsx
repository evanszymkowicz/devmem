"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Code, Copy, Download, Pencil, Pin, Star, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { ICON_MAP } from "@/lib/icon-map";
import type { ItemDetail } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";
import { updateItem, deleteItem, toggleItemPin } from "@/actions/items";
import { useItemDrawer } from "./ItemDrawerContext";
import { ItemDrawerViewBody } from "./ItemDrawerViewBody";
import { ItemDrawerEditBody } from "./ItemDrawerEditBody";
import { type EditState, itemToEditState } from "./item-drawer-types";

const FILE_TYPE_SLUGS = new Set(["files", "images"]);

interface ItemDrawerProps {
  collections: SidebarCollection[];
}

export function ItemDrawer({ collections }: ItemDrawerProps) {
  const { activeItemId, closeDrawer } = useItemDrawer();
  const router = useRouter();

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);

  useEffect(() => {
    if (!activeItemId) {
      setItem(null);
      setIsEditing(false);
      setEditState(null);
      return;
    }
    setLoading(true);
    setIsEditing(false);
    fetch(`/api/items/${activeItemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item");
        return res.json() as Promise<ItemDetail>;
      })
      .then(setItem)
      .catch(() => toast.error("Failed to load item"))
      .finally(() => setLoading(false));
  }, [activeItemId]);

  const Icon = item ? (ICON_MAP[item.itemType.icon] ?? Code) : Code;
  const accent = item?.itemType.color ?? "#6b7280";
  const typeSlug = item?.itemType.slug ?? "";
  const showFile = FILE_TYPE_SLUGS.has(typeSlug);

  function handleCopy() {
    const text = item?.content ?? item?.url ?? "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
  }

  async function handleToggleFavorite() {
    if (!item) return;
    const next = !item.isFavorite;
    setFavoriting(true);
    setItem((cur) => (cur ? { ...cur, isFavorite: next } : cur));

    const result = await toggleItemFavorite(item.id);
    setFavoriting(false);

    if (!result.success) {
      setItem((cur) => (cur ? { ...cur, isFavorite: !next } : cur));
      toast.error(result.error);
      return;
    }

    router.refresh();
  }

  function handleEdit() {
    if (!item) return;
    setEditState(itemToEditState(item));
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setEditState(null);
  }

  function setField<K extends keyof EditState>(key: K, value: EditState[K]) {
    setEditState((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handlePin() {
    if (!item) return;
    const previous = item.isPinned;

    // Optimistically flip the pin state for instant feedback.
    setItem((prev) => (prev ? { ...prev, isPinned: !previous } : prev));
    setPinning(true);

    const result = await toggleItemPin(item.id);

    setPinning(false);

    if (!result.success) {
      // Revert on failure.
      setItem((prev) => (prev ? { ...prev, isPinned: previous } : prev));
      toast.error(result.error);
      return;
    }

    toast.success(result.data.isPinned ? "Item pinned" : "Item unpinned");
    router.refresh();
  }

  async function handleDelete() {
    if (!item) return;
    setDeleting(true);

    const result = await deleteItem(item.id);

    setDeleting(false);
    setConfirmDelete(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Item deleted");
    closeDrawer();
    router.refresh();
  }

  async function handleSave() {
    if (!item || !editState) return;
    setSaving(true);

    const tags = editState.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await updateItem(item.id, {
      title: editState.title,
      description: editState.description || null,
      content: editState.content || null,
      language: editState.language || null,
      url: editState.url || null,
      tags,
      collectionIds: editState.collectionIds,
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setItem(result.data);
    setIsEditing(false);
    setEditState(null);
    toast.success("Changes saved");
    router.refresh();
  }

  return (
    <>
      <Sheet open={!!activeItemId} onOpenChange={(open) => !open && closeDrawer()}>
        <SheetContent
          side="right"
          showCloseButton
          className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]"
        >
          {/* Header */}
          <SheetHeader className="border-b px-6 py-4">
            {loading || !item ? (
              <>
                <SheetTitle className="sr-only">Item detail</SheetTitle>
                <SheetDescription className="sr-only">Loading item details</SheetDescription>
                <div className="flex items-center gap-3">
                  <div className="size-8 animate-pulse rounded-md bg-muted" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    <div className="flex gap-1.5">
                      <div className="h-5 w-16 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </>
            ) : isEditing ? (
              <>
                <div className="flex items-start gap-3 pr-8">
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${accent}1f`, color: accent }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="sr-only">Edit {item.title}</SheetTitle>
                    <Input
                      value={editState?.title ?? ""}
                      onChange={(e) => setField("title", e.target.value)}
                      placeholder="Title"
                      className="h-7 px-2 py-0 text-base font-semibold leading-snug"
                      autoFocus
                    />
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span
                        className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: `${accent}1f`, color: accent }}
                      >
                        {item.itemType.name}
                      </span>
                    </div>
                  </div>
                </div>
                <SheetDescription className="sr-only">Editing {item.title}</SheetDescription>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 pr-8">
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${accent}1f`, color: accent }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <SheetTitle className="leading-snug">{item.title}</SheetTitle>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span
                        className="rounded px-1.5 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: `${accent}1f`, color: accent }}
                      >
                        {item.itemType.name}
                      </span>
                      {item.language && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                          {item.language}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <SheetDescription className="sr-only">
                  Item detail for {item.title}
                </SheetDescription>
              </>
            )}
          </SheetHeader>

          {/* Action bar */}
          {isEditing ? (
            <div className="flex items-center gap-2 border-b px-4 py-2">
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={handleSave}
                disabled={saving || !editState?.title.trim()}
              >
                <Check className="size-3.5" />
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="size-3.5" />
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5 border-b px-3 py-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                disabled={!item || favoriting}
                onClick={handleToggleFavorite}
                aria-label={item?.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={item?.isFavorite ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5"} />
                Favorite
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                disabled={!item || pinning}
                onClick={handlePin}
                aria-label={item?.isPinned ? "Unpin" : "Pin"}
              >
                <Pin className={item?.isPinned ? "size-3.5 fill-foreground" : "size-3.5"} />
                Pin
              </Button>
              {showFile ? (
                <Button variant="ghost" size="sm" className="gap-1.5" disabled={!item} asChild>
                  <a href={item ? `/api/download/${item.id}` : undefined} download={item?.fileName ?? undefined}>
                    <Download className="size-3.5" />
                    Download
                  </a>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="gap-1.5" disabled={!item} onClick={handleCopy} aria-label="Copy">
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              )}
              <Button variant="ghost" size="sm" className="gap-1.5" disabled={!item} onClick={handleEdit} aria-label="Edit">
                <Pencil className="size-3.5" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="icon-sm"
                className="ml-auto"
                disabled={!item}
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col gap-4 px-6 py-5">
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-muted" />
                <div className="h-24 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-1/4 animate-pulse rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                </div>
              </div>
            ) : item && isEditing && editState ? (
              <ItemDrawerEditBody
                editState={editState}
                setField={setField}
                typeSlug={typeSlug}
                collections={collections}
              />
            ) : item ? (
              <ItemDrawerViewBody item={item} />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The item will be permanently deleted.
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
    </>
  );
}
