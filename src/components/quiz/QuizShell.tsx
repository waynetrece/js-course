"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CodePrediction } from "./CodePrediction";
import { FillInBlank } from "./FillInBlank";
import { MultipleChoice } from "./MultipleChoice";
import { TrueFalse } from "./TrueFalse";
import { QuizFeedback } from "./QuizFeedback";
import { Quiz, QuizSession, QuizResult } from "@/types/quiz";
import { createSession, calculateResult } from "@/lib/quiz-engine";
import { saveQuizResult } from "@/lib/progress-store";

interface QuizShellProps {
  chapterId: string;
  chapterTitle: string;
  quizzes: Quiz[];
  onComplete?: (result: QuizResult) => void;
}

export function QuizShell({ chapterId, chapterTitle, quizzes, onComplete }: QuizShellProps) {
  const [session, setSession] = useState<QuizSession>(() =>
    createSession(chapterId, quizzes)
  );
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  const currentQuiz = session.quizzes[session.currentIndex];
  const progressPercent = Math.round(
    (session.currentIndex / session.quizzes.length) * 100
  );

  const handleAnswer = (answer: string | number | boolean, correct: boolean) => {
    const updatedAnswers = {
      ...session.answers,
      [currentQuiz.id]: { answer: String(answer), correct },
    };
    setSession({ ...session, answers: updatedAnswers });
    setFeedback({ correct, explanation: currentQuiz.explanation });
  };

  const handleNext = () => {
    const nextIndex = session.currentIndex + 1;
    setFeedback(null);

    if (nextIndex >= session.quizzes.length) {
      const quizResult = calculateResult(session);
      saveQuizResult(quizResult);
      setResult(quizResult);
      onComplete?.(quizResult);
    } else {
      setSession({ ...session, currentIndex: nextIndex });
    }
  };

  // Result screen
  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <div className="mb-6">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <span className="text-3xl font-bold text-primary">
              {result.score}
            </span>
          </div>
          <h2 className="text-xl font-bold">測驗完成！</h2>
          <p className="mt-1 text-muted-foreground">
            {result.correctCount} / {result.totalQuestions} 題答對
          </p>
        </div>

        {result.wrongQuizIds.length > 0 && (
          <Card className="mb-6 text-left">
            <CardContent className="py-4">
              <p className="mb-3 text-sm font-semibold">
                答錯的題目（{result.wrongQuizIds.length} 題）
              </p>
              <div className="space-y-3">
                {session.quizzes
                  .filter((q) => result.wrongQuizIds.includes(q.id))
                  .map((q) => (
                    <div key={q.id} className="rounded-md bg-muted p-3 text-sm">
                      <p className="font-medium">{q.question}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {q.explanation}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-3">
          <Button
            onClick={() => {
              setSession(createSession(chapterId, quizzes));
              setResult(null);
              setFeedback(null);
            }}
          >
            再做一次
          </Button>
          <Button asChild variant="outline">
            <Link href={`/chapters/${chapterId}`}>回到章節</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
          <span>{chapterTitle}</span>
          <span>
            {session.currentIndex + 1} / {session.quizzes.length}
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Quiz Card */}
      <Card key={currentQuiz.id} className="animate-slide-in">
        <CardContent className="py-6">
          {currentQuiz.type === "code-prediction" && (
            <CodePrediction
              key={currentQuiz.id}
              quiz={currentQuiz}
              onAnswer={handleAnswer}
            />
          )}
          {currentQuiz.type === "fill-in-blank" && (
            <FillInBlank
              key={currentQuiz.id}
              quiz={currentQuiz}
              onAnswer={handleAnswer}
            />
          )}
          {currentQuiz.type === "multiple-choice" && (
            <MultipleChoice
              key={currentQuiz.id}
              quiz={currentQuiz}
              onAnswer={handleAnswer}
            />
          )}
          {currentQuiz.type === "true-false" && (
            <TrueFalse
              key={currentQuiz.id}
              quiz={currentQuiz}
              onAnswer={handleAnswer}
            />
          )}

          {feedback && (
            <QuizFeedback
              correct={feedback.correct}
              explanation={feedback.explanation}
              onNext={handleNext}
            />
          )}
        </CardContent>
      </Card>

      {/* Exit */}
      <div className="mt-4 text-center">
        <Link
          href={`/chapters/${chapterId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          退出測驗
        </Link>
      </div>
    </div>
  );
}
