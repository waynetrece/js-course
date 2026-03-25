export interface ExecutionResult {
  logs: string[];
  error: string | null;
  returnValue?: string;
}

export interface TestCase {
  mode: "output" | "return";
  functionName?: string;
  input?: unknown[];
  expected: string;
  description: string;
}

export interface TestResult {
  description: string;
  passed: boolean;
  expected: string;
  actual: string;
}

const TIMEOUT_MS = 3000;

function createWorkerCode(): string {
  return `
    self.onmessage = function(e) {
      const { code, mode, functionName, input } = e.data;
      const logs = [];
      const originalLog = console.log;
      console.log = function(...args) {
        logs.push(args.map(a => {
          if (a === undefined) return 'undefined';
          if (a === null) return 'null';
          if (typeof a === 'object') return JSON.stringify(a);
          return String(a);
        }).join(' '));
      };

      try {
        const result = new Function(code)();
        if (mode === 'return' && functionName) {
          const fn = new Function(code + '; return ' + functionName)();
          if (typeof fn === 'function') {
            const returnVal = fn(...(input || []));
            const returnStr = returnVal === undefined ? 'undefined'
              : returnVal === null ? 'null'
              : typeof returnVal === 'object' ? JSON.stringify(returnVal)
              : String(returnVal);
            self.postMessage({ logs, error: null, returnValue: returnStr });
          } else {
            self.postMessage({ logs, error: functionName + ' is not a function', returnValue: undefined });
          }
        } else {
          self.postMessage({ logs, error: null });
        }
      } catch (err) {
        self.postMessage({ logs, error: err.message || String(err) });
      }
    };
  `;
}

export function executeCode(code: string): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const blob = new Blob([createWorkerCode()], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ logs: [], error: "執行超時（超過 3 秒），可能有無窮迴圈" });
    }, TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<ExecutionResult>) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ logs: [], error: e.message || "Unknown error" });
    };

    worker.postMessage({ code, mode: "output" });
  });
}

export function executeWithReturn(
  code: string,
  functionName: string,
  input: unknown[] = []
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const blob = new Blob([createWorkerCode()], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ logs: [], error: "執行超時（超過 3 秒），可能有無窮迴圈" });
    }, TIMEOUT_MS);

    worker.onmessage = (e: MessageEvent<ExecutionResult>) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ logs: [], error: e.message || "Unknown error" });
    };

    worker.postMessage({ code, mode: "return", functionName, input });
  });
}

export async function runTestCases(
  code: string,
  testCases: TestCase[]
): Promise<TestResult[]> {
  const results: TestResult[] = [];

  for (const tc of testCases) {
    if (tc.mode === "output") {
      const exec = await executeCode(code);
      if (exec.error) {
        results.push({
          description: tc.description,
          passed: false,
          expected: tc.expected,
          actual: `Error: ${exec.error}`,
        });
      } else {
        const actual = exec.logs.join("\n");
        results.push({
          description: tc.description,
          passed: actual.trim() === tc.expected.trim(),
          expected: tc.expected,
          actual,
        });
      }
    } else {
      const exec = await executeWithReturn(
        code,
        tc.functionName!,
        tc.input || []
      );
      if (exec.error) {
        results.push({
          description: tc.description,
          passed: false,
          expected: tc.expected,
          actual: `Error: ${exec.error}`,
        });
      } else {
        const actual = exec.returnValue ?? "undefined";
        results.push({
          description: tc.description,
          passed: actual.trim() === tc.expected.trim(),
          expected: tc.expected,
          actual,
        });
      }
    }
  }

  return results;
}
