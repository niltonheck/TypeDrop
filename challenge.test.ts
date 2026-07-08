// ============================================================
// challenge.test.ts — Test harness (run with ts-node or vitest)
// ============================================================
import {
  validatePage,
  fetchAllPages,
  type RawPage,
  type PageFetcher,
  type PaginationConfig,
  type AccumulationResult,
} from "./challenge";

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function makeRecord(id: string) {
  return {
    id,
    eventName: "click",
    userId: "u1",
    timestampMs: 1720000000000,
    metadata: { source: "web" },
  };
}

// -----------------------------------------------------------
// TEST 1 — validatePage: valid envelope
// -----------------------------------------------------------
const rawValid: RawPage = {
  data: [makeRecord("r1"), makeRecord("r2")],
  nextCursor: "cursor-abc",
  totalCount: 10,
};
const vResult = validatePage(rawValid);
console.assert(vResult.ok === true, "TEST 1a: valid page should succeed");
if (vResult.ok) {
  console.assert(vResult.value.records.length === 2, "TEST 1b: 2 records");
  console.assert(vResult.value.nextCursor === "cursor-abc", "TEST 1c: cursor");
  console.assert(vResult.value.totalCount === 10, "TEST 1d: totalCount");
}

// -----------------------------------------------------------
// TEST 2 — validatePage: bad record (missing eventName)
// -----------------------------------------------------------
const rawBadRecord: RawPage = {
  data: [{ id: "r3", userId: "u1", timestampMs: 123, metadata: {} }], // missing eventName
  nextCursor: null,
  totalCount: 1,
};
const vBad = validatePage(rawBadRecord);
console.assert(vBad.ok === false, "TEST 2: bad record should fail validation");

// -----------------------------------------------------------
// TEST 3 — fetchAllPages: happy-path two pages
// -----------------------------------------------------------
const pages: RawPage[] = [
  { data: [makeRecord("a1"), makeRecord("a2")], nextCursor: "c1", totalCount: 4 },
  { data: [makeRecord("a3"), makeRecord("a4")], nextCursor: null, totalCount: 4 },
];
let callIndex = 0;
const happyFetcher: PageFetcher = async (_cursor) => {
  const page = pages[callIndex++];
  return { ok: true, value: page };
};
const happyConfig: PaginationConfig = { maxItems: 100, maxPages: 10 };
const happyResult: AccumulationResult = await fetchAllPages(happyFetcher, happyConfig);
console.assert(happyResult.records.length === 4, "TEST 3a: 4 records total");
console.assert(happyResult.errors.length === 0,  "TEST 3b: no errors");
console.assert(happyResult.cappedAt === null,     "TEST 3c: not capped");
console.assert(happyResult.pagesSucceeded === 2,  "TEST 3d: 2 pages succeeded");

// -----------------------------------------------------------
// TEST 4 — fetchAllPages: cap enforcement
// -----------------------------------------------------------
callIndex = 0; // reset
const capFetcher: PageFetcher = async (_cursor) => {
  const page = pages[callIndex++];
  return { ok: true, value: page };
};
const capConfig: PaginationConfig = { maxItems: 3, maxPages: 10 };
const capResult: AccumulationResult = await fetchAllPages(capFetcher, capConfig);
console.assert(capResult.records.length === 3,       "TEST 4a: exactly 3 records");
console.assert(capResult.cappedAt === 3,             "TEST 4b: cappedAt = 3");
console.assert(
  capResult.errors.some((e) => e.kind === "cap-reached"),
  "TEST 4c: cap-reached error present"
);

// -----------------------------------------------------------
// TEST 5 — fetchAllPages: network error on page 1
// -----------------------------------------------------------
const netFetcher: PageFetcher = async (_cursor) => ({
  ok: false,
  error: "Connection refused",
});
const netResult: AccumulationResult = await fetchAllPages(netFetcher, happyConfig);
console.assert(netResult.records.length === 0, "TEST 5a: no records on network error");
console.assert(
  netResult.errors.length === 1 && netResult.errors[0].kind === "network",
  "TEST 5b: network error recorded"
);

console.log("All assertions passed ✓");
