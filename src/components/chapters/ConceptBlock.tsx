"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Concept } from "@/types/chapter";
import { getHighlight, saveHighlight, removeHighlight, Highlight } from "@/lib/highlights-store";

interface ConceptBlockProps {
  concept: Concept;
  index: number;
  chapterId: string;
  chapterTitle: string;
  defaultOpen?: boolean;
}

export function ConceptBlock({
  concept,
  index,
  chapterId,
  chapterTitle,
  defaultOpen = false,
}: ConceptBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [highlight, setHighlight] = useState<Highlight | undefined>();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHighlight(getHighlight(concept.id));
  }, [concept.id]);

  useEffect(() => {
    if (defaultOpen && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [defaultOpen]);

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (highlight) {
      removeHighlight(concept.id);
      setHighlight(undefined);
      setShowNoteInput(false);
      setNoteText("");
    } else {
      setShowNoteInput(true);
      if (!isOpen) setIsOpen(true);
    }
  };

  const handleSaveNote = () => {
    const saved = saveHighlight({
      conceptId: concept.id,
      chapterId,
      chapterTitle,
      conceptTitle: concept.title,
      note: noteText.trim(),
    });
    setHighlight(saved);
    setShowNoteInput(false);
  };

  const isHighlighted = !!highlight;

  return (
    <Card
      ref={ref}
      className={
        isHighlighted
          ? "border-amber-300 dark:border-amber-700"
          : undefined
      }
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
            {index + 1}
          </span>
          <span className="font-medium">{concept.title}</span>
          {concept.isNew && (
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              平台獨家
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            role="button"
            tabIndex={0}
            onClick={handleBookmarkClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleBookmarkClick(e as unknown as React.MouseEvent);
            }}
            className="shrink-0 rounded p-1 transition-colors hover:bg-muted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isHighlighted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isHighlighted ? "text-amber-500" : "text-muted-foreground"}
            >
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 text-muted-foreground transition-transform duration-normal ease-material ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <CardContent className="border-t pt-4">
          {showNoteInput && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
              <p className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                為什麼覺得這個觀念重要？
              </p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="寫下你的筆記..."
                className="mb-2 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm dark:border-amber-700 dark:bg-amber-950"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNote}
                  disabled={!noteText.trim()}
                  className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  儲存
                </button>
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    setNoteText("");
                  }}
                  className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {highlight && !showNoteInput && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                我的重點筆記
              </p>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                {highlight.note}
              </p>
            </div>
          )}

          <p className="text-sm leading-relaxed text-foreground/90">
            {concept.explanation}
          </p>

          {concept.codeExamples.map((ex, i) => (
            <div key={i} className="mt-4">
              <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-50">
                <code className="font-mono">{ex.code}</code>
              </pre>
              {ex.output && (
                <div className="mt-1 rounded-b-md bg-slate-800 px-4 py-2 text-xs text-emerald-400">
                  <span className="text-slate-400">{"// Output: "}</span>
                  {ex.output}
                </div>
              )}
            </div>
          ))}

          {concept.tips.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
              <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                重點提醒
              </p>
              <ul className="space-y-1">
                {concept.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-sm text-amber-800 dark:text-amber-200"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
