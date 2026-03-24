"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuizShell } from "@/components/quiz/QuizShell";
import { getProgress, getWeakQuizIds } from "@/lib/progress-store";
import { loadChapter } from "@/lib/chapter-loader";
import { Quiz } from "@/types/quiz";
import { ChapterMeta } from "@/types/chapter";
import chapterIndex from "@/data/chapter-index.json";

const chapters = chapterIndex as ChapterMeta[];

export default function ReviewPage() {
  const [weakQuizzes, setWeakQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    async function loadWeak() {
      const progress = getProgress();
      const weakIds = getWeakQuizIds(progress);

      if (weakIds.length === 0) {
        setLoading(false);
        return;
      }

      const allQuizzes: Quiz[] = [];
      const completedChapters = chapters.filter((c) => c.status === "completed");

      for (const ch of completedChapters) {
        const data = await loadChapter(ch.id);
        if (data) {
          const matched = data.quizzes.filter((q) => weakIds.includes(q.id));
          allQuizzes.push(...matched);
        }
      }

      setWeakQuizzes(allQuizzes);
      setLoading(false);
    }

    loadWeak();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  if (weakQuizzes.length === 0) {
    return (
      <div className="mx-auto max-w-content px-4 py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-success"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
        </div>
        <h2 className="text-xl font-bold">沒有需要複習的題目</h2>
        <p className="mt-2 text-muted-foreground">
          完成章節測驗後，答錯的題目會自動出現在這裡
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/chapters">去做測驗</Link>
        </Button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-content px-4 py-8 pb-20 md:px-6 md:pb-8">
        <h1 className="mb-2 text-2xl font-bold">弱點複習</h1>
        <p className="mb-6 text-muted-foreground">
          這些是你之前答錯的題目，再做一次加強記憶
        </p>
        <Card>
          <CardContent className="py-6 text-center">
            <p className="mb-4 text-lg font-semibold">
              共 {weakQuizzes.length} 題待複習
            </p>
            <Button onClick={() => setStarted(true)} size="lg">
              開始複習
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <QuizShell
      chapterId="review"
      chapterTitle="弱點複習"
      quizzes={weakQuizzes}
    />
  );
}
