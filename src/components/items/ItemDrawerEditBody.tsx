"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { LanguageSelect } from "./LanguageSelect";
import { CollectionPicker } from "@/components/collections/CollectionPicker";
import {
  CONTENT_TYPE_SLUGS,
  LANGUAGE_TYPE_SLUGS,
  URL_TYPE_SLUGS,
} from "@/lib/validations/items";
import type { SidebarCollection } from "@/lib/db/collections";
import type { EditState } from "./item-drawer-types";

interface ItemDrawerEditBodyProps {
  editState: EditState;
  setField: <K extends keyof EditState>(key: K, value: EditState[K]) => void;
  typeSlug: string;
  collections: SidebarCollection[];
}

export function ItemDrawerEditBody({ editState, setField, typeSlug, collections }: ItemDrawerEditBodyProps) {
  const showContent = CONTENT_TYPE_SLUGS.has(typeSlug);
  const showLanguage = LANGUAGE_TYPE_SLUGS.has(typeSlug);
  const showUrl = URL_TYPE_SLUGS.has(typeSlug);

  return (
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
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Content
            </label>
            {showLanguage && (
              <LanguageSelect
                value={editState.language ?? ""}
                onChange={(v) => setField("language", v)}
              />
            )}
          </div>
          {showLanguage ? (
            <CodeEditor
              value={editState.content}
              onChange={(v) => setField("content", v)}
              language={editState.language || undefined}
            />
          ) : (
            <MarkdownEditor
              value={editState.content}
              onChange={(v) => setField("content", v)}
            />
          )}
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
        <p className="text-[11px] text-muted-foreground">Comma-separated</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Collections
        </label>
        <CollectionPicker
          collections={collections}
          selectedIds={editState.collectionIds}
          onChange={(ids) => setField("collectionIds", ids)}
        />
      </div>
    </div>
  );
}
