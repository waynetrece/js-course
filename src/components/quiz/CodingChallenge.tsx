"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { CodingChallengeQuiz } from "@/types/quiz";
import { runTestCases, TestResult } from "@/lib/code-executor";
import { cn } from "@/lib/utils";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  ssr: false,
  loading: () => (
    <div className="h-48 animate-pulse rounded-md bg-muted" />
  ),
});

import { javascript } from "@codemirror/lang-javascript";

interface CodingChallengeProps {
  quiz: CodingChallengeQuiz;
  onAnswer: (answer: string, correct: boolean) => void;
}

export function CodingChallenge({ quiz, onAnswer }: CodingChallengeProps) {
  const [code, setCode] = useState(quiz.starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [answered, setAnswered] = useState(false);

  const handleRun = useCallback(async () => {
    setRunning(true);
    try {
      const testResults = await runTestCases(code, quiz.testCases);
      setResults(testResults);
      setAttempts((a) => a + 1);

      const allPassed = testResults.every((r) => r.passed);
      if (allPassed) {
        setAnswered(true);
        onAnswer(code, true);
      }
    } finally {
      setRunning(false);
    }
  }, [code, quiz.testCases, onAnswer]);

  const handleSkip = () => {
    setAnswered(true);
    onAnswer(code, false);
  };

  return (
    <div>
      <h3 className="mb-3 text-base font-semibold leading-relaxed">
        {quiz.question}
      </h3>

      <div className="mb-3 overflow-hidden rounded-md border border-border">
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
          editable={!answered}
          className="text-sm [&_.cm-editor]:!outline-none"
          minHeight="120px"
          maxHeight="300px"
        />
      </div>

      {!answered && (
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={running || !code.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-fast ease-material hover:bg-primary/90 disabled:opacity-50"
          >
            {running ? "執行中..." : "執行"}
          </button>
          {attempts >= 2 && (
            <button
              onClick={handleSkip}
              className="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-fast ease-material hover:bg-muted/80"
            >
              跳過
            </button>
          )}
        </div>
      )}

      {quiz.hints && quiz.hints.length > 0 && !answered && (
        <div className="mb-4">
          {!showHints ? (
            <button
              onClick={() => setShowHints(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              需要提示？
            </button>
          ) : (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                提示
              </p>
              <ul className="space-y-1 text-sm">
                {quiz.hints.map((hint, i) => (
                  <li key={i} className="text-muted-foreground">
                    {i + 1}. {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {results && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            測試結果（{results.filter((r) => r.passed).length} / {results.length} 通過）
          </p>
          {results.map((r, i) => (
            <div
              key={i}
              className={cn(
                "rounded-md border p-3 text-sm",
                r.passed
                  ? "border-success/30 bg-success/5"
                  : "border-destructive/30 bg-destructive/5"
              )}
            >
              <div className="flex items-center gap-2">
                {r.passed ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
                )}
                <span className="font-medium">{r.description}</span>
              </div>
              {!r.passed && (
                <div className="mt-2 space-y-0.5 text-xs font-mono">
                  <p>
                    <span className="text-muted-foreground">預期：</span>
                    <span className="text-success">{r.expected}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">實際：</span>
                    <span className="text-destructive">{r.actual}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
