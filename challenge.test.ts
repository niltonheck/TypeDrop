// challenge.test.ts
// Run with: npx ts-node --esm challenge.test.ts  (or tsx challenge.test.ts)
import {
  paginatedFetch,
  collectResults,
  isOk,
  isErr,
  type Page,
  type FetchError,
  type Result,
  type UnwrapPage,
  type PageSummary,
} from "./challenge";

// ── Mock data ──────────────────────────────────────────────

interface User {
  id: number;
  name: string;
}

const pages: Page<User>[] = [
  { items: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],   nextCursor: "page2", totalCount: 5 },
  { items: [{ id: 3, name: "Carol" }, { id: 4, name: "Dave" }],  nextCursor: "page3" },
  { items: [{ id: 5, name: "Eve" }],                              nextCursor: null },
];

function makeFetcher(signal: AbortSignal) {
  const cursorMap: Record<string, number> = { "page2": 1, "page3": 2 };
  return async (cursor: string | null, sig: AbortSignal): Promise<Page<User>> => {
    if (sig.aborted) throw new DOMException("Aborted", "AbortError");
    const idx = cursor === null ? 0 : cursorMap[cursor] ?? 0;
    return pages[idx];
  };
}

// ── Test 1: collectResults yields all items across pages ───

async function test1() {
  const ctrl = new AbortController();
  const gen = paginatedFetch<User>({
    fetcher: makeFetcher(ctrl.signal),
    signal: ctrl.signal,
  });
  const { values, errors } = await collectResults(gen);
  console.assert(values.length === 5, `Test 1a FAILED: expected 5 values, got ${values.length}`);
  console.assert(errors.length === 0, `Test 1b FAILED: expected 0 errors, got ${errors.length}`);
  console.assert(values[0].name === "Alice", `Test 1c FAILED: first item should be Alice`);
  console.assert(values[4].name === "Eve",   `Test 1d FAILED: last item should be Eve`);
  console.log("Test 1 PASSED: all items collected across pages");
}

// ── Test 2: transform is applied to each item ─────────────

async function test2() {
  const ctrl = new AbortController();
  const gen = paginatedFetch<User, string>({
    fetcher: makeFetcher(ctrl.signal),
    signal: ctrl.signal,
    transform: (u) => u.name.toUpperCase(),
  });
  const { values, errors } = await collectResults(gen);
  console.assert(values.length === 5,          `Test 2a FAILED: expected 5 values`);
  console.assert(errors.length === 0,          `Test 2b FAILED: expected 0 errors`);
  console.assert(values[0] === "ALICE",        `Test 2c FAILED: expected ALICE, got ${values[0]}`);
  console.assert(values[4] === "EVE",          `Test 2d FAILED: expected EVE, got ${values[4]}`);
  console.log("Test 2 PASSED: transform applied correctly");
}

// ── Test 3: network error is wrapped in Err ────────────────

async function test3() {
  const ctrl = new AbortController();
  const gen = paginatedFetch<User>({
    fetcher: async () => { throw new Error("Connection refused"); },
    signal: ctrl.signal,
  });
  const { values, errors } = await collectResults(gen);
  console.assert(values.length === 0,              `Test 3a FAILED: expected 0 values`);
  console.assert(errors.length === 1,              `Test 3b FAILED: expected 1 error`);
  console.assert(errors[0].kind === "network",     `Test 3c FAILED: expected network error kind`);
  console.assert((errors[0] as Extract<FetchError, { kind: "network" }>).retryable === true,
    `Test 3d FAILED: network error should be retryable`);
  console.log("Test 3 PASSED: network errors wrapped correctly");
}

// ── Test 4: abort mid-stream yields AbortError ────────────

async function test4() {
  const ctrl = new AbortController();
  let callCount = 0;
  const gen = paginatedFetch<User>({
    fetcher: async (cursor, sig) => {
      callCount++;
      if (callCount === 2) ctrl.abort(); // abort before second page resolves
      if (sig.aborted) throw new DOMException("Aborted", "AbortError");
      return pages[0]; // always return first page so cursor never advances
    },
    signal: ctrl.signal,
  });

  const results: Result<User, FetchError>[] = [];
  for await (const r of gen) results.push(r);

  const errs = results.filter(isErr);
  console.assert(errs.length >= 1,                   `Test 4a FAILED: expected at least one error`);
  console.assert(errs[errs.length - 1].error.kind === "abort",
    `Test 4b FAILED: last error should be abort, got ${errs[errs.length - 1].error.kind}`);
  console.log("Test 4 PASSED: abort mid-stream yields AbortError");
}

// ── Test 5: isOk / isErr type guards narrow correctly ─────

async function test5() {
  const ok: Result<number, FetchError> = { ok: true,  value: 42 };
  const err: Result<number, FetchError> = { ok: false, error: { kind: "parse", message: "bad", raw: "{" } };

  console.assert(isOk(ok)  === true,  "Test 5a FAILED: isOk should return true for Ok");
  console.assert(isErr(ok) === false, "Test 5b FAILED: isErr should return false for Ok");
  console.assert(isOk(err) === false, "Test 5c FAILED: isOk should return false for Err");
  console.assert(isErr(err) === true, "Test 5d FAILED: isErr should return true for Err");

  // Type-narrowing smoke test (compile-time)
  if (isOk(ok)) {
    const v: number = ok.value; // must compile: ok is narrowed to Ok<number>
    console.assert(v === 42, "Test 5e FAILED: narrowed value should be 42");
  }
  if (isErr(err)) {
    const e: FetchError = err.error; // must compile: err is narrowed to Err<FetchError>
    console.assert(e.kind === "parse", "Test 5f FAILED: narrowed error kind should be parse");
  }
  console.log("Test 5 PASSED: type guards narrow correctly");
}

// ── Compile-time type tests ───────────────────────────────

// UnwrapPage smoke test
type _U = UnwrapPage<Page<User>>; // should be User
const _unwrapped: _U = { id: 1, name: "test" }; // must compile
void _unwrapped;

// PageSummary smoke test
type _PS = PageSummary<{ id: number; name: string }>;
const _ps: _PS = {
  id:   { ok: true, value: 42 },
  name: { ok: false, error: { kind: "abort", message: "x" } },
};
void _ps;

// ── Runner ────────────────────────────────────────────────

(async () => {
  await test1();
  await test2();
  await test3();
  await test4();
  await test5();
  console.log("\n✅ All tests completed.");
})();
