// ============================================================
// challenge.test.ts — Paginated API Client test harness
// ============================================================
import {
  ok, err,
  fetchAllPages, mapFetchResult, matchResult,
  type Page, type FetchError, type User, type UserSummary,
  type Result, type FetchAllResult,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data — three pages of users
// ------------------------------------------------------------------
const PAGE_1: Page<User> = {
  items: [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob",   role: "viewer" },
  ],
  nextCursor: "cursor-page-2",
  totalCount: 5,
};

const PAGE_2: Page<User> = {
  items: [
    { id: 3, name: "Carol", role: "editor" },
    { id: 4, name: "Dave",  role: "viewer" },
  ],
  nextCursor: "cursor-page-3",
  totalCount: 5,
};

const PAGE_3: Page<User> = {
  items: [
    { id: 5, name: "Eve", role: "admin" },
  ],
  nextCursor: null,
  totalCount: 5,
};

// ------------------------------------------------------------------
// Mock fetchers
// ------------------------------------------------------------------

/** Happy-path fetcher: returns three pages in order */
function makeHappyFetcher() {
  const pages = [PAGE_1, PAGE_2, PAGE_3];
  let call = 0;
  return async (): Promise<Result<Page<User>, FetchError>> => {
    const page = pages[call++];
    if (!page) return err<FetchError>({ kind: "network", message: "No more pages" });
    return ok(page);
  };
}

/** Failing fetcher: first page succeeds, second returns a ParseError */
function makeFailingFetcher() {
  let call = 0;
  return async (): Promise<Result<Page<User>, FetchError>> => {
    if (call++ === 0) return ok(PAGE_1);
    return err<FetchError>({ kind: "parse", message: "Unexpected token", page: 2 });
  };
}

/** Single-page fetcher: one page with no next cursor */
function makeSinglePageFetcher() {
  return async (): Promise<Result<Page<User>, FetchError>> => ok(PAGE_3);
}

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------

async function runTests() {
  // ── Test 1: happy path accumulates all items ──────────────────
  {
    const result = await fetchAllPages(makeHappyFetcher(), 2);
    console.assert(result.status === "ok", "Test 1a: result should be ok");
    if (result.status === "ok") {
      console.assert(result.value.items.length === 5,       "Test 1b: should have 5 items total");
      console.assert(result.value.pagesFetched === 3,       "Test 1c: should have fetched 3 pages");
      console.assert(result.value.reportedTotal === 5,      "Test 1d: reportedTotal from first page");
      console.assert(result.value.items[0].name === "Alice","Test 1e: first item should be Alice");
      console.assert(result.value.items[4].name === "Eve",  "Test 1f: last item should be Eve");
    }
  }

  // ── Test 2: error on page 2 stops fetching and surfaces Err ──
  {
    const result = await fetchAllPages(makeFailingFetcher(), 2);
    console.assert(result.status === "err", "Test 2a: result should be err");
    if (result.status === "err") {
      console.assert(result.error.kind === "parse",         "Test 2b: error kind should be parse");
      if (result.error.kind === "parse") {
        console.assert(result.error.page === 2,             "Test 2c: parse error page should be 2");
      }
    }
  }

  // ── Test 3: single-page result ────────────────────────────────
  {
    const result = await fetchAllPages(makeSinglePageFetcher(), 10);
    console.assert(result.status === "ok",                  "Test 3a: single-page result should be ok");
    if (result.status === "ok") {
      console.assert(result.value.pagesFetched === 1,       "Test 3b: should report 1 page fetched");
      console.assert(result.value.items.length === 1,       "Test 3c: should have 1 item");
    }
  }

  // ── Test 4: mapFetchResult transforms items ───────────────────
  {
    const result = await fetchAllPages(makeHappyFetcher(), 2);
    const mapped = mapFetchResult<User, UserSummary, FetchError>(
      result,
      (u) => ({ id: u.id, name: u.name })
    );
    console.assert(mapped.status === "ok",                  "Test 4a: mapped result should be ok");
    if (mapped.status === "ok") {
      const first = mapped.value.items[0];
      console.assert(first.id === 1 && first.name === "Alice", "Test 4b: first mapped item correct");
      // `role` must NOT exist on UserSummary — enforced at compile time
      console.assert(mapped.value.pagesFetched === 3,       "Test 4c: pagesFetched preserved");
    }
  }

  // ── Test 5: mapFetchResult passes Err through unchanged ───────
  {
    const errResult = err<FetchError>({ kind: "auth", statusCode: 401 });
    const mapped = mapFetchResult<User, UserSummary, FetchError>(errResult as Result<FetchAllResult<User>, FetchError>, (u) => ({ id: u.id, name: u.name }));
    console.assert(mapped.status === "err",                 "Test 5a: mapped err should stay err");
    if (mapped.status === "err") {
      console.assert(mapped.error.kind === "auth",          "Test 5b: error kind preserved");
    }
  }

  // ── Test 6: matchResult dispatches correctly ──────────────────
  {
    const okResult: Result<number, string> = ok(42);
    const errResult: Result<number, string> = err("oops");

    const okMsg = matchResult(okResult, (v) => `value:${v}`, (e) => `error:${e}`);
    const errMsg = matchResult(errResult, (v) => `value:${v}`, (e) => `error:${e}`);

    console.assert(okMsg  === "value:42",  "Test 6a: matchResult ok branch");
    console.assert(errMsg === "error:oops","Test 6b: matchResult err branch");
  }

  console.log("All tests complete — check for failed assertions above.");
}

runTests().catch(console.error);
