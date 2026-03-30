// ============================================================
// challenge.test.ts
// ============================================================
import {
  validateRecord,
  validateEnvelope,
  withConcurrency,
  paginateAll,
  type RawRecord,
  type RawEnvelope,
  type FetchPage,
  type PaginatorConfig,
  type AnalyticsRecord,
  type PaginatorError,
} from "./challenge";

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------
const validRaw: RawRecord = {
  id: "rec-1",
  timestamp: "2026-03-30T10:00:00Z",
  metric: "page_views",
  value: 42,
  tags: ["web", "mobile"],
};

const invalidRaw: RawRecord = {
  id: "",           // empty — should fail
  timestamp: "2026-03-30T10:00:00Z",
  metric: "clicks",
  value: 7,
  tags: [],
};

const validEnvelopeRaw: RawEnvelope = {
  page: 1,
  totalPages: 2,
  data: [validRaw],
};

// -----------------------------------------------------------
// Test 1 — validateRecord: happy path
// -----------------------------------------------------------
console.log("\nTest 1 — validateRecord (valid input)");
{
  const result = validateRecord(validRaw);
  assert(result.ok === true, "returns ok:true for valid record");
  if (result.ok) {
    assert(result.value.id === "rec-1",           "id is preserved");
    assert(result.value.value === 42,             "value is preserved");
    assert(Array.isArray(result.value.tags),      "tags is an array");
  }
}

// -----------------------------------------------------------
// Test 2 — validateRecord: invalid input
// -----------------------------------------------------------
console.log("\nTest 2 — validateRecord (invalid input)");
{
  const result = validateRecord(invalidRaw);
  assert(result.ok === false,                     "returns ok:false for empty id");
  if (!result.ok) {
    assert(typeof result.error === "string",      "error is a string");
    assert(result.error.toLowerCase().includes("id"), "error mentions 'id'");
  }
}

// -----------------------------------------------------------
// Test 3 — validateEnvelope
// -----------------------------------------------------------
console.log("\nTest 3 — validateEnvelope");
{
  const good = validateEnvelope(validEnvelopeRaw);
  assert(good.ok === true, "valid envelope returns ok:true");
  if (good.ok) {
    assert(good.value.page === 1,       "page number preserved");
    assert(good.value.totalPages === 2, "totalPages preserved");
    assert(good.value.data.length === 1,"data array length preserved");
  }

  const bad = validateEnvelope({ page: 0, totalPages: 2, data: [] });
  assert(bad.ok === false, "page=0 envelope returns ok:false");
}

// -----------------------------------------------------------
// Test 4 — withConcurrency preserves order & respects limit
// -----------------------------------------------------------
console.log("\nTest 4 — withConcurrency");
{
  const order: number[] = [];
  const tasks = [1, 2, 3, 4, 5].map((n) => async () => {
    // stagger slightly so concurrency actually matters
    await new Promise<void>((r) => setTimeout(r, (6 - n) * 10));
    order.push(n);
    return n * 10;
  });

  const results = await withConcurrency(tasks, 2);
  assert(
    JSON.stringify(results) === JSON.stringify([10, 20, 30, 40, 50]),
    "results are in original task order regardless of completion order"
  );
  assert(results.length === 5, "all 5 results returned");
}

// -----------------------------------------------------------
// Test 5 — paginateAll: full success + timestamp sort
// -----------------------------------------------------------
console.log("\nTest 5 — paginateAll (all pages succeed)");
{
  const pages: RawEnvelope[] = [
    {
      page: 1,
      totalPages: 2,
      data: [
        { id: "a", timestamp: "2026-03-30T12:00:00Z", metric: "m", value: 1, tags: [] },
        { id: "b", timestamp: "2026-03-30T08:00:00Z", metric: "m", value: 2, tags: [] },
      ],
    },
    {
      page: 2,
      totalPages: 2,
      data: [
        { id: "c", timestamp: "2026-03-30T10:00:00Z", metric: "m", value: 3, tags: [] },
      ],
    },
  ];

  const fetchPage: FetchPage = async (page) => ({
    ok: true,
    value: pages[page - 1],
  });

  const config: PaginatorConfig = { totalPages: 2, concurrency: 2 };
  const result = await paginateAll(fetchPage, config);

  assert(result.ok === true, "all-success returns ok:true");
  if (result.ok) {
    assert(result.value.length === 3, "all 3 records collected");
    const timestamps = result.value.map((r: AnalyticsRecord) => r.timestamp);
    assert(
      JSON.stringify(timestamps) ===
        JSON.stringify([
          "2026-03-30T08:00:00Z",
          "2026-03-30T10:00:00Z",
          "2026-03-30T12:00:00Z",
        ]),
      "records are sorted ascending by timestamp"
    );
  }
}

// -----------------------------------------------------------
// Test 6 — paginateAll: partial failure
// -----------------------------------------------------------
console.log("\nTest 6 — paginateAll (one page fails)");
{
  const fetchPage: FetchPage = async (page) => {
    if (page === 2) return { ok: false, error: "network timeout" };
    return {
      ok: true,
      value: {
        page: 1,
        totalPages: 2,
        data: [
          { id: "x", timestamp: "2026-03-30T09:00:00Z", metric: "m", value: 9, tags: [] },
        ],
      } as RawEnvelope,
    };
  };

  const config: PaginatorConfig = { totalPages: 2, concurrency: 1 };
  const result = await paginateAll(fetchPage, config);

  assert(result.ok === false, "partial failure returns ok:false");
  if (!result.ok) {
    const err = result.error as PaginatorError;
    assert(err.kind === "partial",              "error kind is 'partial'");
    assert(err.errors.length >= 1,              "at least one sub-error recorded");
    assert(err.records.length === 1,            "valid record from page 1 still included");
    assert(err.errors[0].kind === "fetch",      "sub-error kind is 'fetch'");
  }
}

console.log("\nAll tests complete.\n");
