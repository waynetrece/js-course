"use client";

import { useState } from "react";
import { MultipleChoiceQuiz } from "@/types/quiz";
import { cn } from "@/lib/utils";

interface Props {
  quiz: MultipleChoiceQuiz;
  onAnswer: (answer: number, correct: boolean) => void;
}

export function MultipleChoice({ quiz, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    setSubmitted(true);
    const correct = index === quiz.correctIndex;
    onAnswer(index, correct);
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium">{quiz.question}</p>

      <div className="grid gap-3">
        {quiz.options.map((option, i) => {
          let variant = "default";
          if (submitted) {
            if (i === quiz.correctIndex) variant = "correct";
            else if (i === selected) variant = "wrong";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={submitted}
              className={cn(
                "min-h-[44px] rounded-md border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-fast ease-material",
                variant === "default" &&
                  "border-border hover:border-primary hover:bg-primary/5",
                variant === "correct" &&
                  "border-success bg-success/10 text-success",
                variant === "wrong" &&
                  "border-destructive bg-destructive/10 text-destructive",
                submitted && variant === "default" && "opacity-50"
              )}
            >
              <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
