"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodePredictionQuiz } from "@/types/quiz";

interface Props {
  quiz: CodePredictionQuiz;
  onAnswer: (answer: string, correct: boolean) => void;
}

/** 標準化答案：去除前後空白，統一分隔符號 */
const normalize = (s: string) =>
  s.trim().split(/[\s,、]+/).filter(Boolean).join("\n");

/** 計算程式碼中 console.log 的數量 */
const countConsoleLogs = (code: string) =>
  (code.match(/console\.log\(/g) || []).length;

/** 判斷使用者的每個值是否都正確（但數量不足或格式不對） */
function isPartiallyCorrect(userInput: string, correctAnswer: string): boolean {
  const userParts = normalize(userInput).split("\n");
  const correctParts = normalize(correctAnswer).split("\n");
  if (userParts.length >= correctParts.length) return false;
  return userParts.every((part, i) => part === correctParts[i]);
}

export function CodePrediction({ quiz, onAnswer }: Props) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const logCount = countConsoleLogs(quiz.code);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const correct = normalize(input) === normalize(quiz.correctAnswer);
    setSubmitted(true);

    if (!correct && isPartiallyCorrect(input, quiz.correctAnswer)) {
      // 觀念對但答案不完整 — 仍算錯，但傳遞特殊 explanation
      onAnswer(
        `__FORMAT_HINT__|${input.trim()}`,
        false
      );
    } else {
      onAnswer(input.trim(), correct);
    }
  };

  return (
    <div className="space-y-4">
      <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-50">
        <code className="font-mono">{quiz.code}</code>
      </pre>

      <p className="font-medium">{quiz.question}</p>

      {logCount > 1 && (
        <p className="text-xs text-muted-foreground">
          共有 {logCount} 個 console.log，請用空格或逗號分隔每個輸出值
        </p>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
          disabled={submitted}
          placeholder={
            logCount > 1
              ? `輸入 ${logCount} 個值，用空格分隔...`
              : "輸入你的答案..."
          }
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          autoFocus
        />
        {!submitted && (
          <Button onClick={handleSubmit} disabled={!input.trim()}>
            確認
          </Button>
        )}
      </div>
    </div>
  );
}
