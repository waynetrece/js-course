"use client";

import { useState } from "react";
import { TrueFalseQuiz } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface Props {
  quiz: TrueFalseQuiz;
  onAnswer: (answer: boolean, correct: boolean) => void;
}

export function TrueFalse({ quiz, onAnswer }: Props) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (answer: boolean) => {
    if (submitted) return;
    setSelected(answer);
    setSubmitted(true);
    const correct = answer === quiz.correctAnswer;
    onAnswer(answer, correct);
  };

  const getStyle = (value: boolean) => {
    if (!submitted) return "border-border hover:border-primary hover:bg-primary/5";
    if (value === quiz.correctAnswer) return "border-success bg-success/10 text-success";
    if (value === selected) return "border-destructive bg-destructive/10 text-destructive";
    return "opacity-50 border-border";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted p-4">
        <p className="text-base font-medium leading-relaxed">
          &ldquo;{quiz.statement}&rdquo;
        </p>
      </div>

      <p className="font-medium">{quiz.question}</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleSelect(true)}
          disabled={submitted}
          className={cn(
            "min-h-[56px] rounded-md border-2 text-center text-lg font-bold transition-all duration-fast ease-material",
            getStyle(true)
          )}
        >
          正確
        </button>
        <button
          onClick={() => handleSelect(false)}
          disabled={submitted}
          className={cn(
            "min-h-[56px] rounded-md border-2 text-center text-lg font-bold transition-all duration-fast ease-material",
            getStyle(false)
          )}
        >
          錯誤
        </button>
      </div>
    </div>
  );
}
