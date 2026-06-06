// =============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// =============================================================
import {
  ok, err, mapResult,
  validatePageResponse,
  withRetry,
  fetchAllPages,
  renderApiError,
  type Result,
  type ApiError,
  type PageResponse,
  type FetchReport,
} from "./challenge";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS: ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

// ── Helpers ───────────────────────────────────────────────────
const isString = (u: unknown): u is string => typeof u === "string";
const isNumber = (u: unknown): u is number => typeof u === "number";

function unwrapOk<T, E>(r: Result<T, E>): T {
  if (r.tag === "ok") return r.value;
  throw new Error("Expected Ok but got Err");
}
function unwrapErr<T, E>(r: Result<T, E>): E {
  if (r.tag === "err") return r.error;
  throw new Error("Expected Err but got Ok");
}

// ── Suite 1: Result monad ─────────────────────────────────────
console.log("\n── Suite 1: Result monad ──");

const r1 = ok(42);
assert(r1.tag === "ok" && r1.value === 42, "ok() constructs Ok<number>");

const r2 = err({ kind: "NetworkError" as const, message: "timeout" });
assert(r2.tag === "err" && r2.error.kind === "NetworkError", "err() constructs Err<NetworkError>");

const r3 = mapResult(ok(10), (n) => n * 2);
assert(r3.tag === "ok" && (r3 as { tag: "ok"; value: number }).value === 20, "mapResult transforms Ok value");

const r4 = mapResult(err({ kind: "NetworkError" as const, message: "x" }), (n: number) => n + 1);
assert(r4.tag === "err", "mapResult passes through Err unchanged");

// ── Suite 2: validatePageResponse ────────────────────────────
console.log("\n── Suite 2: validatePageResponse ──");

const validRaw = { page: 1, totalPages: 3, items: ["alpha", "beta"] };
const v1 = validatePageResponse(validRaw, isString);
assert(v1.tag === "ok", "validatePageResponse accepts a valid raw page of strings");
assert(unwrapOk(v1).items.length === 2, "validatePageResponse preserves items");

const badItems = { page: 2, totalPages: 3, items: ["ok", 99] };
const v2 = validatePageResponse(badItems, isString);
assert(v2.tag === "err" && unwrapErr(v2).kind === "ParseError", "validatePageResponse rejects items failing itemGuard");

const notObject = "not an object";
const v3 = validatePageResponse(notObject, isNumber);
assert(v3.tag === "err" && unwrapErr(v3).kind === "ParseError", "validatePageResponse rejects non-object raw");

// ── Suite 3: withRetry ────────────────────────────────────────
console.log("\n── Suite 3: withRetry ──");

async function suiteRetry(): Promise<void> {
  // Succeeds on the 3rd attempt
  let calls = 0;
  const op = (): Promise<Result<string, ApiError>> => {
    calls++;
    if (calls < 3) return Promise.resolve(err({ kind: "NetworkError" as const, message: "flaky" }));
    return Promise.resolve(ok("success"));
  };

  const result = await withRetry(op, { maxAttempts: 5, baseDelayMs: 10 });
  assert(result.tag === "ok" && (result as { tag: "ok"; value: string }).value === "success", "withRetry succeeds on 3rd attempt");
  assert(calls === 3, "withRetry called operation exactly 3 times");

  // Exhausts all attempts
  let calls2 = 0;
  const alwaysFail = (): Promise<Result<string, ApiError>> => {
    calls2++;
    return Promise.resolve(err({ kind: "NetworkError" as const, message: "dead" }));
  };
  const exhausted = await withRetry(alwaysFail, { maxAttempts: 3, baseDelayMs: 5 });
  assert(exhausted.tag === "err" && unwrapErr(exhausted).kind === "ExhaustedError", "withRetry returns ExhaustedError after maxAttempts");
}

// ── Suite 4: fetchAllPages ────────────────────────────────────
console.log("\n── Suite 4: fetchAllPages ──");

async function suiteFetchAll(): Promise<void> {
  // 4 pages, page 3 always fails validation
  const pages: Record<number, unknown> = {
    1: { page: 1, totalPages: 4, items: [1, 2] },
    2: { page: 2, totalPages: 4, items: [3, 4] },
    3: { page: 3, totalPages: 4, items: ["bad", "items"] }, // fails isNumber guard
    4: { page: 4, totalPages: 4, items: [5, 6] },
  };

  const report: FetchReport<number> = await fetchAllPages<number>({
    totalPages: 4,
    concurrency: 2,
    retry: { maxAttempts: 1, baseDelayMs: 0 },
    fetchPage: (p) => Promise.resolve(pages[p]),
    itemGuard: isNumber,
  });

  assert(report.fetchedPages === 3, "fetchAllPages: 3 pages succeed");
  assert(report.failedPages === 1, "fetchAllPages: 1 page fails");
  assert(report.items.length === 6, "fetchAllPages: 6 items from successful pages");
  assert(
    JSON.stringify(report.items) === JSON.stringify([1, 2, 3, 4, 5, 6]),
    "fetchAllPages: items are in ascending page order"
  );
  assert(report.errors.length === 1 && report.errors[0].page === 3, "fetchAllPages: error recorded for page 3");
}

// ── Suite 5: renderApiError ───────────────────────────────────
console.log("\n── Suite 5: renderApiError ──");

assert(
  renderApiError({ kind: "NetworkError", message: "timeout" }).includes("timeout"),
  "renderApiError includes message for NetworkError"
);
assert(
  renderApiError({ kind: "ParseError", message: "bad shape", raw: null }).includes("bad shape"),
  "renderApiError includes message for ParseError"
);
assert(
  renderApiError({ kind: "ExhaustedError", attempts: 5, lastMessage: "dead" }).includes("5"),
  "renderApiError includes attempt count for ExhaustedError"
);

// ── Run async suites ──────────────────────────────────────────
(async () => {
  await suiteRetry();
  await suiteFetchAll();
  console.log(`\n${"─".repeat(45)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
})();
