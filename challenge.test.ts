// challenge.test.ts
import {
  toRegionCode,
  toProductSku,
  validateRow,
  aggregateReport,
  groupBy,
  type RawRow,
  type ParseError,
  type GroupStats,
} from "./challenge";

// -----------------------------------------------------------
// Helpers
// -----------------------------------------------------------
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------
const VALID_ROWS: RawRow[] = [
  { region: "US",   sku: "WIDGET01",  units: "10", revenue: "250.00", date: "2026-01-15" },
  { region: "US",   sku: "WIDGET01",  units: "5",  revenue: "125.00", date: "2026-01-20" },
  { region: "EU",   sku: "GADGET99",  units: "3",  revenue: "99.99",  date: "2026-02-01" },
  { region: "APAC", sku: "GIZMO007",  units: "20", revenue: "400.00", date: "2026-02-10" },
];

const INVALID_ROWS: RawRow[] = [
  { region: "us",  sku: "WIDGET01", units: "10",  revenue: "250.00", date: "2026-01-15" }, // bad region (lowercase)
  { region: "US",  sku: "widget01", units: "10",  revenue: "250.00", date: "2026-01-15" }, // bad sku (lowercase)
  { region: "US",  sku: "WIDGET01", units: "-5",  revenue: "250.00", date: "2026-01-15" }, // bad units (negative)
  { region: "US",  sku: "WIDGET01", units: "10",  revenue: "-1.00",  date: "2026-01-15" }, // bad revenue (negative)
  { region: "US",  sku: "WIDGET01", units: "10",  revenue: "250.00", date: "not-a-date"  }, // bad date
];

// -----------------------------------------------------------
// Test 1: Branded type factories
// -----------------------------------------------------------
assert(toRegionCode("US")   !== null, "toRegionCode accepts valid 'US'");
assert(toRegionCode("APAC") !== null, "toRegionCode accepts valid 'APAC'");
assert(toRegionCode("us")   === null, "toRegionCode rejects lowercase 'us'");
assert(toRegionCode("TOOLONG") === null, "toRegionCode rejects >4 chars");
assert(toProductSku("WIDGET01") !== null, "toProductSku accepts valid 'WIDGET01'");
assert(toProductSku("widget01") === null, "toProductSku rejects lowercase 'widget01'");
assert(toProductSku("AB") === null, "toProductSku rejects too-short 'AB'");

// -----------------------------------------------------------
// Test 2: validateRow — valid row
// -----------------------------------------------------------
const validResult = validateRow(VALID_ROWS[0], 0);
assert(validResult.ok === true, "validateRow returns Ok for a valid row");
if (validResult.ok) {
  assert(validResult.value.units   === 10,     "validateRow parses units correctly");
  assert(validResult.value.revenue === 250.00, "validateRow parses revenue correctly");
  assert(validResult.value.date instanceof Date, "validateRow parses date as Date object");
}

// -----------------------------------------------------------
// Test 3: validateRow — invalid rows (first-field-wins)
// -----------------------------------------------------------
const badRegion  = validateRow(INVALID_ROWS[0], 0);
assert(badRegion.ok === false && (badRegion as { ok: false; error: ParseError }).error.field === "region",
  "validateRow surfaces region error first");

const badUnits   = validateRow(INVALID_ROWS[2], 2);
assert(badUnits.ok === false && (badUnits as { ok: false; error: ParseError }).error.field === "units",
  "validateRow surfaces units error");

const badDate    = validateRow(INVALID_ROWS[4], 4);
assert(badDate.ok === false && (badDate as { ok: false; error: ParseError }).error.field === "date",
  "validateRow surfaces date error");

// -----------------------------------------------------------
// Test 4: aggregateReport — counts
// -----------------------------------------------------------
const mixedRows  = [...VALID_ROWS, ...INVALID_ROWS];
const report     = aggregateReport(mixedRows);

assert(report.validCount   === 4, `aggregateReport counts 4 valid rows (got ${report.validCount})`);
assert(report.invalidCount === 5, `aggregateReport counts 5 invalid rows (got ${report.invalidCount})`);
assert(report.errors.length === 5, "aggregateReport collects all 5 ParseErrors");

// -----------------------------------------------------------
// Test 5: aggregateReport — byRegion grouping
// -----------------------------------------------------------
const usRegion = toRegionCode("US");
const usMap    = usRegion ? report.byRegion.get(usRegion) : undefined;
assert(usMap !== undefined, "byRegion has an entry for 'US'");

const skuKey   = toProductSku("WIDGET01");
const usWidget = (usMap && skuKey) ? usMap.get(skuKey) : undefined;
assert(usWidget !== undefined, "byRegion['US']['WIDGET01'] exists");
if (usWidget) {
  assert(usWidget.totalUnits   === 15,    `US/WIDGET01 totalUnits = 15 (got ${usWidget.totalUnits})`);
  assert(usWidget.totalRevenue === 375.0, `US/WIDGET01 totalRevenue = 375 (got ${usWidget.totalRevenue})`);
  assert(usWidget.rowCount     === 2,     `US/WIDGET01 rowCount = 2 (got ${usWidget.rowCount})`);
  assert(
    Math.abs(usWidget.avgRevenue - 187.5) < 0.001,
    `US/WIDGET01 avgRevenue ≈ 187.5 (got ${usWidget.avgRevenue})`
  );
}

// -----------------------------------------------------------
// Test 6: aggregateReport — summary totals
// -----------------------------------------------------------
const expectedTotalUnits   = 10 + 5 + 3 + 20;          // 38
const expectedTotalRevenue = 250 + 125 + 99.99 + 400;   // 874.99
assert(report.summary.totalUnits   === expectedTotalUnits,
  `summary.totalUnits = ${expectedTotalUnits} (got ${report.summary.totalUnits})`);
assert(
  Math.abs(report.summary.totalRevenue - expectedTotalRevenue) < 0.001,
  `summary.totalRevenue ≈ ${expectedTotalRevenue} (got ${report.summary.totalRevenue})`
);
// global avgRevenue = totalRevenue / rowCount (rowCount across all groups = 3 groups → 4 valid rows)
assert(
  Math.abs(report.summary.avgRevenue - expectedTotalRevenue / 4) < 0.001,
  `summary.avgRevenue ≈ ${(expectedTotalRevenue / 4).toFixed(4)} (got ${report.summary.avgRevenue})`
);

// -----------------------------------------------------------
// Test 7: groupBy utility
// -----------------------------------------------------------
type Fruit = { name: string; color: "red" | "yellow" | "green" };
const fruits: Fruit[] = [
  { name: "apple",  color: "red"    },
  { name: "banana", color: "yellow" },
  { name: "cherry", color: "red"    },
  { name: "lime",   color: "green"  },
];
const byColor = groupBy(fruits, (f) => f.color);
assert(byColor["red"].length    === 2, "groupBy: 2 red fruits");
assert(byColor["yellow"].length === 1, "groupBy: 1 yellow fruit");
assert(byColor["green"].length  === 1, "groupBy: 1 green fruit");

console.log("\nAll tests complete.");
