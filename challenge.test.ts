// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  toPageCursor,
  buildCategorySummary,
  formatSummary,
  fetchAllPages,
  type ReportRow,
  type PageResult,
  type FetchPage,
  type PickRows,
  type SummaryDisplay,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const rows: ReportRow[] = [
  { id: "r1", category: "revenue",    value: 10, label: "Jan" },
  { id: "r2", category: "revenue",    value: 20, label: "Feb" },
  { id: "r3", category: "engagement", value: 5,  label: "Jan" },
  { id: "r4", category: "retention",  value: 80, label: "Jan" },
  { id: "r5", category: "revenue",    value: 30, label: "Mar" },
  { id: "r6", category: "churn",      value: 3,  label: "Jan" },
];

// ------------------------------------------------------------------
// Test 1 — buildCategorySummary: correct counts & totals
// ------------------------------------------------------------------
const summary = buildCategorySummary(rows);

console.assert(summary.revenue.count     === 3,  "T1a: revenue count should be 3");
console.assert(summary.revenue.totalValue === 60, "T1b: revenue totalValue should be 60");
console.assert(
  Math.abs(summary.revenue.avgValue - 20) < 0.001,
  "T1c: revenue avgValue should be 20"
);
console.assert(summary.churn.count       === 1,  "T1d: churn count should be 1");
console.assert(summary.engagement.count  === 1,  "T1e: engagement count should be 1");
// Category with zero rows must still be present
console.assert(summary.retention.count   === 1,  "T1f: retention count should be 1");

// ------------------------------------------------------------------
// Test 2 — buildCategorySummary: zero-row category has avgValue 0
// ------------------------------------------------------------------
const sparseRows: ReportRow[] = [
  { id: "s1", category: "churn", value: 7, label: "X" },
];
const sparseSummary = buildCategorySummary(sparseRows);
console.assert(sparseSummary.revenue.avgValue    === 0, "T2a: revenue avgValue should be 0");
console.assert(sparseSummary.engagement.avgValue === 0, "T2b: engagement avgValue should be 0");
console.assert(sparseSummary.retention.avgValue  === 0, "T2c: retention avgValue should be 0");

// ------------------------------------------------------------------
// Test 3 — formatSummary: correct string format
// ------------------------------------------------------------------
const display: SummaryDisplay = formatSummary(summary);
console.assert(
  display.revenue === "revenue: 3 rows, avg 20.00",
  `T3a: got "${display.revenue}"`
);
console.assert(
  display.churn === "churn: 1 rows, avg 3.00",
  `T3b: got "${display.churn}"`
);

// ------------------------------------------------------------------
// Test 4 — fetchAllPages: happy path across 3 pages
// ------------------------------------------------------------------
const page1Rows: ReportRow[] = [
  { id: "p1r1", category: "revenue",    value: 100, label: "A" },
  { id: "p1r2", category: "engagement", value: 50,  label: "B" },
];
const page2Rows: ReportRow[] = [
  { id: "p2r1", category: "retention", value: 90, label: "C" },
];
const page3Rows: ReportRow[] = [
  { id: "p3r1", category: "churn", value: 2, label: "D" },
];

const cursor1 = toPageCursor("cur-1");
const cursor2 = toPageCursor("cur-2");

const mockFetchHappy: FetchPage = async (cursor) => {
  if (cursor === null)   return { kind: "success", rows: page1Rows, nextCursor: cursor1 };
  if (cursor === cursor1) return { kind: "success", rows: page2Rows, nextCursor: cursor2 };
  if (cursor === cursor2) return { kind: "success", rows: page3Rows, nextCursor: null };
  return { kind: "error", message: "unexpected cursor", failedCursor: cursor };
};

(async () => {
  const result = await fetchAllPages(mockFetchHappy);
  console.assert(result.rows.length        === 4, `T4a: expected 4 rows, got ${result.rows.length}`);
  console.assert(result.errors.length      === 0, `T4b: expected 0 errors, got ${result.errors.length}`);
  console.assert(result.pagesAttempted     === 3, `T4c: expected 3 pages, got ${result.pagesAttempted}`);
  console.assert(result.summary.revenue.count === 1, "T4d: revenue count should be 1");

  // ------------------------------------------------------------------
  // Test 5 — fetchAllPages: stops on error, keeps prior rows
  // ------------------------------------------------------------------
  const cursor3 = toPageCursor("cur-err");
  const mockFetchPartial: FetchPage = async (cursor) => {
    if (cursor === null)    return { kind: "success", rows: page1Rows, nextCursor: cursor3 };
    return { kind: "error", message: "server exploded", failedCursor: cursor3 };
  };

  const partial = await fetchAllPages(mockFetchPartial);
  console.assert(partial.rows.length    === 2, `T5a: expected 2 rows, got ${partial.rows.length}`);
  console.assert(partial.errors.length  === 1, `T5b: expected 1 error, got ${partial.errors.length}`);
  console.assert(partial.pagesAttempted === 2, `T5c: expected 2 pages attempted, got ${partial.pagesAttempted}`);
  console.assert(partial.errors[0].message === "server exploded", "T5d: error message mismatch");

  console.log("All assertions passed ✅");
})();

// ------------------------------------------------------------------
// Compile-time type check for PickRows (no runtime assertion needed)
// ------------------------------------------------------------------
type _RevenueOnly = PickRows<ReportRow, "revenue">;
// If PickRows is correct, this should be assignable to ReportRow
const _typeCheck: _RevenueOnly = {
  id: "x", category: "revenue", value: 0, label: ""
};
void _typeCheck;
