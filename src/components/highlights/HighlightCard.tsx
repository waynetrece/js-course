"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Highlight, removeHighlight } from "@/lib/highlights-store";

interface HighlightCardProps {
  highlight: Highlight;
  onRemove: (conceptId: string) => void;
}

export function HighlightCard({ highlight, onRemove }: HighlightCardProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeHighlight(highlight.conceptId);
    onRemove(highlight.conceptId);
  };

  return (
    <Link
      href={`/chapters/${highlight.chapterId}?concept=${highlight.conceptId}`}
      className="block"
    >
      <Card className="border-amber-200 transition-colors hover:border-amber-400 dark:border-amber-800 dark:hover:border-amber-600">
        <CardContent className="py-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{highlight.conceptTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {highlight.note}
              </p>
            </div>
            <button
              onClick={handleRemove}
              className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              title="移除標記"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date(highlight.createdAt).toLocaleDateString("zh-TW")}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
