// challenge.test.ts
import { validateRow, aggregateRecords, runPipeline } from "./challenge";
import type {
  SalesRecord,
  ValidationFailure,
  ReportSummary,
  PipelineResult,
} from "./challenge";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const validRow1 = {
  id: "S001",
  region: "north",
  product: "Widget A",
  quantity: 10,
  unitPrice: 9.99,
  saleDate: "2026-01-15",
};

const validRow2 = {
  id: "S002",
  region: "south",
  product: "Widget B",
  quantity: 5,
  unitPrice: 19.99,
  saleDate: "2026-02-20",
};

const validRow3 = {
  id: "S003",
  region: "north",
  product: "Gadget X",
  quantity: 3,
  unitPrice: 49.99,
  saleDate: "2026-03-10",
};

const invalidRowBadRegion = {
  id: "S004",
  region: "midwest",       // ❌ not a valid Region
  product: "Thing",
  quantity: 1,
  unitPrice: 5.0,
  saleDate: "2026-04-01",
};

const invalidRowBadQuantity = {
  id: "S005",
  region: "east",
  product: "Doohickey",
  quantity: -3,             // ❌ must be > 0
  unitPrice: 12.5,
  saleDate: "2026-05-05",
};

const invalidRowBadDate = {
  id: "S006",
  region: "west",
  product: "Thingamajig",
  quantity: 2,
  unitPrice: 7.5,
  saleDate: "15-01-2026",  // ❌ wrong format
};

// ---------------------------------------------------------------------------
// TEST 1 — validateRow returns ok for a valid row
// ---------------------------------------------------------------------------
const result1 = validateRow(validRow1, 0);
console.assert(
  result1.status === "ok",
  `TEST 1 FAILED: expected status "ok", got "${result1.status}"`
);
if (result1.status === "ok") {
  console.assert(
    result1.value.id === "S001" && result1.value.region === "north",
    `TEST 1b FAILED: parsed fields are wrong`
  );
}

// ---------------------------------------------------------------------------
// TEST 2 — validateRow catches the first invalid field (region)
// ---------------------------------------------------------------------------
const result2 = validateRow(invalidRowBadRegion, 3);
console.assert(
  result2.status === "error",
  `TEST 2 FAILED: expected status "error", got "${result2.status}"`
);
if (result2.status === "error") {
  console.assert(
    result2.field === "region",
    `TEST 2b FAILED: expected field "region", got "${result2.field}"`
  );
  console.assert(
    result2.rowIndex === 3,
    `TEST 2c FAILED: expected rowIndex 3, got ${result2.rowIndex}`
  );
}

// ---------------------------------------------------------------------------
// TEST 3 — aggregateRecords computes correct revenue & region breakdown
// ---------------------------------------------------------------------------
const records: SalesRecord[] = [
  validRow1 as SalesRecord,
  validRow2 as SalesRecord,
  validRow3 as SalesRecord,
];
const agg = aggregateRecords(records);

// grandTotalRevenue = (10*9.99) + (5*19.99) + (3*49.99) = 99.90 + 99.95 + 149.97 = 349.82
console.assert(
  agg.grandTotalRevenue === 349.82,
  `TEST 3 FAILED: expected grandTotalRevenue 349.82, got ${agg.grandTotalRevenue}`
);

// north region: rows S001 + S003 → revenue = 99.90 + 149.97 = 249.87
console.assert(
  agg.byRegion.north.totalRevenue === 249.87,
  `TEST 3b FAILED: expected north revenue 249.87, got ${agg.byRegion.north.totalRevenue}`
);
console.assert(
  agg.byRegion.north.recordCount === 2,
  `TEST 3c FAILED: expected north recordCount 2, got ${agg.byRegion.north.recordCount}`
);

// ---------------------------------------------------------------------------
// TEST 4 — runPipeline returns "empty" for an empty array
// ---------------------------------------------------------------------------
const emptyResult: PipelineResult = runPipeline([]);
console.assert(
  emptyResult.status === "empty",
  `TEST 4 FAILED: expected status "empty", got "${emptyResult.status}"`
);

// ---------------------------------------------------------------------------
// TEST 5 — runPipeline processes mixed valid/invalid rows correctly
// ---------------------------------------------------------------------------
const mixedResult = runPipeline([
  validRow1,
  validRow2,
  validRow3,
  invalidRowBadRegion,
  invalidRowBadQuantity,
  invalidRowBadDate,
]);

console.assert(
  mixedResult.status === "complete",
  `TEST 5 FAILED: expected status "complete", got "${mixedResult.status}"`
);

if (mixedResult.status === "complete") {
  const report: ReportSummary = mixedResult.report;

  console.assert(
    report.totalRecords === 6,
    `TEST 5b FAILED: expected totalRecords 6, got ${report.totalRecords}`
  );
  console.assert(
    report.validRecords === 3,
    `TEST 5c FAILED: expected validRecords 3, got ${report.validRecords}`
  );
  console.assert(
    report.invalidRecords === 3,
    `TEST 5d FAILED: expected invalidRecords 3, got ${report.invalidRecords}`
  );
  console.assert(
    report.errors.length === 3,
    `TEST 5e FAILED: expected 3 errors, got ${report.errors.length}`
  );
  console.assert(
    report.grandTotalRevenue === 349.82,
    `TEST 5f FAILED: expected grandTotalRevenue 349.82, got ${report.grandTotalRevenue}`
  );
}

console.log("All tests executed — check for any FAILED assertions above.");
