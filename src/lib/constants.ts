import { ChapterCategory } from "@/types/chapter";

export const CATEGORY_ORDER: ChapterCategory[] = [
  "基礎篇",
  "資料結構篇",
  "邏輯判斷篇",
  "函式篇",
];

export const CATEGORY_COLORS: Record<ChapterCategory, { bg: string; text: string; border: string }> = {
  "基礎篇": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "資料結構篇": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "邏輯判斷篇": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "函式篇": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
};

export const NAV_ITEMS = [
  { href: "/", label: "首頁" },
  { href: "/chapters", label: "章節" },
  { href: "/review", label: "弱點複習" },
  { href: "/progress", label: "統計" },
] as const;
