"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Code, Copy, Pencil, Pin, Star, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { updateItem, deleteItem } from "@/actions/items";
import { useItemDrawer } from "./ItemDrawerContext";

const CONTENT_TYPE_SLUGS = new Set(["snippets", "prompts", "commands", "notes"]);
const LANGUAGE_TYPE_SLUGS = new Set(["snippets", "commands"]);
const URL_TYPE_SLUGS = new Set(["links"]);

interface EditState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

function itemToEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.map((t) => t.name).join(", "),
  };
}

export function ItemDrawer() {
  const { activeItemId, closeDrawer } = useItemDrawer();
  const router = useRouter();

  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const showContent = CONTENT_TYPE_SLUGS.has(typeSlug);
  const showLanguage = LANGUAGE_TYPE_SLUGS.has(typeSlug);
  const showUrl = URL_TYPE_SLUGS.has(typeSlug);

  function handleCopy() {
    const text = item?.content ?? item?.url ?? "";
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
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
              <SheetDescription className="sr-only">
                Editing {item.title}
              </SheetDescription>
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
              disabled={!item}
              aria-label="Favorite"
            >
              <Star
                className={
                  item?.isFavorite
                    ? "size-3.5 fill-amber-400 text-amber-400"
                    : "size-3.5"
                }
              />
              Favorite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              disabled={!item}
              aria-label="Pin"
            >
              <Pin
                className={
                  item?.isPinned ? "size-3.5 fill-foreground" : "size-3.5"
                }
              />
              Pin
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              disabled={!item}
              onClick={handleCopy}
              aria-label="Copy"
            >
              <Copy className="size-3.5" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              disabled={!item}
              onClick={handleEdit}
              aria-label="Edit"
            >
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
            <div className="flex flex-col gap-5 px-6 py-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <Textarea
                  value={editState.description}
                  onChange={(e) => setField("description", e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              {showContent && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Content
                  </label>
                  <Textarea
                    value={editState.content}
                    onChange={(e) => setField("content", e.target.value)}
                    placeholder="Content"
                    rows={8}
                    className="resize-y font-mono text-xs"
                  />
                </div>
              )}

              {showLanguage && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Language
                  </label>
                  <Input
                    value={editState.language}
                    onChange={(e) => setField("language", e.target.value)}
                    placeholder="e.g. typescript"
                    className="text-sm"
                  />
                </div>
              )}

              {showUrl && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    URL
                  </label>
                  <Input
                    value={editState.url}
                    onChange={(e) => setField("url", e.target.value)}
                    placeholder="https://…"
                    type="url"
                    className="text-sm"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags
                </label>
                <Input
                  value={editState.tags}
                  onChange={(e) => setField("tags", e.target.value)}
                  placeholder="react, typescript, hooks"
                  className="text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  Comma-separated
                </p>
              </div>
            </div>
          ) : item ? (
            <div className="divide-y divide-border">
              {item.description && (
                <section className="px-6 py-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm">{item.description}</p>
                </section>
              )}

              {item.content && (
                <section className="px-6 py-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Content
                  </p>
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                    <code>{item.content}</code>
                  </pre>
                </section>
              )}

              {item.url && (
                <section className="px-6 py-4">
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    URL
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {item.url}
                  </a>
                </section>
              )}

              {item.tags.length > 0 && (
                <section className="px-6 py-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {item.collections.length > 0 && (
                <section className="px-6 py-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Collections
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.collections.map(({ collection }) => (
                      <span
                        key={collection.id}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {collection.name}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="px-6 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Details
                </p>
                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{item.itemType.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{formatDate(item.updatedAt)}</span>
                  </div>
                </div>
              </section>
            </div>
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

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
