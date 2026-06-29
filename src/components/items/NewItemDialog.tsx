"use client";

import { Code, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICON_MAP } from "@/lib/icon-map";
import { CollectionPicker } from "@/components/collections/CollectionPicker";
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt";
import { LanguageSelect } from "./LanguageSelect";
import { TagSuggestions } from "./TagSuggestions";
import { useNewItemForm } from "./use-new-item-form";
import { FILE_TYPE_SLUGS, type CreatableTypeSlug } from "@/lib/validations/items";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  defaultTypeSlug?: string;
  isPro?: boolean;
}

export function NewItemDialog({ open, onOpenChange, itemTypes, collections, defaultTypeSlug, isPro }: NewItemDialogProps) {
  const {
    creatableTypes,
    typeSlug,
    form,
    collectionIds,
    uploadKey,
    submitting,
    canSubmit,
    accent,
    showContent,
    showLanguage,
    showUrl,
    showFile,
    showUpgradePrompt,
    setField,
    setCollectionIds,
    handleTypeChange,
    handleClose,
    handleUploadComplete,
    handleSubmit,
    tagSuggestions,
    suggestingTags,
    handleSuggestTags,
    handleAcceptTag,
    handleRejectTag,
  } = useNewItemForm({ open, onOpenChange, itemTypes, defaultTypeSlug, isPro });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        {/* Type selector */}
        <div className="flex flex-wrap gap-1.5">
          {creatableTypes.map((t) => {
            const TIcon = ICON_MAP[t.icon] ?? Code;
            const active = t.slug === typeSlug;
            const isProType = FILE_TYPE_SLUGS.has(t.slug as CreatableTypeSlug);
            return (
              <button
                key={t.slug}
                type="button"
                onClick={() => handleTypeChange(t.slug as CreatableTypeSlug)}
                className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                style={
                  active
                    ? { backgroundColor: `${t.color}1f`, borderColor: t.color, color: t.color }
                    : undefined
                }
              >
                <TIcon className="size-3.5" />
                {t.name}
                {isProType && !isPro && (
                  <Sparkles className="size-3 opacity-50" />
                )}
              </button>
            );
          })}
        </div>

        {/* Upgrade prompt for Pro-only types */}
        {showUpgradePrompt ? (
          <UpgradePrompt
            title="Pro Feature"
            description="File and image uploads are available on the Pro plan. Upgrade to store and access your files anywhere."
          />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Title <span style={{ color: accent }}>*</span>
              </label>
              <Input
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Item title"
                autoFocus
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Optional description"
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            {/* File upload */}
            {showFile && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {typeSlug === "images" ? "Image" : "File"}{" "}
                  <span style={{ color: accent }}>*</span>
                </label>
                <FileUpload
                  key={`${typeSlug}-${uploadKey}`}
                  typeSlug={typeSlug as "files" | "images"}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
            )}

            {/* Content */}
            {showContent && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Content
                  </label>
                  {showLanguage && (
                    <LanguageSelect
                      value={form.language}
                      onChange={(v) => setField("language", v)}
                    />
                  )}
                </div>
                {showLanguage ? (
                  <CodeEditor
                    value={form.content}
                    onChange={(v) => setField("content", v)}
                    language={form.language || undefined}
                  />
                ) : (
                  <MarkdownEditor
                    value={form.content}
                    onChange={(v) => setField("content", v)}
                  />
                )}
              </div>
            )}

            {/* URL */}
            {showUrl && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  URL <span style={{ color: accent }}>*</span>
                </label>
                <Input
                  value={form.url}
                  onChange={(e) => setField("url", e.target.value)}
                  placeholder="https://…"
                  type="url"
                  className="text-sm"
                  required
                />
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags
                </label>
                {isPro && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[11px]"
                    onClick={handleSuggestTags}
                    disabled={!form.title.trim() || suggestingTags}
                  >
                    <Sparkles className="size-3" />
                    {suggestingTags ? "Suggesting…" : "Suggest Tags"}
                  </Button>
                )}
              </div>
              <Input
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
                placeholder="react, typescript, hooks"
                className="text-sm"
              />
              <TagSuggestions
                suggestions={tagSuggestions}
                onAccept={handleAcceptTag}
                onReject={handleRejectTag}
              />
              <p className="text-[11px] text-muted-foreground">Comma-separated</p>
            </div>

            {/* Collections */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Collections
              </label>
              <CollectionPicker
                collections={collections}
                selectedIds={collectionIds}
                onChange={setCollectionIds}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!canSubmit}>
                {submitting ? "Creating…" : "Create Item"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
