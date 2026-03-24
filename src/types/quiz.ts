export type QuizType = "code-prediction" | "fill-in-blank" | "multiple-choice" | "true-false";

export interface BaseQuiz {
  id: string;
  type: QuizType;
  difficulty: 1 | 2 | 3;
  question: string;
  explanation: string;
  conceptId?: string;
}

export interface CodePredictionQuiz extends BaseQuiz {
  type: "code-prediction";
  code: string;
  correctAnswer: string;
}

export interface FillInBlankQuiz extends BaseQuiz {
  type: "fill-in-blank";
  code: string;
  blank: string;
  correctAnswer: string;
}

export interface MultipleChoiceQuiz extends BaseQuiz {
  type: "multiple-choice";
  options: string[];
  correctIndex: number;
}

export interface TrueFalseQuiz extends BaseQuiz {
  type: "true-false";
  statement: string;
  correctAnswer: boolean;
}

export type Quiz = CodePredictionQuiz | FillInBlankQuiz | MultipleChoiceQuiz | TrueFalseQuiz;

export interface QuizSession {
  chapterId: string;
  quizzes: Quiz[];
  currentIndex: number;
  answers: Record<string, { answer: string | number | boolean; correct: boolean }>;
  startTime: number;
}

export interface QuizResult {
  chapterId: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  wrongQuizIds: string[];
  timestamp: number;
}
