import { ChapterData } from "@/types/chapter";

const chapterCache = new Map<string, ChapterData>();

export async function loadChapter(chapterId: string): Promise<ChapterData | null> {
  if (chapterCache.has(chapterId)) {
    return chapterCache.get(chapterId)!;
  }

  try {
    const data = await import(`@/data/chapters/${chapterId}.json`);
    const chapter = data.default as ChapterData;
    chapterCache.set(chapterId, chapter);
    return chapter;
  } catch {
    return null;
  }
}
