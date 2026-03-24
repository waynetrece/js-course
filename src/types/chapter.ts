import { Quiz } from "./quiz";

export type ChapterCategory = "基礎篇" | "資料結構篇" | "邏輯判斷篇" | "函式篇";

export type ChapterStatus = "completed" | "in-progress" | "locked";

export interface ChapterMeta {
  id: string;
  number: number;
  title: string;
  category: ChapterCategory;
  status: ChapterStatus;
  conceptCount: number;
  quizCount: number;
}

export interface CodeExample {
  code: string;
  output: string;
}

export interface Concept {
  id: string;
  title: string;
  explanation: string;
  codeExamples: CodeExample[];
  tips: string[];
}

export interface ChapterData {
  id: string;
  number: number;
  title: string;
  category: ChapterCategory;
  concepts: Concept[];
  quizzes: Quiz[];
}
