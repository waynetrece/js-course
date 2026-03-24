import { UserProgress, ChapterProgress, DEFAULT_PROGRESS } from "@/types/progress";
import { QuizResult } from "@/types/quiz";

const STORAGE_KEY = "js-review-progress";

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    return JSON.parse(raw) as UserProgress;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateStreak(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().slice(0, 10);
  if (progress.lastStudyDate === today) return progress;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakDays = progress.lastStudyDate === yesterday
    ? progress.streakDays + 1
    : 1;

  return { ...progress, streakDays, lastStudyDate: today };
}

export function saveQuizResult(result: QuizResult): UserProgress {
  const progress = getProgress();
  const updated = updateStreak(progress);

  const existing = updated.chapters[result.chapterId];
  const chapterProgress: ChapterProgress = {
    bestScore: Math.max(result.score, existing?.bestScore ?? 0),
    attemptCount: (existing?.attemptCount ?? 0) + 1,
    wrongQuizIds: result.wrongQuizIds,
    lastAttempt: result.timestamp,
  };

  const newProgress: UserProgress = {
    ...updated,
    chapters: { ...updated.chapters, [result.chapterId]: chapterProgress },
    totalQuizzesDone: updated.totalQuizzesDone + result.totalQuestions,
  };

  saveProgress(newProgress);
  return newProgress;
}

export function getWeakQuizIds(progress: UserProgress): string[] {
  const allWrong: string[] = [];
  for (const ch of Object.values(progress.chapters)) {
    allWrong.push(...ch.wrongQuizIds);
  }
  return allWrong;
}
