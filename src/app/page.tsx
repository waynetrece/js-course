"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/progress/ProgressRing";
import { getProgress } from "@/lib/progress-store";
import { UserProgress, DEFAULT_PROGRESS } from "@/types/progress";
import { ChapterMeta } from "@/types/chapter";
import chapterIndex from "@/data/chapter-index.json";

const chapters = chapterIndex as ChapterMeta[];

export default function Dashboard() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const completedChapters = chapters.filter((c) => c.status === "completed");
  const totalChapters = chapters.length;
  const overallProgress = Math.round(
    (completedChapters.length / totalChapters) * 100
  );

  const chaptersWithScores = completedChapters.filter(
    (c) => progress.chapters[c.id]
  );
  const avgScore =
    chaptersWithScores.length > 0
      ? Math.round(
          chaptersWithScores.reduce(
            (sum, c) => sum + (progress.chapters[c.id]?.bestScore ?? 0),
            0
          ) / chaptersWithScores.length
        )
      : 0;

  const weakChapters = completedChapters
    .filter((c) => {
      const cp = progress.chapters[c.id];
      return cp && cp.wrongQuizIds.length > 0;
    })
    .slice(0, 3);

  const lastStudiedChapter = completedChapters
    .filter((c) => progress.chapters[c.id])
    .sort(
      (a, b) =>
        (progress.chapters[b.id]?.lastAttempt ?? 0) -
        (progress.chapters[a.id]?.lastAttempt ?? 0)
    )[0];

  return (
    <div className="mx-auto max-w-content px-4 pb-20 pt-10 md:px-6 md:pb-12">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold md:text-3xl">JS 觀念複習</h1>
        <p className="mt-2 text-muted-foreground">
          六角學院 JavaScript 課程 — 互動式複習平台
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Overall Progress */}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <ProgressRing value={overallProgress} label="整體進度" size={100} />
            <p className="mt-3 text-sm text-muted-foreground">
              {completedChapters.length} / {totalChapters} 章
            </p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card>
          <CardContent className="flex flex-col justify-center py-6">
            <p className="text-sm font-medium text-muted-foreground">
              連續學習
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{progress.streakDays}</span>
              <span className="text-sm text-muted-foreground">天</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {progress.streakDays > 0 ? "持續保持！" : "今天開始第一天"}
            </p>
          </CardContent>
        </Card>

        {/* Average Score */}
        <Card>
          <CardContent className="flex flex-col justify-center py-6">
            <p className="text-sm font-medium text-muted-foreground">
              平均分數
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">{avgScore}</span>
              <span className="text-sm text-muted-foreground">分</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              已完成 {progress.totalQuizzesDone} 題
            </p>
          </CardContent>
        </Card>

        {/* Total Quizzes */}
        <Card>
          <CardContent className="flex flex-col justify-center py-6">
            <p className="text-sm font-medium text-muted-foreground">
              可用題目
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">
                {completedChapters.reduce((s, c) => s + c.quizCount, 0)}
              </span>
              <span className="text-sm text-muted-foreground">題</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              涵蓋 {completedChapters.length} 個章節
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {lastStudiedChapter ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <p className="text-sm font-medium text-muted-foreground">
                繼續上次
              </p>
              <p className="mt-1 text-lg font-semibold">
                第 {lastStudiedChapter.number} 章：{lastStudiedChapter.title}
              </p>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm">
                  <Link href={`/quiz/${lastStudiedChapter.id}`}>
                    開始測驗
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/chapters/${lastStudiedChapter.id}`}>
                    複習觀念
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <p className="text-sm font-medium text-muted-foreground">
                開始學習
              </p>
              <p className="mt-1 text-lg font-semibold">
                選一個章節開始你的第一次測驗
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/chapters">瀏覽章節</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="py-6">
            <p className="text-sm font-medium text-muted-foreground">
              弱點複習
            </p>
            {weakChapters.length > 0 ? (
              <>
                <p className="mt-1 text-sm">
                  {weakChapters.length} 個章節有答錯的題目
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {weakChapters.map((c) => (
                    <Badge key={c.id} variant="secondary">
                      第 {c.number} 章
                    </Badge>
                  ))}
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href="/review">前往複習</Link>
                </Button>
              </>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                完成測驗後，答錯的題目會自動出現在這裡
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chapter Overview */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">章節一覽</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/chapters">查看全部</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.slice(0, 6).map((ch) => {
            const cp = progress.chapters[ch.id];
            return (
              <Link key={ch.id} href={`/chapters/${ch.id}`}>
                <Card className="transition-shadow duration-fast ease-material hover:shadow-md">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          第 {ch.number} 章
                        </p>
                        <p className="font-medium">{ch.title}</p>
                      </div>
                      <Badge
                        variant={
                          ch.status === "completed" ? "default" : "secondary"
                        }
                        className={
                          ch.status === "completed"
                            ? "bg-success text-white"
                            : ""
                        }
                      >
                        {ch.status === "completed"
                          ? "已完成"
                          : ch.status === "in-progress"
                          ? "進行中"
                          : "未開始"}
                      </Badge>
                    </div>
                    {cp && (
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>最佳 {cp.bestScore} 分</span>
                        <span>做過 {cp.attemptCount} 次</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
