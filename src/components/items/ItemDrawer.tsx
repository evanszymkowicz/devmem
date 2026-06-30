"use client";

import { useEffect, useReducer, useState } from "react";
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
import { updateItem, deleteItem, toggleItemPin, toggleItemFavorite } from "@/actions/items";
import { generateAutoTags, generateDescription } from "@/actions/ai";
import { useItemDrawer } from "./ItemDrawerContext";
import { ItemDrawerViewBody } from "./ItemDrawerViewBody";
import { ItemDrawerEditBody } from "./ItemDrawerEditBody";
import { type EditState, itemToEditState } from "./item-drawer-types";

const FILE_TYPE_SLUGS = new Set(["files", "images"]);

type DrawerCoreState = {
  item: ItemDetail | null;
  loading: boolean;
  isEditing: boolean;
  editState: EditState | null;
};

type DrawerCoreAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; item: ItemDetail }
  | { type: "FETCH_ERROR" }
  | { type: "PATCH_ITEM"; patch: Partial<ItemDetail> }
  | { type: "START_EDIT"; item: ItemDetail }
  | { type: "CANCEL_EDIT" }
  | { type: "SAVE_SUCCESS"; item: ItemDetail }
  | { type: "SET_FIELD"; key: keyof EditState; value: EditState[keyof EditState] };

function drawerReducer(state: DrawerCoreState, action: DrawerCoreAction): DrawerCoreState {
  switch (action.type) {
    case "FETCH_START":
      return { item: null, loading: true, isEditing: false, editState: null };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, item: action.item };
    case "FETCH_ERROR":
      return { item: null, loading: false, isEditing: false, editState: null };
    case "PATCH_ITEM":
      return { ...state, item: state.item ? { ...state.item, ...action.patch } : null };
    case "START_EDIT":
      return { ...state, isEditing: true, editState: itemToEditState(action.item) };
    case "CANCEL_EDIT":
      return { ...state, isEditing: false, editState: null };
    case "SAVE_SUCCESS":
      return { ...state, item: action.item, isEditing: false, editState: null };
    case "SET_FIELD":
      return {
        ...state,
        editState: state.editState ? { ...state.editState, [action.key]: action.value } : null,
      };
  }
}

interface ItemDrawerProps {
  collections: SidebarCollection[];
  isPro?: boolean;
}

export function ItemDrawer({ collections, isPro = false }: ItemDrawerProps) {
  const { activeItemId, closeDrawer } = useItemDrawer();
  const router = useRouter();

  const [{ item, loading, isEditing, editState }, dispatch] = useReducer(drawerReducer, {
    item: null,
    loading: false,
    isEditing: false,
    editState: null,
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  useEffect(() => {
    if (!activeItemId) return;
    dispatch({ type: "FETCH_START" });
    fetch(`/api/items/${activeItemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load item");
        return res.json() as Promise<ItemDetail>;
      })
      .then((fetched) => dispatch({ type: "FETCH_SUCCESS", item: fetched }))
      .catch(() => {
        dispatch({ type: "FETCH_ERROR" });
        toast.error("Failed to load item");
      });
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
    dispatch({ type: "PATCH_ITEM", patch: { isFavorite: next } });

    const result = await toggleItemFavorite(item.id);
    setFavoriting(false);

    if (!result.success) {
      dispatch({ type: "PATCH_ITEM", patch: { isFavorite: !next } });
      toast.error(result.error);
      return;
    }

    router.refresh();
  }

  function handleEdit() {
    if (!item) return;
    dispatch({ type: "START_EDIT", item });
  }

  function handleUseOptimized(optimizedContent: string) {
    if (!item) return;
    dispatch({ type: "START_EDIT", item });
    dispatch({ type: "SET_FIELD", key: "content", value: optimizedContent });
  }

  function handleCancel() {
    dispatch({ type: "CANCEL_EDIT" });
    setTagSuggestions([]);
  }

  function setField<K extends keyof EditState>(key: K, value: EditState[K]) {
    dispatch({ type: "SET_FIELD", key, value });
  }

  async function handleSuggestTags() {
    if (!item || !editState) return;
    setSuggestingTags(true);
    const result = await generateAutoTags({ title: editState.title, content: editState.content || null });
    setSuggestingTags(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    const existing = editState.tags.split(",").map((t) => t.trim()).filter(Boolean);
    setTagSuggestions(result.data.filter((t) => !existing.includes(t)));
  }

  function handleAcceptTag(tag: string) {
    if (!editState) return;
    const existing = editState.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (!existing.includes(tag)) {
      setField("tags", [...existing, tag].join(", "));
    }
    setTagSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function handleRejectTag(tag: string) {
    setTagSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  async function handleGenerateDescription() {
    if (!item || !editState) return;
    setGeneratingDescription(true);
    const result = await generateDescription({
      title: editState.title,
      typeSlug: item.itemType.slug,
      content: editState.content || null,
      url: editState.url || null,
      language: editState.language || null,
      fileName: item.fileName ?? null,
    });
    setGeneratingDescription(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setField("description", result.data);
  }

  async function handlePin() {
    if (!item) return;
    const previous = item.isPinned;

    dispatch({ type: "PATCH_ITEM", patch: { isPinned: !previous } });
    setPinning(true);

    const result = await toggleItemPin(item.id);

    setPinning(false);

    if (!result.success) {
      dispatch({ type: "PATCH_ITEM", patch: { isPinned: previous } });
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

    dispatch({ type: "SAVE_SUCCESS", item: result.data });
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
                isPro={isPro}
                tagSuggestions={tagSuggestions}
                suggestingTags={suggestingTags}
                onSuggestTags={handleSuggestTags}
                onAcceptTag={handleAcceptTag}
                onRejectTag={handleRejectTag}
                generatingDescription={generatingDescription}
                onGenerateDescription={handleGenerateDescription}
              />
            ) : item ? (
              <ItemDrawerViewBody item={item} isPro={isPro} onUseOptimized={handleUseOptimized} />
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
