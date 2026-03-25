"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CodePrediction } from "./CodePrediction";
import { FillInBlank } from "./FillInBlank";
import { MultipleChoice } from "./MultipleChoice";
import { TrueFalse } from "./TrueFalse";
import { CodingChallenge } from "./CodingChallenge";
import { QuizFeedback } from "./QuizFeedback";
import { Quiz, QuizSession, QuizResult } from "@/types/quiz";
import { createSession, calculateResult } from "@/lib/quiz-engine";
import { saveQuizResult, saveQuizSession, loadQuizSession, clearQuizSession } from "@/lib/progress-store";

interface QuizShellProps {
  chapterId: string;
  chapterTitle: string;
  quizzes: Quiz[];
  onComplete?: (result: QuizResult) => void;
}

type Phase = "checking" | "resume" | "active";

export function QuizShell({ chapterId, chapterTitle, quizzes, onComplete }: QuizShellProps) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [session, setSession] = useState<QuizSession | null>(null);
  const [savedSession, setSavedSession] = useState<QuizSession | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string; formatHint?: boolean } | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);

  // mount 時檢查 localStorage 是否有未完成的 session
  useEffect(() => {
    const saved = loadQuizSession(chapterId);
    if (saved) {
      const answeredCount = Object.keys(saved.answers).length;
      if (answeredCount >= saved.quizzes.length) {
        // 已完成的測驗 — 恢復結果畫面
        const quizResult = calculateResult(saved);
        setSession(saved);
        setResult(quizResult);
        setPhase("active");
      } else if (answeredCount > 0) {
        // 未完成 — 詢問繼續或重新開始
        setSavedSession(saved);
        setPhase("resume");
      } else {
        // 空 session — 直接開始
        setSession(saved);
        setPhase("active");
      }
    } else {
      const s = createSession(chapterId, quizzes);
      saveQuizSession(s);
      setSession(s);
      setPhase("active");
    }
  }, [chapterId, quizzes]);

  const handleResume = () => {
    setSession(savedSession);
    setSavedSession(null);
    setPhase("active");
  };

  const handleRestart = () => {
    clearQuizSession(chapterId);
    const s = createSession(chapterId, quizzes);
    saveQuizSession(s);
    setSession(s);
    setSavedSession(null);
    setPhase("active");
  };

  const handleAnswer = (answer: string | number | boolean, correct: boolean) => {
    if (!session) return;
    const currentQuiz = session.quizzes[session.currentIndex];
    const answerStr = String(answer);
    const isFormatHint = answerStr.startsWith("__FORMAT_HINT__|");
    const actualAnswer = isFormatHint ? answerStr.replace("__FORMAT_HINT__|", "") : answerStr;
    const updatedAnswers = {
      ...session.answers,
      [currentQuiz.id]: { answer: actualAnswer, correct },
    };
    const updated = { ...session, answers: updatedAnswers };
    setSession(updated);
    saveQuizSession(updated);
    setFeedback({ correct, explanation: currentQuiz.explanation, formatHint: isFormatHint });
  };

  const handleNext = () => {
    if (!session) return;
    const nextIndex = session.currentIndex + 1;
    setFeedback(null);

    if (nextIndex >= session.quizzes.length) {
      const quizResult = calculateResult(session);
      saveQuizResult(quizResult);
      // session 保留在 localStorage，重新整理可恢復結果畫面
      setResult(quizResult);
      onComplete?.(quizResult);
    } else {
      const updated = { ...session, currentIndex: nextIndex };
      setSession(updated);
      saveQuizSession(updated);
    }
  };

  // 檢查中（極短暫）
  if (phase === "checking" || (!session && phase !== "resume")) {
    return null;
  }

  // 恢復對話框
  if (phase === "resume" && savedSession) {
    const answered = Object.keys(savedSession.answers).length;
    const total = savedSession.quizzes.length;
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card>
          <CardContent className="py-6 text-center">
            <h2 className="mb-2 text-lg font-bold">發現未完成的測驗</h2>
            <p className="mb-6 text-muted-foreground">
              上次答到第 {answered} / {total} 題，要繼續嗎？
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleResume}>繼續上次</Button>
              <Button variant="outline" onClick={handleRestart}>
                重新開始
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) return null;

  const currentQuiz = session.quizzes[session.currentIndex];
  const progressPercent = Math.round(
    (session.currentIndex / session.quizzes.length) * 100
  );

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
              clearQuizSession(chapterId);
              const s = createSession(chapterId, quizzes);
              saveQuizSession(s);
              setSession(s);
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
          {currentQuiz.isNew && (
            <span className="mb-3 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              平台獨家
            </span>
          )}
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
          {currentQuiz.type === "coding-challenge" && (
            <CodingChallenge
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
              formatHint={feedback.formatHint}
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
