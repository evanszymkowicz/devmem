"use client";

import { Download, File, FileCode, FileText } from "lucide-react";

import { type ItemWithType } from "@/lib/db/items";
import { formatFileSize } from "@/lib/files";
import { useItemDrawer } from "./ItemDrawerContext";

const EXT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  txt: FileText,
  md: FileText,
  json: FileCode,
  yaml: FileCode,
  yml: FileCode,
  toml: FileCode,
  xml: FileCode,
  ini: FileCode,
  csv: FileText,
};

function getExtIcon(fileName: string | null) {
  if (!fileName) return File;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_ICON_MAP[ext] ?? File;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface FileListRowProps {
  item: ItemWithType;
}

export function FileListRow({ item }: FileListRowProps) {
  const { openDrawer } = useItemDrawer();
  const ExtIcon = getExtIcon(item.fileName);
  const accent = item.itemType.color;

  return (
    <div
      className="group flex cursor-pointer items-center gap-4 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-accent/40"
      onClick={() => openDrawer(item.id)}>
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1f`, color: accent }}>
        <ExtIcon className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.fileName ?? item.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {item.fileSize != null && <span>{formatFileSize(item.fileSize)}</span>}
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>

      <a
        href={`/api/download/${item.id}`}
        download={item.fileName ?? undefined}
        className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
        title="Download"
        onClick={(e) => e.stopPropagation()}>
        <Download className="size-4" />
      </a>
    </div>
  );
}
