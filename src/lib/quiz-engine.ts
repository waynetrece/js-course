import { Quiz, QuizSession, QuizResult } from "@/types/quiz";

export function shuffleQuizzes(quizzes: Quiz[]): Quiz[] {
  const shuffled = [...quizzes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createSession(chapterId: string, quizzes: Quiz[]): QuizSession {
  const shuffled = shuffleQuizzes(quizzes);
  // coding-challenge 排到最後面
  const normal = shuffled.filter((q) => q.type !== "coding-challenge");
  const coding = shuffled.filter((q) => q.type === "coding-challenge");
  return {
    chapterId,
    quizzes: [...normal, ...coding],
    currentIndex: 0,
    answers: {},
    startTime: Date.now(),
  };
}

function normalize(s: string): string {
  return s
    .replace(/\s*和\s*/g, " ")
    .replace(/[""]/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function checkAnswer(quiz: Quiz, userAnswer: string | number | boolean): boolean {
  switch (quiz.type) {
    case "code-prediction":
      return normalize(String(userAnswer)) === normalize(String(quiz.correctAnswer));
    case "fill-in-blank":
      return String(userAnswer).trim().toLowerCase() === quiz.correctAnswer.toLowerCase();
    case "multiple-choice":
      return Number(userAnswer) === quiz.correctIndex;
    case "true-false":
      return Boolean(userAnswer) === quiz.correctAnswer;
    case "coding-challenge":
      // coding-challenge 的正確判斷在 CodingChallenge 元件內處理
      return Boolean(userAnswer);
  }
}

export function calculateResult(session: QuizSession): QuizResult {
  const entries = Object.entries(session.answers);
  const correctCount = entries.filter(([, a]) => a.correct).length;
  const wrongQuizIds = entries.filter(([, a]) => !a.correct).map(([id]) => id);
  const score = Math.round((correctCount / session.quizzes.length) * 100);

  return {
    chapterId: session.chapterId,
    totalQuestions: session.quizzes.length,
    correctCount,
    score,
    wrongQuizIds,
    timestamp: Date.now(),
  };
}
