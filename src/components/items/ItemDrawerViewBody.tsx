"use client";

import { useState } from "react";
import { File as FileIcon } from "lucide-react";
import { toast } from "sonner";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { formatFileSize } from "@/lib/files";
import { formatDateLong } from "@/lib/format-date";
import { explainCode, optimizePrompt } from "@/actions/ai";
import type { ItemDetail } from "@/lib/db/items";

const LANGUAGE_TYPE_SLUGS = new Set(["snippets", "commands"]);

interface ItemDrawerViewBodyProps {
  item: ItemDetail;
  isPro?: boolean;
  onUseOptimized?: (content: string) => void;
}

export function ItemDrawerViewBody({ item, isPro = false, onUseOptimized }: ItemDrawerViewBodyProps) {
  const typeSlug = item.itemType.slug;
  const showLanguage = LANGUAGE_TYPE_SLUGS.has(typeSlug);
  const showFile = typeSlug === "files" || typeSlug === "images";
  const showExplain = showLanguage;
  const showOptimize = typeSlug === "prompts";

  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [optimizedContent, setOptimizedContent] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  async function handleExplain() {
    if (!item.content) return;
    setExplaining(true);
    const result = await explainCode({
      content: item.content,
      language: item.language ?? null,
      typeSlug,
    });
    setExplaining(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setExplanation(result.data);
  }

  async function handleOptimize() {
    if (!item.content) return;
    setOptimizing(true);
    const result = await optimizePrompt({ content: item.content });
    setOptimizing(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setOptimizedContent(result.data);
  }

  function handleDismissOptimized() {
    setOptimizedContent(null);
  }

  return (
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
          {showLanguage ? (
            <CodeEditor
              value={item.content}
              language={item.language ?? undefined}
              readOnly
              isPro={isPro}
              onExplain={showExplain ? handleExplain : undefined}
              explaining={explaining}
              explanation={explanation}
            />
          ) : (
            <MarkdownEditor
              value={item.content}
              readOnly
              isPro={isPro}
              onOptimize={showOptimize ? handleOptimize : undefined}
              optimizing={optimizing}
              optimizedContent={optimizedContent}
              onUseOptimized={onUseOptimized}
              onDismissOptimized={handleDismissOptimized}
            />
          )}
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

      {showFile && item.fileUrl && (
        <section className="px-6 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {typeSlug === "images" ? "Image" : "File"}
          </p>
          {typeSlug === "images" && (
            <div className="mb-3 flex justify-center">
              <img
                src={`/api/download/${item.id}`}
                alt={item.fileName ?? "Image"}
                className="max-h-52 max-w-full rounded-md object-contain"
              />
            </div>
          )}
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2.5">
            <FileIcon className="size-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {item.fileName ?? "Unknown file"}
              </p>
              {item.fileSize != null && (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(item.fileSize)}
                </p>
              )}
            </div>
          </div>
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
            <span>{formatDateLong(item.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Updated</span>
            <span>{formatDateLong(item.updatedAt)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
