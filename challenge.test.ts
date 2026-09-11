// ============================================================
// challenge.test.ts
// ============================================================
import {
  ok,
  err,
  withRetry,
  fetchAllPages,
  aggregateRecords,
  type Result,
  type Page,
  type ApiError,
  type FetchPage,
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

// ── Mock data ─────────────────────────────────────────────────
type SaleRecord = {
  id: string;
  region: string;
  amount: number;
};

const PAGE_1: Page<SaleRecord> = {
  items: [
    { id: "s1", region: "EU", amount: 100 },
    { id: "s2", region: "US", amount: 200 },
  ],
  nextCursor: "cursor-page-2",
};

const PAGE_2: Page<SaleRecord> = {
  items: [
    { id: "s3", region: "EU", amount: 150 },
    { id: "s4", region: "APAC", amount: 300 },
  ],
  nextCursor: null, // last page
};

// ── Test 1: ok / err constructors ─────────────────────────────
const okResult = ok(42);
const errResult = err({ code: 500, message: "Server Error" });
assert(okResult.tag === "ok" && okResult.value === 42, "ok() constructs Ok variant");
assert(errResult.tag === "err" && errResult.error.code === 500, "err() constructs Err variant");

// ── Test 2: withRetry succeeds on first Ok ────────────────────
(async () => {
  let callCount = 0;
  const alwaysOk = async (): Promise<Result<string, ApiError>> => {
    callCount++;
    return ok("hello");
  };
  const result = await withRetry(alwaysOk, 3);
  assert(result.tag === "ok" && result.value === "hello", "withRetry returns Ok immediately when fn succeeds");
  assert(callCount === 1, "withRetry calls fn exactly once when it succeeds first try");

  // ── Test 3: withRetry retries on Err then succeeds ────────────
  let attempts = 0;
  const failTwiceThenOk = async (): Promise<Result<number, ApiError>> => {
    attempts++;
    if (attempts < 3) return err({ code: 503, message: "Unavailable" });
    return ok(99);
  };
  const retryResult = await withRetry(failTwiceThenOk, 3);
  assert(retryResult.tag === "ok" && retryResult.value === 99, "withRetry succeeds after 2 failures");
  assert(attempts === 3, "withRetry called fn exactly 3 times (2 failures + 1 success)");

  // ── Test 4: fetchAllPages collects all pages ──────────────────
  const cursors: Array<string | null> = [];
  const mockFetch: FetchPage<SaleRecord> = async (cursor) => {
    cursors.push(cursor);
    if (cursor === null) return ok(PAGE_1);
    if (cursor === "cursor-page-2") return ok(PAGE_2);
    return err({ code: 404, message: "Unknown cursor" });
  };

  const pagesResult = await fetchAllPages(mockFetch);
  assert(pagesResult.tag === "ok", "fetchAllPages returns Ok for a clean 2-page fetch");
  if (pagesResult.tag === "ok") {
    assert(pagesResult.value.length === 4, "fetchAllPages collects all 4 items across 2 pages");
    assert(
      pagesResult.value[0].id === "s1" && pagesResult.value[3].id === "s4",
      "fetchAllPages preserves item order across pages"
    );
  }

  // ── Test 5: aggregateRecords groups correctly ─────────────────
  const allItems: SaleRecord[] =
    pagesResult.tag === "ok" ? pagesResult.value : [];
  const grouped = aggregateRecords(allItems, "region");

  assert(grouped.get("EU")?.length === 2, "aggregateRecords groups 2 EU records");
  assert(grouped.get("US")?.length === 1, "aggregateRecords groups 1 US record");
  assert(grouped.get("APAC")?.length === 1, "aggregateRecords groups 1 APAC record");
  assert(grouped.get("EU")?.[0].id === "s1", "aggregateRecords preserves item order within group");
})();
