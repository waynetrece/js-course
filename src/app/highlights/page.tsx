"use client";

import { useEffect, useState } from "react";
import { getHighlightsByChapter, Highlight } from "@/lib/highlights-store";
import { HighlightCard } from "@/components/highlights/HighlightCard";

export default function HighlightsPage() {
  const [grouped, setGrouped] = useState<Record<string, Highlight[]>>({});

  useEffect(() => {
    setGrouped(getHighlightsByChapter());
  }, []);

  const handleRemove = (conceptId: string) => {
    setGrouped((prev) => {
      const next: Record<string, Highlight[]> = {};
      for (const [chId, items] of Object.entries(prev)) {
        const filtered = items.filter((h) => h.conceptId !== conceptId);
        if (filtered.length > 0) {
          next[chId] = filtered;
        }
      }
      return next;
    });
  };

  const chapterIds = Object.keys(grouped);
  const totalCount = chapterIds.reduce(
    (sum, id) => sum + grouped[id].length,
    0
  );

  return (
    <div className="mx-auto max-w-content animate-fade-in px-4 py-8 pb-20 md:px-6 md:pb-8">
      <h1 className="mb-1 text-2xl font-bold">重點筆記</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {totalCount > 0
          ? `共 ${totalCount} 個標記觀念`
          : "還沒有標記任何觀念"}
      </p>

      {totalCount === 0 && (
        <div className="flex min-h-[30vh] flex-col items-center justify-center text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 text-muted-foreground/40"
          >
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-muted-foreground">
            在章節觀念旁點書籤圖示，就能標記重點
          </p>
        </div>
      )}

      <div className="space-y-8">
        {chapterIds.map((chId) => {
          const items = grouped[chId];
          const chapterTitle = items[0]?.chapterTitle ?? chId;
          return (
            <section key={chId}>
              <h2 className="mb-3 text-lg font-semibold">{chapterTitle}</h2>
              <div className="space-y-2">
                {items.map((h) => (
                  <HighlightCard
                    key={h.conceptId}
                    highlight={h}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
