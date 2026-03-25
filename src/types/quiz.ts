export type QuizType = "code-prediction" | "fill-in-blank" | "multiple-choice" | "true-false" | "coding-challenge";

export interface BaseQuiz {
  id: string;
  type: QuizType;
  difficulty: 1 | 2 | 3;
  question: string;
  explanation: string;
  conceptId?: string;
  isNew?: boolean;
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

export interface TestCase {
  mode: "output" | "return";
  functionName?: string;
  input?: unknown[];
  expected: string;
  description: string;
  failureHint?: string;
}

export interface CodingChallengeQuiz extends BaseQuiz {
  type: "coding-challenge";
  starterCode: string;
  testCases: TestCase[];
  hints?: string[];
}

export type Quiz = CodePredictionQuiz | FillInBlankQuiz | MultipleChoiceQuiz | TrueFalseQuiz | CodingChallengeQuiz;

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
