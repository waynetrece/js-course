"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { executeCode, ExecutionResult } from "@/lib/code-executor";
import { cn } from "@/lib/utils";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse rounded-md bg-muted" />
  ),
});

import { javascript } from "@codemirror/lang-javascript";

const STORAGE_KEY = "js-review-playground-code";

const DEFAULT_CODE = `// 在這裡寫 JavaScript 程式碼
// 按「執行」按鈕或 Ctrl+Enter 來執行

console.log("Hello, JavaScript!");
`;

export function CodePlayground() {
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_CODE;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CODE;
  });
  const [output, setOutput] = useState<
    { text: string; type: "log" | "error" }[]
  >([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, code);
  }, [code]);

  const handleRun = useCallback(async () => {
    setRunning(true);
    setOutput([]);
    try {
      const result: ExecutionResult = await executeCode(code);
      const items: { text: string; type: "log" | "error" }[] = [];
      for (const log of result.logs) {
        items.push({ text: log, type: "log" });
      }
      if (result.error) {
        items.push({ text: result.error, type: "error" });
      }
      if (items.length === 0) {
        items.push({ text: "(沒有輸出)", type: "log" });
      }
      setOutput(items);
    } finally {
      setRunning(false);
    }
  }, [code]);

  const handleClear = () => {
    setCode(DEFAULT_CODE);
    setOutput([]);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    },
    [handleRun]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <h1 className="text-lg font-semibold">JS 練習場</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRun}
            disabled={running}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors duration-fast ease-material hover:bg-primary/90 disabled:opacity-50"
          >
            {running ? "執行中..." : "執行"}
          </button>
          <button
            onClick={handleClear}
            className="rounded-md bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-fast ease-material hover:bg-muted/80"
          >
            清除
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Editor */}
        <div className="flex-[3] border-b border-border md:border-b-0 md:border-r">
          <CodeMirror
            value={code}
            onChange={(val) => setCode(val)}
            extensions={[javascript()]}
            theme="dark"
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              autocompletion: false,
            }}
            className="h-full text-sm [&_.cm-editor]:!outline-none [&_.cm-editor]:h-full [&_.cm-scroller]:!min-h-[200px] md:[&_.cm-scroller]:!min-h-[400px]"
            height="100%"
          />
        </div>

        {/* Console */}
        <div className="flex flex-[2] flex-col bg-slate-950">
          <div className="border-b border-slate-800 px-4 py-2">
            <span className="text-xs font-medium text-slate-400">
              &gt; Console 輸出
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm">
            {output.length === 0 ? (
              <p className="text-slate-500">按「執行」按鈕或 Ctrl+Enter 查看結果</p>
            ) : (
              <div className="space-y-1">
                {output.map((item, i) => (
                  <div
                    key={i}
                    className={cn(
                      "whitespace-pre-wrap break-all",
                      item.type === "error"
                        ? "text-red-400"
                        : "text-emerald-300"
                    )}
                  >
                    {item.type === "error" ? "Error: " : ""}
                    {item.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
