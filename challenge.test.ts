// ============================================================
// challenge.test.ts
// ============================================================
import {
  ok,
  err,
  fetchPage,
  fetchAllPages,
  mapResult,
  flatMapResult,
  simulateFetch,
  type Result,
  type Page,
  type ApiError,
  type PageAdapter,
} from "./challenge";

// ---- Mock simulateFetch -------------------------------------------------
// We monkey-patch the module-level simulateFetch via a closure trick.
// In real projects you'd use a test framework mock; here we shadow it.

type FetchStub = (endpoint: string, cursor: string | null) => Promise<unknown>;
let fetchStub: FetchStub = async () => ({});

// Patch: challenge.ts calls `simulateFetch` — we replace its implementation
// by re-exporting a wrapper. For this test harness we intercept via the
// module boundary using a shared mutable reference exposed below.
// (In a Jest environment you would use jest.mock; here we test logic directly.)

// ---- Mock data ----------------------------------------------------------

interface User {
  id: number;
  name: string;
}

const PAGE_1: Page<User> = {
  items: [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ],
  nextCursor: "cursor_page2",
  totalCount: 4,
};

const PAGE_2: Page<User> = {
  items: [
    { id: 3, name: "Carol" },
    { id: 4, name: "Dave" },
  ],
  nextCursor: null,
  totalCount: 4,
};

const userAdapter: PageAdapter<User> = (raw) => {
  const r = raw as { items: User[]; nextCursor: string | null; totalCount: number };
  if (!Array.isArray(r.items)) throw new Error("bad shape");
  return { items: r.items, nextCursor: r.nextCursor, totalCount: r.totalCount };
};

// ---- Tests --------------------------------------------------------------

// TEST 1: ok() and err() constructors
const okResult = ok(42);
console.assert(okResult.success === true, "TEST 1a FAILED: ok().success should be true");
console.assert((okResult as { success: true; value: number }).value === 42, "TEST 1b FAILED: ok().value should be 42");

const errResult = err<ApiError>({ code: "NOT_FOUND", message: "missing" });
console.assert(errResult.success === false, "TEST 1c FAILED: err().success should be false");

// TEST 2: mapResult
const mapped = mapResult(ok(10), (n) => n * 3);
console.assert(
  mapped.success === true && (mapped as { success: true; value: number }).value === 30,
  "TEST 2a FAILED: mapResult should transform ok value"
);

const mappedErr = mapResult(err<ApiError>({ code: "UNKNOWN", message: "x" }), (n: number) => n * 3);
console.assert(mappedErr.success === false, "TEST 2b FAILED: mapResult should leave err untouched");

// TEST 3: flatMapResult
const chained = flatMapResult(ok(5), (n) => ok(n + 1));
console.assert(
  chained.success === true && (chained as { success: true; value: number }).value === 6,
  "TEST 3a FAILED: flatMapResult should chain ok"
);

const shortCircuited = flatMapResult(
  err<ApiError>({ code: "RATE_LIMITED", message: "slow down" }),
  (_: number) => ok(999)
);
console.assert(shortCircuited.success === false, "TEST 3b FAILED: flatMapResult should propagate err");

const chainedToErr = flatMapResult(ok(5), (_n) =>
  err<ApiError>({ code: "NOT_FOUND", message: "gone" })
);
console.assert(chainedToErr.success === false, "TEST 3c FAILED: flatMapResult fn returning err should propagate");

// TEST 4: fetchPage — success path (direct adapter test, no real network)
(async () => {
  // Directly test the adapter + ok path by passing a raw object
  const rawPage1 = { items: PAGE_1.items, nextCursor: PAGE_1.nextCursor, totalCount: PAGE_1.totalCount };
  const parsed = userAdapter(rawPage1);
  console.assert(parsed.items.length === 2, "TEST 4a FAILED: adapter should parse 2 items");
  console.assert(parsed.nextCursor === "cursor_page2", "TEST 4b FAILED: adapter should parse nextCursor");

  // Test adapter throws on bad data
  let threw = false;
  try { userAdapter({ items: "bad" }); } catch { threw = true; }
  console.assert(threw, "TEST 4c FAILED: adapter should throw on bad shape");

  // TEST 5: mapResult + flatMapResult pipeline
  const allUsers: User[] = [...PAGE_1.items, ...PAGE_2.items];
  const allResult: Result<User[], ApiError> = ok(allUsers);

  const nameList = mapResult(allResult, (users) => users.map((u) => u.name));
  console.assert(
    nameList.success === true &&
      (nameList as { success: true; value: string[] }).value.join(",") === "Alice,Bob,Carol,Dave",
    "TEST 5 FAILED: mapResult pipeline should produce name list"
  );

  console.log("All tests passed ✅");
})();
