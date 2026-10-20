// challenge.test.ts
import {
  fetchAllPages,
  exhaustiveFetchError,
  makeCursor,
  type Page,
  type FetchError,
  type AccumulatedResult,
  type Result,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

interface User {
  id: number;
  name: string;
}

const ALL_USERS: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
}));

// Simulates a remote API: returns a page of users from ALL_USERS
function makeUserFetcher(delayMs = 0) {
  return async (
    cursor: ReturnType<typeof makeCursor> | null,
    pageSize: number
  ): Promise<Page<User>> => {
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));

    const startIndex = cursor === null ? 0 : parseInt(cursor, 10);
    if (isNaN(startIndex)) {
      const err: FetchError = {
        kind: "CursorError",
        message: "unparseable cursor",
        invalidCursor: cursor ?? "",
      };
      throw err;
    }

    const items = ALL_USERS.slice(startIndex, startIndex + pageSize);
    const nextIndex = startIndex + pageSize;
    const nextCursor =
      nextIndex < ALL_USERS.length ? makeCursor(String(nextIndex)) : null;

    return {
      items,
      nextCursor,
      totalCount: ALL_USERS.length,
    };
  };
}

// -----------------------------------------------------------
// TEST 1 — fetchAllPages returns all 25 users across pages
// -----------------------------------------------------------
async function test1() {
  const result = await fetchAllPages<User>({
    fetcher: makeUserFetcher(),
    pageSize: 10,
    concurrencyLimit: 2,
    timeoutMs: 5000,
  });

  console.assert(result.ok === true, "TEST 1a FAILED: result should be ok");
  if (!result.ok) return;

  console.assert(
    result.value.items.length === 25,
    `TEST 1b FAILED: expected 25 items, got ${result.value.items.length}`
  );
  console.assert(
    result.value.totalCount === 25,
    `TEST 1c FAILED: expected totalCount 25, got ${result.value.totalCount}`
  );
  // 25 items / 10 per page = 3 pages
  console.assert(
    result.value.pagesFetched === 3,
    `TEST 1d FAILED: expected 3 pages, got ${result.value.pagesFetched}`
  );

  // Items must be in order (page-index order preserved)
  const ids = result.value.items.map((u) => u.id);
  const sorted = [...ids].sort((a, b) => a - b);
  console.assert(
    JSON.stringify(ids) === JSON.stringify(sorted),
    "TEST 1e FAILED: items not in page-index order"
  );

  console.log("TEST 1 PASSED ✅");
}

// -----------------------------------------------------------
// TEST 2 — onPageFetched callback is called once per page
// -----------------------------------------------------------
async function test2() {
  const calls: number[] = [];

  const result = await fetchAllPages<User>({
    fetcher: makeUserFetcher(),
    pageSize: 10,
    concurrencyLimit: 3,
    timeoutMs: 5000,
    onPageFetched: (pageIndex) => calls.push(pageIndex),
  });

  console.assert(result.ok === true, "TEST 2a FAILED: result should be ok");
  console.assert(
    calls.length === 3,
    `TEST 2b FAILED: expected 3 callback calls, got ${calls.length}`
  );
  console.log("TEST 2 PASSED ✅");
}

// -----------------------------------------------------------
// TEST 3 — timeout produces a TimeoutError result
// -----------------------------------------------------------
async function test3() {
  // Fetcher sleeps 200 ms per page; timeout is only 50 ms
  const result = await fetchAllPages<User>({
    fetcher: makeUserFetcher(200),
    pageSize: 10,
    concurrencyLimit: 1,
    timeoutMs: 50,
  });

  console.assert(result.ok === false, "TEST 3a FAILED: result should not be ok");
  if (result.ok) return;

  console.assert(
    result.error.kind === "TimeoutError",
    `TEST 3b FAILED: expected TimeoutError, got ${result.error.kind}`
  );
  console.log("TEST 3 PASSED ✅");
}

// -----------------------------------------------------------
// TEST 4 — exhaustiveFetchError formats all four variants
// -----------------------------------------------------------
function test4() {
  const ne: FetchError = { kind: "NetworkError", message: "gone", statusCode: 410 };
  const pe: FetchError = { kind: "ParseError", message: "bad json", page: 2 };
  const ce: FetchError = { kind: "CursorError", message: "stale", invalidCursor: "abc" };
  const te: FetchError = { kind: "TimeoutError", message: "too slow", afterMs: 3000 };

  console.assert(
    exhaustiveFetchError(ne) === "[Network]  HTTP 410 — gone",
    `TEST 4a FAILED: got "${exhaustiveFetchError(ne)}"`
  );
  console.assert(
    exhaustiveFetchError(pe) === "[Parse]    Page 2 — bad json",
    `TEST 4b FAILED: got "${exhaustiveFetchError(pe)}"`
  );
  console.assert(
    exhaustiveFetchError(ce) === "[Cursor]   Bad cursor 'abc' — stale",
    `TEST 4c FAILED: got "${exhaustiveFetchError(ce)}"`
  );
  console.assert(
    exhaustiveFetchError(te) === "[Timeout]  After 3000ms — too slow",
    `TEST 4d FAILED: got "${exhaustiveFetchError(te)}"`
  );

  console.log("TEST 4 PASSED ✅");
}

// -----------------------------------------------------------
// TEST 5 — single page dataset (no pagination needed)
// -----------------------------------------------------------
async function test5() {
  const result = await fetchAllPages<User>({
    fetcher: makeUserFetcher(),
    pageSize: 100, // larger than dataset — only 1 page
    concurrencyLimit: 5,
    timeoutMs: 5000,
  });

  console.assert(result.ok === true, "TEST 5a FAILED: result should be ok");
  if (!result.ok) return;

  console.assert(
    result.value.pagesFetched === 1,
    `TEST 5b FAILED: expected 1 page, got ${result.value.pagesFetched}`
  );
  console.assert(
    result.value.items.length === 25,
    `TEST 5c FAILED: expected 25 items, got ${result.value.items.length}`
  );

  console.log("TEST 5 PASSED ✅");
}

// -----------------------------------------------------------
// Run all tests
// -----------------------------------------------------------
(async () => {
  await test1();
  await test2();
  await test3();
  test4();
  await test5();
})();
