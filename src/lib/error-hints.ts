import { TestResult } from "./code-executor";

interface ErrorPattern {
  test: (results: TestResult[]) => boolean;
  message: string;
}

const ERROR_PATTERNS: ErrorPattern[] = [
  {
    test: (results) =>
      results.some(
        (r) => !r.passed && r.actual === "undefined" && !r.actual.startsWith("Error:")
      ),
    message: "函式回傳 undefined，可能忘了 return 或 console.log",
  },
  {
    test: (results) =>
      results.some((r) => !r.passed && r.actual.includes("TypeError")),
    message: "TypeError：可能對 const 重新賦值，或對非函式的值呼叫了 ()",
  },
  {
    test: (results) =>
      results.some((r) => !r.passed && r.actual.includes("ReferenceError")),
    message: "ReferenceError：變數尚未宣告，檢查拼字或是否在正確的作用域",
  },
  {
    test: (results) =>
      results.some((r) => !r.passed && r.actual.includes("SyntaxError")),
    message: "SyntaxError：語法錯誤，檢查括號、引號、逗號是否配對",
  },
  {
    test: (results) =>
      results.some((r) => !r.passed && r.actual.includes("執行超時")),
    message: "執行超時，可能有無窮迴圈，檢查 while/for 的終止條件",
  },
  {
    test: (results) =>
      results.some(
        (r) => !r.passed && r.actual === "" && r.expected !== ""
      ),
    message: "沒有任何輸出，可能忘了 console.log",
  },
];

export function detectGeneralError(results: TestResult[]): string | null {
  for (const pattern of ERROR_PATTERNS) {
    if (pattern.test(results)) {
      return pattern.message;
    }
  }
  return null;
}
