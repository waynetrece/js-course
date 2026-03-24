"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Concept } from "@/types/chapter";

interface ConceptBlockProps {
  concept: Concept;
  index: number;
}

export function ConceptBlock({ concept, index }: ConceptBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left sm:px-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
            {index + 1}
          </span>
          <span className="font-medium">{concept.title}</span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 text-muted-foreground transition-transform duration-normal ease-material ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <CardContent className="border-t pt-4">
          <p className="text-sm leading-relaxed text-foreground/90">
            {concept.explanation}
          </p>

          {concept.codeExamples.map((ex, i) => (
            <div key={i} className="mt-4">
              <pre className="overflow-x-auto rounded-md bg-slate-950 p-4 text-sm text-slate-50">
                <code className="font-mono">{ex.code}</code>
              </pre>
              {ex.output && (
                <div className="mt-1 rounded-b-md bg-slate-800 px-4 py-2 text-xs text-emerald-400">
                  <span className="text-slate-400">{"// Output: "}</span>
                  {ex.output}
                </div>
              )}
            </div>
          ))}

          {concept.tips.length > 0 && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="mb-1 text-xs font-semibold text-amber-700">
                重點提醒
              </p>
              <ul className="space-y-1">
                {concept.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-sm text-amber-800"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
