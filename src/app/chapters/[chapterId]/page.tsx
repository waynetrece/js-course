"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ConceptBlock } from "@/components/chapters/ConceptBlock";
import { loadChapter } from "@/lib/chapter-loader";
import { getProgress } from "@/lib/progress-store";
import { ChapterData } from "@/types/chapter";
import { ChapterProgress } from "@/types/progress";

export default function ChapterDetailPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [chapterProgress, setChapterProgress] = useState<ChapterProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapter(chapterId).then((data) => {
      setChapter(data);
      setLoading(false);
    });
    const progress = getProgress();
    setChapterProgress(progress.chapters[chapterId] ?? null);
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">載入中...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="mx-auto max-w-content px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">章節尚未建立題目</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/chapters">返回章節列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content animate-fade-in px-4 py-8 pb-20 md:px-6 md:pb-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/chapters"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          返回章節列表
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              {chapter.category}
            </Badge>
            <h1 className="text-2xl font-bold">
              第 {chapter.number} 章：{chapter.title}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {chapter.concepts.length} 個觀念 / {chapter.quizzes.length} 道題目
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      {chapterProgress && (
        <Card className="mb-6">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4 text-sm">
              <span>
                最佳分數：
                <strong className="text-primary">{chapterProgress.bestScore} 分</strong>
              </span>
              <span className="text-muted-foreground">
                做過 {chapterProgress.attemptCount} 次
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start Quiz Button */}
      <div className="mb-8">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`/quiz/${chapterId}`}>
            開始測驗（{chapter.quizzes.length} 題）
          </Link>
        </Button>
      </div>

      {/* Concepts */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">觀念摘要</h2>
        <div className="space-y-3">
          {chapter.concepts.map((concept, i) => (
            <ConceptBlock key={concept.id} concept={concept} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
