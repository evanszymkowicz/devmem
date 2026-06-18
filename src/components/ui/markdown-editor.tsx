"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";

const MACOS_DOTS = ["#ff5f57", "#febc2e", "#28c840"];
const MIN_HEIGHT = 80;
const MAX_HEIGHT = 400;

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(readOnly ? "preview" : "write");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTab(readOnly ? "preview" : "write");
  }, [readOnly]);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const showPreview = readOnly || tab === "preview";

  return (
    <div className={`overflow-hidden rounded-md border border-border${className ? ` ${className}` : ""}`}>
      <div className="flex items-center justify-between border-b border-[#333] bg-[#2d2d2d] px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          {MACOS_DOTS.map((color, i) => (
            <div key={i} className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
          ))}
          {!readOnly && (
            <div className="ml-3 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setTab("write")}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  tab === "write"
                    ? "bg-[#1e1e1e] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab("preview")}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  tab === "preview"
                    ? "bg-[#1e1e1e] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Preview
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-[#858585]">Markdown</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#858585] transition-colors hover:bg-[#1e1e1e] hover:text-[#cccccc]"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {showPreview ? (
        <div
          className="prose prose-invert prose-sm max-w-none prose-code:before:content-none prose-code:after:content-none overflow-y-auto bg-[#1e1e1e] px-4 py-3"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        >
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <span className="text-xs italic text-[#858585]">Nothing to preview</span>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write markdown…"
          className="w-full resize-y bg-[#1e1e1e] px-3 py-2.5 font-mono text-xs leading-relaxed text-[#d4d4d4] outline-none placeholder:text-[#5a5a5a]"
          style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        />
      )}
    </div>
  );
}
