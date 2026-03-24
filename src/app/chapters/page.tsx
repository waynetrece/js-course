"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProgress } from "@/lib/progress-store";
import { UserProgress, DEFAULT_PROGRESS } from "@/types/progress";
import { ChapterMeta, ChapterCategory } from "@/types/chapter";
import { CATEGORY_ORDER, CATEGORY_COLORS } from "@/lib/constants";
import chapterIndex from "@/data/chapter-index.json";

const chapters = chapterIndex as ChapterMeta[];

export default function ChaptersPage() {
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = chapters.filter((c) => c.category === cat);
    return acc;
  }, {} as Record<ChapterCategory, ChapterMeta[]>);

  return (
    <div className="mx-auto max-w-content px-4 py-8 pb-20 md:px-6 md:pb-8">
      <h1 className="mb-6 text-2xl font-bold">章節列表</h1>

      {CATEGORY_ORDER.map((category) => {
        const chs = grouped[category];
        if (!chs || chs.length === 0) return null;
        const colors = CATEGORY_COLORS[category];

        return (
          <div key={category} className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
                {category}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {chs.length} 章
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {chs.map((ch) => {
                const cp = progress.chapters[ch.id];
                const isAvailable = ch.status === "completed";

                return (
                  <Link
                    key={ch.id}
                    href={isAvailable ? `/chapters/${ch.id}` : "#"}
                    className={!isAvailable ? "pointer-events-none opacity-50" : ""}
                  >
                    <Card className="h-full transition-shadow duration-fast ease-material hover:shadow-md">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              第 {ch.number} 章
                            </p>
                            <p className="font-medium">{ch.title}</p>
                            {isAvailable && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {ch.conceptCount} 觀念 / {ch.quizCount} 題
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant={isAvailable ? "default" : "secondary"}
                              className={
                                isAvailable ? "bg-success text-white" : ""
                              }
                            >
                              {ch.status === "completed"
                                ? "已完成"
                                : "進行中"}
                            </Badge>
                            {cp && (
                              <span className="text-xs text-muted-foreground">
                                {cp.bestScore} 分
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
