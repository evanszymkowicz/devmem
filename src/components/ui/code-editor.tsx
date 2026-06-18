"use client";

import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check } from "lucide-react";

const MACOS_DOTS = ["#ff5f57", "#febc2e", "#28c840"];
const MIN_HEIGHT = 80;
const MAX_HEIGHT = 400;

interface MinimalEditor {
  getContentHeight(): number;
  onDidContentSizeChange(listener: () => void): { dispose(): void };
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const editorRef = useRef<MinimalEditor | null>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [copied, setCopied] = useState(false);

  function handleMount(ed: MinimalEditor) {
    editorRef.current = ed;
    syncHeight(ed);
    ed.onDidContentSizeChange(() => syncHeight(ed));
  }

  function syncHeight(ed: MinimalEditor) {
    const next = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, ed.getContentHeight()));
    setHeight(next);
  }

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const monacoLanguage = language?.toLowerCase() || "plaintext";

  return (
    <div className={`overflow-hidden rounded-md border border-border${className ? ` ${className}` : ""}`}>
      <div className="flex items-center justify-between border-b border-[#333] bg-[#1e1e1e] px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          {MACOS_DOTS.map((color, i) => (
            <div key={i} className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {language && (
            <span className="font-mono text-[11px] text-[#858585]">{language}</span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#858585] transition-colors hover:bg-[#2d2d2d] hover:text-[#cccccc]"
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <div style={{ height }}>
        <Editor
          value={value}
          onChange={(val) => onChange?.(val ?? "")}
          language={monacoLanguage}
          theme="vs-dark"
          onMount={handleMount}
          loading={
            <div
              className="flex items-center justify-center bg-[#1e1e1e] text-[11px] text-[#858585]"
              style={{ height: MIN_HEIGHT }}
            >
              Loading…
            </div>
          }
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 12,
            lineHeight: 18,
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            lineNumbers: "off",
            folding: false,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: "auto",
              horizontal: "hidden",
              verticalScrollbarSize: 5,
              useShadows: false,
            },
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
    </div>
  );
}
