"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuizShell } from "@/components/quiz/QuizShell";
import { getProgress, getWeakQuizIds, removeCorrectFromWeak } from "@/lib/progress-store";
import { loadChapter } from "@/lib/chapter-loader";
import { Quiz } from "@/types/quiz";
import { ChapterMeta } from "@/types/chapter";
import chapterIndex from "@/data/chapter-index.json";

const chapters = chapterIndex as ChapterMeta[];

interface ChapterWeak {
  chapter: ChapterMeta;
  quizzes: Quiz[];
}

export default function ReviewPage() {
  const [chapterWeaks, setChapterWeaks] = useState<ChapterWeak[]>([]);
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);

  const loadWeak = useCallback(async () => {
    const progress = getProgress();
    const weakIds = getWeakQuizIds(progress);

    if (weakIds.length === 0) {
      setChapterWeaks([]);
      setLoading(false);
      return;
    }

    const results: ChapterWeak[] = [];
    const completedChapters = chapters.filter((c) => c.status === "completed");

    for (const ch of completedChapters) {
      const data = await loadChapter(ch.id);
      if (data) {
        const matched = data.quizzes.filter((q) => weakIds.includes(q.id));
        if (matched.length > 0) {
          results.push({ chapter: ch, quizzes: matched });
        }
      }
    }

    setChapterWeaks(results);
    setSelectedChapterIds(new Set(results.map((r) => r.chapter.id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWeak();
  }, [loadWeak]);

  const toggleChapter = (chId: string) => {
    setSelectedChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chId)) {
        next.delete(chId);
      } else {
        next.add(chId);
      }
      return next;
    });
  };

  const selectedQuizzes = chapterWeaks
    .filter((cw) => selectedChapterIds.has(cw.chapter.id))
    .flatMap((cw) => cw.quizzes);

  const totalWeak = chapterWeaks.reduce((sum, cw) => sum + cw.quizzes.length, 0);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  if (totalWeak === 0) {
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
      <div className="mx-auto max-w-content animate-fade-in px-4 py-8 pb-20 md:px-6 md:pb-8">
        <h1 className="mb-2 text-2xl font-bold">弱點複習</h1>
        <p className="mb-6 text-muted-foreground">
          這些是你之前答錯的題目，勾選要複習的章節
        </p>

        <Card className="mb-6">
          <CardContent className="py-4">
            <p className="mb-3 text-sm font-semibold">
              錯題分布（共 {totalWeak} 題）
            </p>
            <div className="space-y-2">
              {chapterWeaks.map((cw) => (
                <label
                  key={cw.chapter.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors duration-fast hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={selectedChapterIds.has(cw.chapter.id)}
                    onChange={() => toggleChapter(cw.chapter.id)}
                    className="h-4 w-4 rounded border-border text-primary accent-primary"
                  />
                  <span className="flex-1 text-sm">
                    第 {cw.chapter.number} 章：{cw.chapter.title}
                  </span>
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                    {cw.quizzes.length} 題
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => setStarted(true)}
            size="lg"
            disabled={selectedQuizzes.length === 0}
          >
            開始複習（{selectedQuizzes.length} 題）
          </Button>
        </div>
      </div>
    );
  }

  return (
    <QuizShell
      chapterId="review"
      chapterTitle="弱點複習"
      quizzes={selectedQuizzes}
      onComplete={(result) => {
        // Remove quizzes that were answered correctly from the weak list
        const correctIds = selectedQuizzes
          .filter((q) => !result.wrongQuizIds.includes(q.id))
          .map((q) => q.id);
        if (correctIds.length > 0) {
          removeCorrectFromWeak(correctIds);
        }
      }}
    />
  );
}
