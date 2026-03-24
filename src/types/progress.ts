export interface ChapterProgress {
  bestScore: number;
  attemptCount: number;
  wrongQuizIds: string[];
  lastAttempt: number;
}

export interface UserProgress {
  chapters: Record<string, ChapterProgress>;
  streakDays: number;
  lastStudyDate: string;
  totalQuizzesDone: number;
}

export const DEFAULT_PROGRESS: UserProgress = {
  chapters: {},
  streakDays: 0,
  lastStudyDate: "",
  totalQuizzesDone: 0,
};
