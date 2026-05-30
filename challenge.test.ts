// ============================================================
// challenge.test.ts — Typed Paginated API Cursor Engine
// Run with: npx ts-node --strict challenge.test.ts
// ============================================================

import {
  validateRawPage,
  parsePage,
  paginateStream,
  runAggregation,
  makeCursor,
  makeResourceId,
  type ResourceStream,
  type PaginationPolicy,
  type Result,
} from "./challenge";

// ------------------------------------------------------------------
// Mock payload shape
// ------------------------------------------------------------------

interface AnalyticsPayload {
  eventName: string;
  value: number;
}

function validateAnalyticsPayload(raw: unknown): Result<AnalyticsPayload> {
  if (
    raw !== null &&
    typeof raw === "object" &&
    "eventName" in raw &&
    "value" in raw &&
    typeof (raw as Record<string, unknown>).eventName === "string" &&
    typeof (raw as Record<string, unknown>).value === "number"
  ) {
    const r = raw as { eventName: string; value: number };
    return { ok: true, value: { eventName: r.eventName, value: r.value } };
  }
  return {
    ok: false,
    error: { kind: "validation", field: "payload", message: "Invalid analytics payload" },
  };
}

// ------------------------------------------------------------------
// Test 1: validateRawPage — happy path
// ------------------------------------------------------------------

const rawGood = {
  data: [
    { id: "r1", payload: { eventName: "click", value: 42 }, timestamp: 1000 },
  ],
  next_cursor: "cursor-abc",
  total_count: 1,
};

const validated = validateRawPage(rawGood);
console.assert(validated.ok === true, "T1: validateRawPage should succeed on valid input");

// ------------------------------------------------------------------
// Test 2: validateRawPage — bad input (data is not array)
// ------------------------------------------------------------------

const rawBad = { data: "not-an-array", next_cursor: null, total_count: 5 };
const validatedBad = validateRawPage(rawBad);
console.assert(
  validatedBad.ok === false && validatedBad.error.kind === "validation",
  "T2: validateRawPage should fail when data is not an array"
);

// ------------------------------------------------------------------
// Test 3: parsePage — extracts records and nextCursor correctly
// ------------------------------------------------------------------

if (validated.ok) {
  const parsed = parsePage(validated.value, validateAnalyticsPayload);
  console.assert(parsed.records.length === 1, "T3a: parsePage should return 1 record");
  console.assert(
    parsed.nextCursor === makeCursor("cursor-abc"),
    "T3b: parsePage should extract next cursor"
  );
  console.assert(parsed.totalCount === 1, "T3c: parsePage totalCount should be 1");
}

// ------------------------------------------------------------------
// Test 4: paginateStream — 2-page stream completes naturally
// ------------------------------------------------------------------

(async () => {
  let callCount = 0;

  const twoPageStream: ResourceStream<AnalyticsPayload> = {
    resourceId: makeResourceId("stream-alpha"),
    fetchPage: async (_cursor) => {
      callCount++;
      if (callCount === 1) {
        return {
          data: [{ id: "r1", payload: { eventName: "view", value: 1 }, timestamp: 1001 }],
          next_cursor: "page-2",
          total_count: 2,
        };
      }
      // second (last) page
      return {
        data: [{ id: "r2", payload: { eventName: "click", value: 2 }, timestamp: 1002 }],
        next_cursor: null,
        total_count: 2,
      };
    },
    validatePayload: validateAnalyticsPayload,
  };

  const policy: PaginationPolicy = {
    maxPages: 10,
    delayMs: 0,
    concurrencyLimit: 2,
  };

  const report = await paginateStream(twoPageStream, policy);

  console.assert(report.status === "complete", "T4a: status should be complete");
  console.assert(report.pagesConsumed === 2, "T4b: pagesConsumed should be 2");
  console.assert(report.totalFetched === 2, "T4c: totalFetched should be 2");
  console.assert(report.errors.length === 0, "T4d: no errors expected");

  // ------------------------------------------------------------------
  // Test 5: runAggregation — concurrency limit respected, grandTotal correct
  // ------------------------------------------------------------------

  const makeStream = (id: string, pages: number): ResourceStream<AnalyticsPayload> => {
    let fetched = 0;
    return {
      resourceId: makeResourceId(id),
      fetchPage: async (_cursor) => {
        fetched++;
        const isLast = fetched >= pages;
        return {
          data: [{ id: `${id}-r${fetched}`, payload: { eventName: "ev", value: fetched }, timestamp: Date.now() }],
          next_cursor: isLast ? null : `cursor-${fetched}`,
          total_count: pages,
        };
      },
      validatePayload: validateAnalyticsPayload,
    };
  };

  const streams = [
    makeStream("s1", 2),
    makeStream("s2", 3),
    makeStream("s3", 1),
  ];

  const aggPolicy: PaginationPolicy = { maxPages: 10, delayMs: 0, concurrencyLimit: 2 };
  const aggReport = await runAggregation(streams, aggPolicy);

  console.assert(aggReport.streams.length === 3, "T5a: should have 3 stream reports");
  console.assert(aggReport.grandTotal === 6, `T5b: grandTotal should be 6, got ${aggReport.grandTotal}`);
  console.assert(typeof aggReport.durationMs === "number" && aggReport.durationMs >= 0, "T5c: durationMs should be a non-negative number");

  console.log("All assertions passed ✅");
})();
