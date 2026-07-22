// ─── challenge.test.ts ───────────────────────────────────────────────────────
import {
  ok,
  err,
  fetchAllPages,
  pluckField,
  mapFetchPage,
  type FetchPage,
  type Page,
  type Result,
  type AggregatedResult,
} from "./challenge";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  active: boolean;
}

const PAGE_1: Page<User> = {
  items: [
    { id: 1, name: "Alice", active: true },
    { id: 2, name: "Bob", active: false },
  ],
  nextCursor: "cursor-2",
  totalCount: 5,
};

const PAGE_2: Page<User> = {
  items: [
    { id: 3, name: "Carol", active: true },
    { id: 4, name: "Dave", active: true },
  ],
  nextCursor: "cursor-3",
  totalCount: 5,
};

const PAGE_3: Page<User> = {
  items: [{ id: 5, name: "Eve", active: false }],
  nextCursor: null, // last page
  totalCount: 5,
};

// ---------------------------------------------------------------------------
// Helper: build a mock FetchPage from an ordered list of results
// ---------------------------------------------------------------------------
function makeMockFetch<T, E>(
  pages: Array<Result<Page<T>, E>>
): FetchPage<T, E> {
  let call = 0;
  return async (_cursor: string | undefined) => {
    const result = pages[call];
    if (result === undefined) throw new Error("Fetched more pages than expected");
    call++;
    return result;
  };
}

// ---------------------------------------------------------------------------
// TEST 1 — ok / err constructors
// ---------------------------------------------------------------------------
(function testConstructors() {
  const success = ok(42);
  console.assert(success.ok === true, "ok() should set ok:true");
  console.assert(success.value === 42, "ok() should carry the value");

  const failure = err("oops");
  console.assert(failure.ok === false, "err() should set ok:false");
  console.assert(failure.error === "oops", "err() should carry the error");

  console.log("✅ TEST 1 passed — ok / err constructors");
})();

// ---------------------------------------------------------------------------
// TEST 2 — fetchAllPages: happy path (3 pages, no errors)
// ---------------------------------------------------------------------------
(async function testFetchAllHappy() {
  const fetch = makeMockFetch<User, string>([
    ok(PAGE_1),
    ok(PAGE_2),
    ok(PAGE_3),
  ]);

  const result: AggregatedResult<User, string> = await fetchAllPages(fetch);

  console.assert(result.pagesFetched === 3, "Should fetch 3 pages");
  console.assert(result.items.length === 5, "Should collect all 5 items");
  console.assert(result.totalCount === 5, "totalCount from last page");
  console.assert(result.errors.length === 0, "No errors on happy path");
  console.assert(result.items[0].name === "Alice", "First item should be Alice");
  console.assert(result.items[4].name === "Eve", "Last item should be Eve");

  console.log("✅ TEST 2 passed — fetchAllPages happy path");
})();

// ---------------------------------------------------------------------------
// TEST 3 — fetchAllPages: error on second page stops iteration
// ---------------------------------------------------------------------------
(async function testFetchAllError() {
  const fetch = makeMockFetch<User, string>([
    ok(PAGE_1),
    err("Network timeout"),
    // PAGE_3 should never be fetched
    ok(PAGE_3),
  ]);

  const result = await fetchAllPages(fetch);

  console.assert(result.pagesFetched === 1, "Only 1 page should succeed");
  console.assert(result.items.length === 2, "Only items from page 1");
  console.assert(result.errors.length === 1, "One error collected");
  console.assert(result.errors[0] === "Network timeout", "Error message preserved");

  console.log("✅ TEST 3 passed — fetchAllPages stops on error");
})();

// ---------------------------------------------------------------------------
// TEST 4 — pluckField extracts typed values
// ---------------------------------------------------------------------------
(async function testPluckField() {
  const fetch = makeMockFetch<User, string>([ok(PAGE_1), ok(PAGE_3)]);
  const result = await fetchAllPages(fetch);

  const ids: number[] = pluckField(result, "id");
  const names: string[] = pluckField(result, "name");

  console.assert(
    JSON.stringify(ids) === JSON.stringify([1, 2, 5]),
    `ids should be [1,2,5], got ${JSON.stringify(ids)}`
  );
  console.assert(
    JSON.stringify(names) === JSON.stringify(["Alice", "Bob", "Eve"]),
    `names should be ["Alice","Bob","Eve"], got ${JSON.stringify(names)}`
  );

  console.log("✅ TEST 4 passed — pluckField");
})();

// ---------------------------------------------------------------------------
// TEST 5 — mapFetchPage transforms items, preserves errors & metadata
// ---------------------------------------------------------------------------
(async function testMapFetchPage() {
  type UserSummary = { label: string };

  const baseFetch = makeMockFetch<User, string>([
    ok(PAGE_1),
    ok(PAGE_3),
  ]);

  const mappedFetch = mapFetchPage(
    baseFetch,
    (u: User): UserSummary => ({ label: `${u.id}:${u.name}` })
  );

  const result = await fetchAllPages(mappedFetch);

  console.assert(result.items.length === 3, "Should collect 3 mapped items");
  console.assert(
    result.items[0].label === "1:Alice",
    `First mapped item should be "1:Alice", got "${result.items[0].label}"`
  );
  console.assert(result.errors.length === 0, "No errors");

  // Error pass-through
  const errFetch = makeMockFetch<User, string>([err("Bad gateway")]);
  const mappedErrFetch = mapFetchPage(errFetch, (u: User): UserSummary => ({
    label: u.name,
  }));
  const errResult = await fetchAllPages(mappedErrFetch);
  console.assert(errResult.errors[0] === "Bad gateway", "Errors pass through mapFetchPage");

  console.log("✅ TEST 5 passed — mapFetchPage");
})();
