"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { getProgress, resetProgress } from "@/lib/progress-store";
import { UserProgress, DEFAULT_PROGRESS } from "@/types/progress";
import { ChapterMeta } from "@/types/chapter";
import { CATEGORY_ORDER, CATEGORY_COLORS } from "@/lib/constants";
import chapterIndex from "@/data/chapter-index.json";

const chapters = chapterIndex as ChapterMeta[];

export default function ProgressPage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [confirmReset, setConfirmReset] = useState(false);

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

  const handleReset = () => {
    resetProgress();
    setProgress(DEFAULT_PROGRESS);
    setConfirmReset(false);
  };

  // Group chapters by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    chapters: completedChapters.filter((c) => c.category === cat),
  })).filter((g) => g.chapters.length > 0);

  return (
    <div className="mx-auto max-w-content animate-fade-in px-4 py-8 pb-20 md:px-6 md:pb-8">
      <h1 className="mb-6 text-2xl font-bold">學習統計</h1>

      {/* Summary */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="col-span-2 lg:col-span-1">
          <CardContent className="flex flex-col items-center py-6">
            <ProgressRing value={overallProgress} size={100} label="課程進度" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <p className="mb-1 text-sm text-muted-foreground">平均最佳分數</p>
            <p>
              <span className="text-3xl font-bold">{avgScore}</span>
              <span className="ml-1 text-sm text-muted-foreground">分</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <p className="mb-1 text-sm text-muted-foreground">測驗次數</p>
            <p>
              <span className="text-3xl font-bold">{totalAttempts}</span>
              <span className="ml-1 text-sm text-muted-foreground">次</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <p className="mb-1 text-sm text-muted-foreground">連續學習</p>
            <p>
              <span className="text-3xl font-bold">{progress.streakDays}</span>
              <span className="ml-1 text-sm text-muted-foreground">天</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-category scores with bar chart */}
      <h2 className="mb-4 text-lg font-semibold">各章節成績</h2>

      <div className="space-y-6">
        {grouped.map(({ category, chapters: catChapters }) => {
          const colors = CATEGORY_COLORS[category];
          return (
            <div key={category}>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}
                >
                  {category}
                </span>
              </div>
              <div className="space-y-2">
                {catChapters.map((ch) => {
                  const cp = progress.chapters[ch.id];
                  const score = cp?.bestScore ?? 0;

                  return (
                    <Card key={ch.id}>
                      <CardContent className="py-3">
                        <div className="mb-1.5 flex items-center justify-between">
                          <p className="text-sm font-medium">
                            第 {ch.number} 章：{ch.title}
                          </p>
                          <div className="text-right">
                            {cp ? (
                              <div className="flex items-center gap-3">
                                {cp.wrongQuizIds.length > 0 && (
                                  <span className="text-xs text-destructive">
                                    {cp.wrongQuizIds.length} 題待複習
                                  </span>
                                )}
                                <span className="text-sm font-bold text-primary">
                                  {score} 分
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">--</span>
                            )}
                          </div>
                        </div>
                        {/* Bar chart */}
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all duration-normal ease-material ${colors.bar}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {ch.quizCount} 題
                          {cp ? ` / 做過 ${cp.attemptCount} 次` : " / 尚未測驗"}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset progress */}
      <div className="mt-8 border-t border-border pt-6">
        {!confirmReset ? (
          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmReset(true)}
          >
            重設所有進度
          </Button>
        ) : (
          <Card className="border-destructive/30">
            <CardContent className="py-4">
              <p className="mb-3 text-sm font-medium">
                確定要重設所有學習進度嗎？此操作無法復原。
              </p>
              <div className="flex gap-3">
                <Button variant="destructive" size="sm" onClick={handleReset}>
                  確定重設
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmReset(false)}
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
