// challenge.test.ts
import {
  fetchPageWithRetry,
  fetchAllPages,
  aggregateRecords,
  makePageCursor,
  ok,
  err,
  type ReportPage,
  type ReportRecord,
  type FetchError,
  type PageFetcher,
  type RetryConfig,
  type PaginatedClientConfig,
} from "./challenge";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assert(condition: boolean, message: string): void {
  console.assert(condition, `❌ FAIL: ${message}`);
  if (condition) console.log(`✅ PASS: ${message}`);
}

const NEVER_ABORT = new AbortController().signal;

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const PAGE_1: ReportPage = {
  records: [
    { id: "r1", region: "NA",   revenue: 1000, sessions: 200, bounceRate: 0.4 },
    { id: "r2", region: "EU",   revenue: 800,  sessions: 150, bounceRate: 0.3 },
    { id: "r3", region: "NA",   revenue: 500,  sessions: 100, bounceRate: 0.5 },
  ],
  nextCursor: makePageCursor("cursor-page-2"),
  totalPages: 2,
};

const PAGE_2: ReportPage = {
  records: [
    { id: "r4", region: "APAC", revenue: 1200, sessions: 300, bounceRate: 0.2 },
    { id: "r5", region: "EU",   revenue: 600,  sessions: 120, bounceRate: 0.35 },
  ],
  nextCursor: null,
  totalPages: 2,
};

// ---------------------------------------------------------------------------
// Test 1: aggregateRecords — basic correctness
// ---------------------------------------------------------------------------
(function testAggregateRecords() {
  const allRecords: readonly ReportRecord[] = [...PAGE_1.records, ...PAGE_2.records];
  const summary = aggregateRecords(allRecords, 2);

  assert(summary.totalRecords === 5, "aggregateRecords: totalRecords = 5");
  assert(summary.totalRevenue === 4100, "aggregateRecords: totalRevenue = 4100");
  assert(summary.pagesConsumed === 2, "aggregateRecords: pagesConsumed = 2");

  const expectedAvg = (0.4 + 0.3 + 0.5 + 0.2 + 0.35) / 5;
  assert(
    Math.abs(summary.avgBounceRate - expectedAvg) < 1e-9,
    `aggregateRecords: avgBounceRate ≈ ${expectedAvg.toFixed(4)}`
  );

  assert("NA" in summary.byRegion, "aggregateRecords: byRegion has NA");
  assert("EU" in summary.byRegion, "aggregateRecords: byRegion has EU");
  assert("APAC" in summary.byRegion, "aggregateRecords: byRegion has APAC");

  assert(
    summary.byRegion["NA"].totalRevenue === 1500,
    "aggregateRecords: NA totalRevenue = 1500"
  );
  assert(
    summary.byRegion["EU"].recordCount === 2,
    "aggregateRecords: EU recordCount = 2"
  );
})();

// ---------------------------------------------------------------------------
// Test 2: fetchPageWithRetry — succeeds on first attempt
// ---------------------------------------------------------------------------
(async function testFetchPageNoRetry() {
  const fetcher: PageFetcher = async (_cursor, _signal) => PAGE_1;
  const config: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 0,
    nonRetryableKinds: ["AbortedError"],
  };

  const result = await fetchPageWithRetry(null, fetcher, config, NEVER_ABORT);
  assert(result.ok === true, "fetchPageWithRetry: resolves ok on first attempt");
  if (result.ok) {
    assert(result.value.records.length === 3, "fetchPageWithRetry: correct page returned");
  }
})();

// ---------------------------------------------------------------------------
// Test 3: fetchPageWithRetry — retries transient errors, then succeeds
// ---------------------------------------------------------------------------
(async function testFetchPageRetrySuccess() {
  let callCount = 0;
  const networkErr: FetchError = { kind: "NetworkError", message: "socket hang up" };

  const fetcher: PageFetcher = async (_cursor, _signal) => {
    callCount++;
    if (callCount < 3) throw networkErr;
    return PAGE_2;
  };

  const config: RetryConfig = {
    maxAttempts: 3,
    baseDelayMs: 0, // zero delay so tests are fast
    nonRetryableKinds: ["ParseError"],
  };

  const result = await fetchPageWithRetry(null, fetcher, config, NEVER_ABORT);
  assert(result.ok === true, "fetchPageWithRetry: succeeds after 2 failures");
  assert(callCount === 3, "fetchPageWithRetry: fetcher called exactly 3 times");
})();

