"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { getProgress } from "@/lib/progress-store";
import { UserProgress, DEFAULT_PROGRESS } from "@/types/progress";
import { ChapterMeta } from "@/types/chapter";
import chapterIndex from "@/data/chapter-index.json";

const chapters = chapterIndex as ChapterMeta[];

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const completedChapters = chapters.filter((c) => c.status === "completed");
  const attemptedChapters = completedChapters.filter(
    (c) => progress.chapters[c.id]
  );

  const overallProgress = Math.round(
    (completedChapters.length / chapters.length) * 100
  );

  const avgScore =
    attemptedChapters.length > 0
      ? Math.round(
          attemptedChapters.reduce(
            (sum, c) => sum + (progress.chapters[c.id]?.bestScore ?? 0),
            0
          ) / attemptedChapters.length
        )
      : 0;

  const totalAttempts = Object.values(progress.chapters).reduce(
    (sum, cp) => sum + cp.attemptCount,
    0
  );

  return (
    <div className="mx-auto max-w-content px-4 py-8 pb-20 md:px-6 md:pb-8">
      <h1 className="mb-6 text-2xl font-bold">學習統計</h1>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="flex flex-col items-center py-6">
            <ProgressRing value={overallProgress} size={100} label="課程進度" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              平均最佳分數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{avgScore}</span>
            <span className="ml-1 text-sm text-muted-foreground">分</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              測驗次數
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{totalAttempts}</span>
            <span className="ml-1 text-sm text-muted-foreground">次</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              連續學習
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{progress.streakDays}</span>
            <span className="ml-1 text-sm text-muted-foreground">天</span>
          </CardContent>
        </Card>
      </div>

      {/* Per-chapter scores */}
      <h2 className="mb-4 text-lg font-semibold">各章節成績</h2>
      <div className="space-y-3">
        {completedChapters.map((ch) => {
          const cp = progress.chapters[ch.id];

          return (
            <Card key={ch.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">
                    第 {ch.number} 章：{ch.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ch.quizCount} 題
                    {cp ? ` / 做過 ${cp.attemptCount} 次` : " / 尚未測驗"}
                  </p>
                </div>
                <div className="text-right">
                  {cp ? (
                    <>
                      <p className="text-lg font-bold text-primary">
                        {cp.bestScore} 分
                      </p>
                      {cp.wrongQuizIds.length > 0 && (
                        <p className="text-xs text-destructive">
                          {cp.wrongQuizIds.length} 題待複習
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">--</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
