"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Crown, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MACOS_DOTS, EDITOR_MIN_HEIGHT, EDITOR_MAX_HEIGHT } from "@/lib/editor-constants";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  isPro?: boolean;
  onOptimize?: () => void;
  optimizing?: boolean;
  optimizedContent?: string | null;
  onUseOptimized?: (content: string) => void;
  onDismissOptimized?: () => void;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  className,
  isPro = false,
  onOptimize,
  optimizing = false,
  optimizedContent = null,
  onUseOptimized,
  onDismissOptimized,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [activePane, setActivePane] = useState<"original" | "optimized">("original");
  const [copied, setCopied] = useState(false);
  const [prevOptimizedContent, setPrevOptimizedContent] = useState<string | null>(null);

  // Switch to optimized pane as soon as content arrives (avoids setState-in-effect)
  if (optimizedContent !== prevOptimizedContent) {
    setPrevOptimizedContent(optimizedContent);
    if (optimizedContent) setActivePane("optimized");
    else if (!optimizing) setActivePane("original");
  }

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const showPreview = readOnly || tab === "preview";
  const showOptimizedTabs = readOnly && (optimizing || optimizedContent !== null);

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
          {showOptimizedTabs && (
            <div className="ml-3 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setActivePane("original")}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  activePane === "original"
                    ? "bg-[#1e1e1e] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setActivePane("optimized")}
                disabled={!optimizedContent && !optimizing}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  activePane === "optimized"
                    ? "bg-[#1e1e1e] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Optimized
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
          {onOptimize && (
            isPro ? (
              <button
                type="button"
                onClick={onOptimize}
                disabled={optimizing}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#858585] transition-colors hover:bg-[#1e1e1e] hover:text-[#cccccc] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {optimizing ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                {optimizing ? "Optimizing…" : "Optimize"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="AI features require Pro subscription"
                className="flex cursor-not-allowed items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#858585] opacity-50"
              >
                <Crown className="size-3" />
                Optimize
              </button>
            )
          )}
        </div>
      </div>

      {showOptimizedTabs && activePane === "optimized" ? (
        <div className="flex flex-col bg-[#1e1e1e]" style={{ maxHeight: EDITOR_MAX_HEIGHT }}>
          <div
            className="prose prose-invert prose-sm max-w-none prose-code:before:content-none prose-code:after:content-none overflow-y-auto px-4 py-3"
            style={{ minHeight: EDITOR_MIN_HEIGHT }}
          >
            {optimizing && !optimizedContent ? (
              <div className="flex items-center gap-2 text-[#858585]">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-xs">Optimizing prompt…</span>
              </div>
            ) : optimizedContent ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimizedContent}</ReactMarkdown>
            ) : null}
          </div>
          {optimizedContent && (
            <div className="flex shrink-0 items-center gap-2 border-t border-[#333] px-4 py-2.5">
              <Button
                size="sm"
                variant="default"
                className="h-7 gap-1.5 text-xs"
                onClick={() => onUseOptimized?.(optimizedContent)}
              >
                <Check className="size-3" />
                Use this
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-[#858585] hover:text-[#cccccc]"
                onClick={onDismissOptimized}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      ) : showPreview ? (
        <div
          className="prose prose-invert prose-sm max-w-none prose-code:before:content-none prose-code:after:content-none overflow-y-auto bg-[#1e1e1e] px-4 py-3"
          style={{ minHeight: EDITOR_MIN_HEIGHT, maxHeight: EDITOR_MAX_HEIGHT }}
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
          style={{ minHeight: EDITOR_MIN_HEIGHT, maxHeight: EDITOR_MAX_HEIGHT }}
        />
      )}
    </div>
  );
}
