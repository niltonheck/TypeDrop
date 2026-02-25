// challenge.test.ts
import {
  compose,
  composeAsync,
  runPipeline,
  withAuth,
  type Middleware,
  type AsyncMiddleware,
  type RequestContext,
  type AuthedContext,
  type PipelineResult,
  type Awaited_,
  type PipelineOutput,
} from "./challenge";

// ── Compile-time type checks ─────────────────────────────────

// Awaited_ should unwrap promises
type _T1 = Awaited_<Promise<number>>; // → number
type _T2 = Awaited_<string>;          // → string

// PipelineOutput should return the last middleware's output
type MW1 = Middleware<{ a: number }, { a: number; b: string }>;
type MW2 = Middleware<{ a: number; b: string }, { a: number; b: string; c: boolean }>;
type _T3 = PipelineOutput<[MW1, MW2]>; // → { a: number; b: string; c: boolean }
type _T4 = PipelineOutput<[]>;         // → never

// ── Mock data ────────────────────────────────────────────────

const addB: Middleware<{ a: number }, { a: number; b: string }> = (ctx) => ({
  ...ctx,
  b: `value-${ctx.a}`,
});

const addC: Middleware<{ a: number; b: string }, { a: number; b: string; c: boolean }> = (ctx) => ({
  ...ctx,
  c: ctx.a > 0,
});

const double: Middleware<number, number> = (n) => n * 2;
const toString: Middleware<number, string> = (n) => `result:${n}`;

const throwingMiddleware: Middleware<unknown, unknown> = () => {
  throw new Error("boom");
};

const baseRequest: RequestContext = {
  path: "/api/data",
  method: "GET",
  headers: { "x-user-id": "user-42" },
  body: null,
};

const unauthRequest: RequestContext = {
  path: "/api/data",
  method: "GET",
  headers: {},
  body: null,
};

// ── Tests ────────────────────────────────────────────────────

// Test 1: compose chains two middlewares correctly
const addBThenC = compose(addB, addC);
const result1 = addBThenC({ a: 5 });
console.assert(result1.b === "value-5", `Test 1a failed: expected b="value-5", got "${result1.b}"`);
console.assert(result1.c === true,      `Test 1b failed: expected c=true, got ${String(result1.c)}`);
console.log("Test 1 passed: compose chains types correctly");

// Test 2: compose with number → number → string
const doubleThenString = compose(double, toString);
const result2 = doubleThenString(7);
console.assert(result2 === "result:14", `Test 2 failed: expected "result:14", got "${result2}"`);
console.log("Test 2 passed: compose number→number→string");

// Test 3: composeAsync chains two async middlewares
const asyncDouble: AsyncMiddleware<number, number> = async (n) => n * 3;
const asyncToString: AsyncMiddleware<number, string> = async (n) => `async:${n}`;
const asyncPipeline = composeAsync(asyncDouble, asyncToString);

asyncPipeline(4).then((result3) => {
  console.assert(result3 === "async:12", `Test 3 failed: expected "async:12", got "${result3}"`);
  console.log("Test 3 passed: composeAsync chains correctly");
});

// Test 4: runPipeline — success path
const pipelineResult = runPipeline(
  10 as unknown,
  [double as Middleware<unknown, unknown>, toString as Middleware<unknown, unknown>]
);
console.assert(pipelineResult.ok === true, "Test 4a failed: expected ok=true");
if (pipelineResult.ok) {
  console.assert(pipelineResult.value === "result:20", `Test 4b failed: expected "result:20", got "${String(pipelineResult.value)}"`);
}
console.log("Test 4 passed: runPipeline success path");

// Test 5: runPipeline — error path
const errorResult = runPipeline(
  "anything" as unknown,
  [throwingMiddleware]
);
console.assert(errorResult.ok === false, "Test 5a failed: expected ok=false");
if (!errorResult.ok) {
  console.assert(errorResult.step === 0,        `Test 5b failed: expected step=0, got ${errorResult.step}`);
  console.assert(errorResult.error === "boom",   `Test 5c failed: expected error="boom", got "${errorResult.error}"`);
}
console.log("Test 5 passed: runPipeline error path");

// Test 6: withAuth — valid header
const authedCtx: AuthedContext = withAuth(baseRequest);
console.assert(authedCtx.userId === "user-42", `Test 6a failed: expected userId="user-42", got "${authedCtx.userId}"`);
console.log("Test 6 passed: withAuth extracts userId");

// Test 7: withAuth — missing header throws
let threw = false;
try {
  withAuth(unauthRequest);
} catch {
  threw = true;
}
console.assert(threw, "Test 7 failed: withAuth should throw when x-user-id is missing");
console.log("Test 7 passed: withAuth throws on missing header");
