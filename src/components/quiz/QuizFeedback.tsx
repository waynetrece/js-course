"use client";

import { cn } from "@/lib/utils";

interface QuizFeedbackProps {
  correct: boolean;
  explanation: string;
  onNext: () => void;
  formatHint?: boolean;
}

export function QuizFeedback({ correct, explanation, onNext, formatHint }: QuizFeedbackProps) {
  return (
    <div
      className={cn(
        "mt-4 rounded-md border-2 p-4 transition-all duration-normal ease-material",
        correct
          ? "border-success/30 bg-success/5"
          : formatHint
            ? "border-amber-400/30 bg-amber-50/50 dark:bg-amber-950/20"
            : "border-destructive/30 bg-destructive/5"
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        {correct ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
            <span className="font-semibold text-success">答對了！</span>
          </>
        ) : formatHint ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span className="font-semibold text-amber-500">觀念正確，但答案不完整</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
            <span className="font-semibold text-destructive">答錯了</span>
          </>
        )}
      </div>

      {formatHint && (
        <p className="mb-2 text-sm font-medium text-amber-600 dark:text-amber-400">
          這題有多個 console.log，記得把每個輸出都寫上去，用空格或逗號分隔。
        </p>
      )}

      <p className="text-sm leading-relaxed">{explanation}</p>

      <button
        onClick={onNext}
        className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-fast ease-material hover:bg-primary/90"
      >
        下一題
      </button>
    </div>
  );
}
