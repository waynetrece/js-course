"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodePredictionQuiz } from "@/types/quiz";

interface Props {
  quiz: CodePredictionQuiz;
  onAnswer: (answer: string, correct: boolean) => void;
}

export function CodePrediction({ quiz, onAnswer }: Props) {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const correct = input.trim() === quiz.correctAnswer.trim();
    setSubmitted(true);
    onAnswer(input.trim(), correct);
  };

  return (
    <div className="space-y-4">
      <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-50">
        <code className="font-mono">{quiz.code}</code>
      </pre>

      <p className="font-medium">{quiz.question}</p>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !submitted && handleSubmit()}
          disabled={submitted}
          placeholder="輸入你的答案..."
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
