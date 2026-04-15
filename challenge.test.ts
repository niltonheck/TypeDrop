// ============================================================
// challenge.test.ts
// ============================================================
import {
  parseCSV,
  parseRow,
  revenueByRegion,
  SALE_COLUMNS,
  type ParseReport,
  type Region,
  type RowResult,
  type SaleRecord,
} from "./challenge";

// ------------------------------------------------------------------
// Mock CSV data
// ------------------------------------------------------------------
const VALID_CSV = `id,region,product,quantity,unitPrice,saleDate
r001,NA,Widget A,10,9.99,2024-01-15
r002,EU,Gadget B,5,49.00,2024-02-20
r003,APAC,Doohickey C,2,199.50,2024-03-05
r004,LATAM,Widget A,8,9.99,2024-04-10`;

const CSV_WITH_ERRORS = `id,region,product,quantity,unitPrice,saleDate
r005,NA,Widget A,10,9.99,2024-01-15
BAD_ROW_TOO_FEW,NA
r007,BADREGION,Gadget B,5,49.00,2024-02-20
r008,EU,Gizmo D,-3,15.00,2024-05-01`;

// ------------------------------------------------------------------
// Test 1 – parseCSV with fully valid input produces correct counts
// ------------------------------------------------------------------
const report1: ParseReport = parseCSV(VALID_CSV);

console.assert(
  report1.totalRows === 4,
  `[Test 1a] Expected totalRows=4, got ${report1.totalRows}`
);
console.assert(
  report1.successRows === 4,
  `[Test 1b] Expected successRows=4, got ${report1.successRows}`
);
console.assert(
  report1.failedRows === 0,
  `[Test 1c] Expected failedRows=0, got ${report1.failedRows}`
);
console.assert(
  report1.records.length === 4,
  `[Test 1d] Expected 4 records, got ${report1.records.length}`
);
console.assert(
  report1.failures.length === 0,
  `[Test 1e] Expected 0 failures, got ${report1.failures.length}`
);

// ------------------------------------------------------------------
// Test 2 – SaleRecord fields are correctly typed and parsed
// ------------------------------------------------------------------
const firstRecord: SaleRecord = report1.records[0];

console.assert(
  firstRecord.id === "r001",
  `[Test 2a] Expected id="r001", got "${firstRecord.id}"`
);
console.assert(
  firstRecord.region === "NA",
  `[Test 2b] Expected region="NA", got "${firstRecord.region}"`
);
console.assert(
  firstRecord.quantity === 10,
  `[Test 2c] Expected quantity=10, got ${firstRecord.quantity}`
);
console.assert(
  firstRecord.unitPrice === 9.99,
  `[Test 2d] Expected unitPrice=9.99, got ${firstRecord.unitPrice}`
);
console.assert(
  firstRecord.saleDate instanceof Date,
  `[Test 2e] Expected saleDate to be a Date instance`
);

// ------------------------------------------------------------------
// Test 3 – parseCSV with errors captures failures correctly
// ------------------------------------------------------------------
const report2: ParseReport = parseCSV(CSV_WITH_ERRORS);

console.assert(
  report2.totalRows === 4,
  `[Test 3a] Expected totalRows=4, got ${report2.totalRows}`
);
console.assert(
  report2.successRows === 1,
  `[Test 3b] Expected successRows=1, got ${report2.successRows}`
);
console.assert(
  report2.failedRows === 3,
  `[Test 3c] Expected failedRows=3, got ${report2.failedRows}`
);
// Each failure must carry rowIndex, raw, and errors
report2.failures.forEach((f, i) => {
  console.assert(
    typeof f.rowIndex === "number",
    `[Test 3d-${i}] failure.rowIndex must be a number`
  );
  console.assert(
    Array.isArray(f.errors) && f.errors.length > 0,
    `[Test 3e-${i}] failure.errors must be a non-empty array`
  );
});

// ------------------------------------------------------------------
// Test 4 – revenueByRegion sums correctly and includes all regions
// ------------------------------------------------------------------
const revenue = revenueByRegion(report1.records);

// r001: 10 * 9.99 = 99.90  (NA)
// r002: 5 * 49.00 = 245.00 (EU)
// r003: 2 * 199.50 = 399.00 (APAC)
// r004: 8 * 9.99 = 79.92  (LATAM)
console.assert(
  revenue["NA"] === 99.9,
  `[Test 4a] Expected NA revenue=99.90, got ${revenue["NA"]}`
);
console.assert(
  revenue["EU"] === 245.0,
  `[Test 4b] Expected EU revenue=245.00, got ${revenue["EU"]}`
);
console.assert(
  revenue["APAC"] === 399.0,
  `[Test 4c] Expected APAC revenue=399.00, got ${revenue["APAC"]}`
);
console.assert(
  revenue["LATAM"] === 79.92,
  `[Test 4d] Expected LATAM revenue=79.92, got ${revenue["LATAM"]}`
);

// All four regions must be present even if zero
const allRegions: Region[] = ["NA", "EU", "APAC", "LATAM"];
allRegions.forEach((r) => {
  console.assert(
    r in revenue,
    `[Test 4e] Region "${r}" missing from revenue map`
  );
});

// ------------------------------------------------------------------
// Test 5 – Invalid header throws
// ------------------------------------------------------------------
let threw = false;
try {
  parseCSV("wrong,header,columns\nval1,val2,val3");
} catch {
  threw = true;
}
console.assert(threw, "[Test 5] parseCSV should throw on invalid header");

console.log("All tests completed — check for any assertion failures above.");
