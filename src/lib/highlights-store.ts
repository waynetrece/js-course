const STORAGE_KEY = "js-review-highlights";

export interface Highlight {
  conceptId: string;
  chapterId: string;
  chapterTitle: string;
  conceptTitle: string;
  note: string;
  createdAt: number;
}

function readAll(): Highlight[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items: Highlight[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getHighlights(): Highlight[] {
  return readAll();
}

export function getHighlight(conceptId: string): Highlight | undefined {
  return readAll().find((h) => h.conceptId === conceptId);
}

export function saveHighlight(data: Omit<Highlight, "createdAt">): Highlight {
  const items = readAll();
  const existing = items.findIndex((h) => h.conceptId === data.conceptId);
  const highlight: Highlight = { ...data, createdAt: Date.now() };

  if (existing >= 0) {
    items[existing] = highlight;
  } else {
    items.push(highlight);
  }

  writeAll(items);
  return highlight;
}

export function removeHighlight(conceptId: string) {
  const items = readAll().filter((h) => h.conceptId !== conceptId);
  writeAll(items);
}

export function getHighlightsByChapter(): Record<string, Highlight[]> {
  const items = readAll();
  const grouped: Record<string, Highlight[]> = {};

  for (const item of items) {
    if (!grouped[item.chapterId]) {
      grouped[item.chapterId] = [];
    }
    grouped[item.chapterId].push(item);
  }

  return grouped;
}
