"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Code } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/ui/code-editor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ICON_MAP } from "@/lib/icon-map";
import { createItem } from "@/actions/items";
import type { SidebarItemType } from "@/lib/db/items";
import { CREATABLE_TYPE_SLUGS, type CreatableTypeSlug } from "@/lib/validations/items";

const CONTENT_SLUGS = new Set<CreatableTypeSlug>(["snippets", "prompts", "commands", "notes"]);
const LANGUAGE_SLUGS = new Set<CreatableTypeSlug>(["snippets", "commands"]);

interface NewItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: SidebarItemType[];
  defaultTypeSlug?: string;
}

interface FormState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  content: "",
  language: "",
  url: "",
  tags: "",
};

export function NewItemDialog({ open, onOpenChange, itemTypes, defaultTypeSlug }: NewItemDialogProps) {
  const router = useRouter();
  const creatableTypes = itemTypes.filter((t) =>
    (CREATABLE_TYPE_SLUGS as readonly string[]).includes(t.slug),
  );

  const [typeSlug, setTypeSlug] = useState<CreatableTypeSlug>(
    (creatableTypes[0]?.slug as CreatableTypeSlug) ?? "snippets",
  );
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      const slug = defaultTypeSlug ?? creatableTypes[0]?.slug ?? "snippets";
      setTypeSlug(slug as CreatableTypeSlug);
      setForm(EMPTY_FORM);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultTypeSlug]);
  const [submitting, setSubmitting] = useState(false);

  const selectedType = creatableTypes.find((t) => t.slug === typeSlug);
  const Icon = selectedType ? (ICON_MAP[selectedType.icon] ?? Code) : Code;
  const accent = selectedType?.color ?? "#6b7280";

  const showContent = CONTENT_SLUGS.has(typeSlug);
  const showLanguage = LANGUAGE_SLUGS.has(typeSlug);
  const showUrl = typeSlug === "links";

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(slug: CreatableTypeSlug) {
    setTypeSlug(slug);
    setForm(EMPTY_FORM);
  }

  function handleClose(next: boolean) {
    if (!next) {
      setForm(EMPTY_FORM);
      setTypeSlug((creatableTypes[0]?.slug as CreatableTypeSlug) ?? "snippets");
    }
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await createItem({
      typeSlug,
      title: form.title,
      description: form.description || null,
      content: form.content || null,
      language: form.language || null,
      url: form.url || null,
      tags,
    });

    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Item created");
    handleClose(false);
    router.refresh();
  }

  const canSubmit =
    form.title.trim().length > 0 &&
    (typeSlug !== "links" || form.url.trim().length > 0) &&
    !submitting;

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
              </button>
            );
          })}
        </div>

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

          {/* Content */}
          {showContent && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Content
              </label>
              {showLanguage ? (
                <CodeEditor
                  value={form.content}
                  onChange={(v) => setField("content", v)}
                  language={form.language || undefined}
                />
              ) : (
                <Textarea
                  value={form.content}
                  onChange={(e) => setField("content", e.target.value)}
                  placeholder="Content"
                  rows={6}
                  className="resize-y font-mono text-xs"
                />
              )}
            </div>
          )}

          {/* Language */}
          {showLanguage && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Language
              </label>
              <Input
                value={form.language}
                onChange={(e) => setField("language", e.target.value)}
                placeholder="e.g. typescript"
                className="text-sm"
              />
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
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </label>
            <Input
              value={form.tags}
              onChange={(e) => setField("tags", e.target.value)}
              placeholder="react, typescript, hooks"
              className="text-sm"
            />
            <p className="text-[11px] text-muted-foreground">Comma-separated</p>
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
      </DialogContent>
    </Dialog>
  );
}