// ---------------------------------------------------------------------------
// Test 4: fetchPageWithRetry — non-retryable error stops immediately
// ---------------------------------------------------------------------------
(async function testFetchPageNonRetryable() {
  let callCount = 0;
  const parseErr: FetchError = { kind: "ParseError", raw: "{bad json}" };

  const fetcher: PageFetcher = async (_cursor, _signal) => {
    callCount++;
    throw parseErr;
  };

  const config: RetryConfig = {
    maxAttempts: 5,
    baseDelayMs: 0,
    nonRetryableKinds: ["ParseError", "AbortedError"],
  };

  const result = await fetchPageWithRetry(null, fetcher, config, NEVER_ABORT);
  assert(result.ok === false, "fetchPageWithRetry: non-retryable returns error");
  assert(callCount === 1, "fetchPageWithRetry: fetcher called only once for non-retryable");
  if (!result.ok) {
    assert(result.error.kind === "ParseError", "fetchPageWithRetry: error kind is ParseError");
  }
})();

// ---------------------------------------------------------------------------
// Test 5: fetchAllPages — full happy path, two pages
// ---------------------------------------------------------------------------
(async function testFetchAllPages() {
  const pages = [PAGE_1, PAGE_2];
  let pageIndex = 0;

  const fetcher: PageFetcher = async (_cursor, _signal) => {
    return pages[pageIndex++]!;
  };

  const config: PaginatedClientConfig = {
    retry: { maxAttempts: 2, baseDelayMs: 0, nonRetryableKinds: [] },
    maxPages: 10,
  };

  const result = await fetchAllPages(fetcher, config, NEVER_ABORT);
  assert(result.ok === true, "fetchAllPages: happy path returns ok");
  if (result.ok) {
    assert(result.value.totalRecords === 5, "fetchAllPages: totalRecords = 5");
    assert(result.value.pagesConsumed === 2, "fetchAllPages: pagesConsumed = 2");
    assert(result.value.totalRevenue === 4100, "fetchAllPages: totalRevenue = 4100");
  }
})();

// ---------------------------------------------------------------------------
// Test 6: fetchAllPages — respects maxPages limit
// ---------------------------------------------------------------------------
(async function testFetchAllPagesMaxPages() {
  // Only page 1 should be fetched (maxPages = 1)
  const fetcher: PageFetcher = async (_cursor, _signal) => PAGE_1;

  const config: PaginatedClientConfig = {
    retry: { maxAttempts: 1, baseDelayMs: 0, nonRetryableKinds: [] },
    maxPages: 1,
  };

  const result = await fetchAllPages(fetcher, config, NEVER_ABORT);
  assert(result.ok === true, "fetchAllPages: maxPages=1 returns ok");
  if (result.ok) {
    assert(result.value.pagesConsumed === 1, "fetchAllPages: only 1 page consumed when maxPages=1");
    assert(result.value.totalRecords === 3, "fetchAllPages: only page-1 records when maxPages=1");
  }
})();

// ---------------------------------------------------------------------------
// Test 7: fetchAllPages — propagates error on page failure
// ---------------------------------------------------------------------------
(async function testFetchAllPagesError() {
  const networkErr: FetchError = { kind: "NetworkError", message: "timeout" };
  const fetcher: PageFetcher = async (_cursor, _signal) => { throw networkErr; };

  const config: PaginatedClientConfig = {
    retry: { maxAttempts: 1, baseDelayMs: 0, nonRetryableKinds: [] },
    maxPages: 5,
  };

  const result = await fetchAllPages(fetcher, config, NEVER_ABORT);
  assert(result.ok === false, "fetchAllPages: propagates fetch error");
  if (!result.ok) {
    // With maxAttempts=1, MaxRetriesExceeded wraps the NetworkError
    assert(
      result.error.kind === "MaxRetriesExceeded" || result.error.kind === "NetworkError",
      "fetchAllPages: error kind is MaxRetriesExceeded or NetworkError"
    );
  }
})();
