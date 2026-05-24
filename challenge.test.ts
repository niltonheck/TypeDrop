// ============================================================
// challenge.test.ts
// ============================================================
import {
  makeCursor,
  makePageSize,
  validatePage,
  aggregateEvents,
  fetchAllPages,
  runIngestion,
  type Cursor,
  type PageSize,
  type ActivityEvent,
  type ClientConfig,
  type FetchError,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ── Mock data ────────────────────────────────────────────────

const RAW_PAGE_1 = {
  items: [
    { id: "e1", userId: "u1", kind: "click",    durationMs: 100, revenueUsd: 0,   timestamp: "2026-05-24T00:00:00Z" },
    { id: "e2", userId: "u2", kind: "purchase", durationMs: 200, revenueUsd: 49.99, timestamp: "2026-05-24T00:01:00Z" },
    { id: "e3", userId: "u1", kind: "view",     durationMs: 300, revenueUsd: 0,   timestamp: "2026-05-24T00:02:00Z" },
  ],
  nextCursor: "cursor_page2",
  totalCount: 5,
};

const RAW_PAGE_2 = {
  items: [
    { id: "e4", userId: "u3", kind: "share",    durationMs: 50,  revenueUsd: 0,   timestamp: "2026-05-24T00:03:00Z" },
    { id: "e5", userId: "u2", kind: "purchase", durationMs: 400, revenueUsd: 99.99, timestamp: "2026-05-24T00:04:00Z" },
  ],
  nextCursor: null,
  totalCount: 5,
};

const INVALID_PAGE = {
  items: [
    { id: "", userId: "u1", kind: "click", durationMs: 100, revenueUsd: 0, timestamp: "2026-05-24T00:00:00Z" },
  ],
  nextCursor: null,
  totalCount: 1,
};

// ── TEST 1: Branded constructors ──────────────────────────────

const cursorOk = makeCursor("cursor_page2");
assert(cursorOk.ok === true, "makeCursor accepts a valid non-empty cursor string");

const cursorBad = makeCursor("");
assert(cursorBad.ok === false && cursorBad.error === "InvalidCursor", "makeCursor rejects empty string");

const pageSizeOk = makePageSize(50);
assert(pageSizeOk.ok === true, "makePageSize accepts 50");

const pageSizeBad = makePageSize(0);
assert(pageSizeBad.ok === false && pageSizeBad.error === "InvalidPageSize", "makePageSize rejects 0");

const pageSizeFrac = makePageSize(10.5);
assert(pageSizeFrac.ok === false && pageSizeFrac.error === "InvalidPageSize", "makePageSize rejects 10.5");

// ── TEST 2: validatePage ──────────────────────────────────────

const page1Result = validatePage(RAW_PAGE_1);
assert(page1Result.ok === true, "validatePage accepts a well-formed page");
if (page1Result.ok) {
  assert(page1Result.value.items.length === 3, "validatePage: page 1 has 3 items");
  assert(page1Result.value.nextCursor === "cursor_page2", "validatePage: nextCursor is preserved");
}

const invalidResult = validatePage(INVALID_PAGE);
assert(invalidResult.ok === false && invalidResult.error === "InvalidPage",
  "validatePage rejects event with empty id");

const garbageResult = validatePage("not an object");
assert(garbageResult.ok === false && garbageResult.error === "InvalidPage",
  "validatePage rejects non-object input");

// ── TEST 3: aggregateEvents ───────────────────────────────────

// Combine both pages into a flat event array for aggregation testing
const allEvents: ActivityEvent[] = [
  { id: "e1", userId: "u1", kind: "click",    durationMs: 100, revenueUsd: 0,     timestamp: "2026-05-24T00:00:00Z" },
  { id: "e2", userId: "u2", kind: "purchase", durationMs: 200, revenueUsd: 49.99, timestamp: "2026-05-24T00:01:00Z" },
  { id: "e3", userId: "u1", kind: "view",     durationMs: 300, revenueUsd: 0,     timestamp: "2026-05-24T00:02:00Z" },
  { id: "e4", userId: "u3", kind: "share",    durationMs: 50,  revenueUsd: 0,     timestamp: "2026-05-24T00:03:00Z" },
  { id: "e5", userId: "u2", kind: "purchase", durationMs: 400, revenueUsd: 99.99, timestamp: "2026-05-24T00:04:00Z" },
];

const report = aggregateEvents(allEvents);
assert(report.totalEvents === 5, "aggregateEvents: totalEvents = 5");
assert(report.uniqueUsers === 3, "aggregateEvents: uniqueUsers = 3 (u1, u2, u3)");
assert(report.kindStats.purchase.count === 2, "aggregateEvents: purchase count = 2");
assert(
  Math.abs(report.kindStats.purchase.totalRevenueUsd - 149.98) < 0.001,
  "aggregateEvents: purchase totalRevenueUsd ≈ 149.98"
);
assert(
  Math.abs(report.avgDurationMs - (100 + 200 + 300 + 50 + 400) / 5) < 0.001,
  "aggregateEvents: avgDurationMs = 210"
);
assert(report.topRevenueUserId === "u2", "aggregateEvents: topRevenueUserId = u2");
assert(report.kindStats.share.count === 1, "aggregateEvents: share count = 1");
// All four kinds must exist even if count=0
assert(report.kindStats.view.count === 1 && report.kindStats.click.count === 1,
  "aggregateEvents: view and click counts correct");

// ── TEST 4: fetchAllPages + runIngestion ──────────────────────

// Mock fetcher: serves page 1 then page 2 based on cursor
const mockFetcher = async (cursor: Cursor | null, _ps: PageSize): Promise<unknown> => {
  if (cursor === null) return RAW_PAGE_1;
  if (cursor === "cursor_page2") return RAW_PAGE_2;
  return { items: [], nextCursor: null, totalCount: 5 };
};

const config: ClientConfig = { concurrency: 2, pageSize: 3, maxPages: 10 };

const ingestionResult = await runIngestion(mockFetcher, config);
assert(ingestionResult.ok === true, "runIngestion: succeeds with valid fetcher and config");
if (ingestionResult.ok) {
  assert(ingestionResult.value.totalEvents === 5, "runIngestion: report has 5 total events");
  assert(ingestionResult.value.topRevenueUserId === "u2", "runIngestion: topRevenueUserId = u2");
}

// Bad page size should short-circuit
const badConfig: ClientConfig = { concurrency: 1, pageSize: 0, maxPages: 10 };
const badResult = await runIngestion(mockFetcher, badConfig);
assert(badResult.ok === false && badResult.error === "InvalidPageSize",
  "runIngestion: returns InvalidPageSize for pageSize=0");

// Fetcher that returns invalid data should produce FetchFailed
const badFetcher = async (_c: Cursor | null, _ps: PageSize): Promise<unknown> => ({
  items: [{ id: "", userId: "u1", kind: "click", durationMs: 0, revenueUsd: 0, timestamp: "t" }],
  nextCursor: null,
  totalCount: 1,
});
const fetchFailResult = await runIngestion(badFetcher, config);
assert(fetchFailResult.ok === false && fetchFailResult.error === "FetchFailed",
  "runIngestion: returns FetchFailed when a page fails validation");

console.log("\nAll tests complete.");
