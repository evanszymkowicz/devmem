"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Crown, Loader2, Sparkles } from "lucide-react";
import { MACOS_DOTS, EDITOR_MIN_HEIGHT, EDITOR_MAX_HEIGHT } from "@/lib/editor-constants";
import { useEditorPreferences } from "@/components/editor/EditorPreferencesProvider";
import { registerMonacoThemes } from "@/lib/monaco-themes";

interface MinimalEditor {
  getContentHeight(): number;
  onDidContentSizeChange(listener: () => void): { dispose(): void };
  getModel(): { updateOptions(options: { tabSize: number }): void } | null;
}

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  className?: string;
  isPro?: boolean;
  onExplain?: () => void;
  explaining?: boolean;
  explanation?: string | null;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  className,
  isPro = false,
  onExplain,
  explaining = false,
  explanation = null,
}: CodeEditorProps) {
  const { preferences } = useEditorPreferences();
  const editorRef = useRef<MinimalEditor | null>(null);
  const [height, setHeight] = useState(EDITOR_MIN_HEIGHT);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "explain">("code");
  const [prevExplanation, setPrevExplanation] = useState<string | null>(null);

  // Sync tab with explanation prop during render (avoids setState-in-effect)
  if (explanation !== prevExplanation) {
    setPrevExplanation(explanation);
    if (explanation) setActiveTab("explain");
    else if (!explaining) setActiveTab("code");
  }

  function handleMount(ed: MinimalEditor) {
    editorRef.current = ed;
    syncHeight(ed);
    ed.onDidContentSizeChange(() => syncHeight(ed));
    ed.getModel()?.updateOptions({ tabSize: preferences.tabSize });
  }

  // tabSize is a model option, not an editor option, so it must be applied
  // through the model rather than the `options` prop.
  useEffect(() => {
    editorRef.current?.getModel()?.updateOptions({ tabSize: preferences.tabSize });
  }, [preferences.tabSize]);

  function handleBeforeMount(monaco: Monaco) {
    registerMonacoThemes(monaco);
  }

  function syncHeight(ed: MinimalEditor) {
    const next = Math.min(EDITOR_MAX_HEIGHT, Math.max(EDITOR_MIN_HEIGHT, ed.getContentHeight()));
    setHeight(next);
  }

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const monacoLanguage = language?.toLowerCase() || "plaintext";
  const showTabs = explaining || explanation !== null;

  return (
    <div className={`overflow-hidden rounded-md border border-border${className ? ` ${className}` : ""}`}>
      <div className="flex items-center justify-between border-b border-[#333] bg-[#1e1e1e] px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          {MACOS_DOTS.map((color, i) => (
            <div key={i} className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
          ))}
          {showTabs && (
            <div className="ml-3 flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  activeTab === "code"
                    ? "bg-[#2d2d2d] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("explain")}
                disabled={!explanation && !explaining}
                className={`rounded px-2 py-0.5 text-[11px] transition-colors ${
                  activeTab === "explain"
                    ? "bg-[#2d2d2d] text-[#cccccc]"
                    : "text-[#858585] hover:text-[#cccccc]"
                }`}
              >
                Explain
              </button>
            </div>
          )}
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
          {onExplain && (
            isPro ? (
              <button
                type="button"
                onClick={onExplain}
                disabled={explaining}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#858585] transition-colors hover:bg-[#2d2d2d] hover:text-[#cccccc] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {explaining ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                {explaining ? "Explaining…" : "Explain"}
              </button>
            ) : (
              <button
                type="button"
                disabled
                title="AI features require Pro subscription"
                className="flex cursor-not-allowed items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-[#858585] opacity-50"
              >
                <Crown className="size-3" />
                Explain
              </button>
            )
          )}
        </div>
      </div>

      {activeTab === "explain" ? (
        <div
          className="prose prose-invert prose-sm max-w-none prose-code:before:content-none prose-code:after:content-none overflow-y-auto bg-[#1e1e1e] px-4 py-3"
          style={{ minHeight: EDITOR_MIN_HEIGHT, maxHeight: EDITOR_MAX_HEIGHT }}
        >
          {explaining && !explanation ? (
            <div className="flex items-center gap-2 text-[#858585]">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-xs">Generating explanation…</span>
            </div>
          ) : explanation ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
          ) : null}
        </div>
      ) : (
        <div style={{ height }}>
          <Editor
            value={value}
            onChange={(val) => onChange?.(val ?? "")}
            language={monacoLanguage}
            theme={preferences.theme}
            beforeMount={handleBeforeMount}
            onMount={handleMount}
            loading={
              <div
                className="flex items-center justify-center bg-[#1e1e1e] text-[11px] text-[#858585]"
                style={{ height: EDITOR_MIN_HEIGHT }}
              >
                Loading…
              </div>
            }
            options={{
              readOnly,
              minimap: { enabled: preferences.minimap },
              fontSize: preferences.fontSize,
              wordWrap: preferences.wordWrap ? "on" : "off",
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
      )}
    </div>
  );
}
