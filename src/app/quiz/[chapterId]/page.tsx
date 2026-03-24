"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QuizShell } from "@/components/quiz/QuizShell";
import { loadChapter } from "@/lib/chapter-loader";
import { ChapterData } from "@/types/chapter";

export default function QuizPage() {
  const params = useParams();
  const chapterId = params.chapterId as string;
  const [chapter, setChapter] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChapter(chapterId).then((data) => {
      setChapter(data);
      setLoading(false);
    });
  }, [chapterId]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">載入題目中...</p>
      </div>
    );
  }

  if (!chapter || chapter.quizzes.length === 0) {
    return (
      <div className="mx-auto max-w-content px-4 py-12 text-center">
        <p className="text-lg text-muted-foreground">此章節尚未建立題目</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/chapters">返回章節列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <QuizShell
      chapterId={chapter.id}
      chapterTitle={`第 ${chapter.number} 章：${chapter.title}`}
      quizzes={chapter.quizzes}
    />
  );
}
