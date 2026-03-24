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
  return {
    chapterId,
    quizzes: shuffleQuizzes(quizzes),
    currentIndex: 0,
    answers: {},
    startTime: Date.now(),
  };
}

export function checkAnswer(quiz: Quiz, userAnswer: string | number | boolean): boolean {
  switch (quiz.type) {
    case "code-prediction":
      return String(userAnswer).trim() === String(quiz.correctAnswer).trim();
    case "fill-in-blank":
      return String(userAnswer).trim().toLowerCase() === quiz.correctAnswer.toLowerCase();
    case "multiple-choice":
      return Number(userAnswer) === quiz.correctIndex;
    case "true-false":
      return Boolean(userAnswer) === quiz.correctAnswer;
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
