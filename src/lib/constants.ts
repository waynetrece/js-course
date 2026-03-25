import { ChapterCategory } from "@/types/chapter";

export const CATEGORY_ORDER: ChapterCategory[] = [
  "基礎篇",
  "資料結構篇",
  "邏輯判斷篇",
  "函式篇",
];

export const CATEGORY_COLORS: Record<ChapterCategory, { bg: string; text: string; border: string; bar: string }> = {
  "基礎篇": { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800", bar: "bg-blue-500" },
  "資料結構篇": { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", bar: "bg-emerald-500" },
  "邏輯判斷篇": { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", bar: "bg-amber-500" },
  "函式篇": { bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800", bar: "bg-violet-500" },
};

export const NAV_ITEMS = [
  { href: "/", label: "首頁" },
  { href: "/chapters", label: "章節" },
  { href: "/review", label: "弱點複習" },
  { href: "/playground", label: "練習場" },
  { href: "/progress", label: "統計" },
] as const;
