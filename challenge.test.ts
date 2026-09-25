// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import { parseCsv, aggregateRows, runPipeline } from "./challenge";
import type { ColumnDef, SchemaRow, AggregationSpec } from "./challenge";

// -----------------------------------------------------------
// Schema definition
// -----------------------------------------------------------
const schema = [
  { name: "region",   kind: "string"  },
  { name: "product",  kind: "string"  },
  { name: "revenue",  kind: "number"  },
  { name: "units",    kind: "number"  },
  { name: "refunded", kind: "boolean", optional: true },
] as const satisfies readonly ColumnDef[];

type Row = SchemaRow<typeof schema>;

// -----------------------------------------------------------
// Mock CSV data
// -----------------------------------------------------------
const goodCsv = `region,product,revenue,units,refunded
North,Widget A,1200.50,10,true
North,Widget B,800.00,5,false
South,Widget A,950.75,8,
South,Widget C,300.00,3,false
North,Widget A,400.25,4,true`;

const badCsv = `region,product,revenue,units,refunded
North,Widget A,NOT_A_NUMBER,10,true
South,Widget B,500.00,abc,false
East,Widget C,200.00,2,maybe`;

// -----------------------------------------------------------
// Test 1: parseCsv — correct row count on good data
// -----------------------------------------------------------
const goodResult = parseCsv(goodCsv, schema);
console.assert(
  goodResult.rows.length === 5,
  `Test 1 FAILED: expected 5 rows, got ${goodResult.rows.length}`
);
console.assert(
  goodResult.errors.length === 0,
  `Test 1b FAILED: expected 0 errors, got ${goodResult.errors.length}`
);
console.log("Test 1 passed — parseCsv good data:", goodResult.rows.length, "rows");

// -----------------------------------------------------------
// Test 2: parseCsv — optional column parses null for empty cell
// -----------------------------------------------------------
const southWidgetA = goodResult.rows.find(
  (r) => r.region === "South" && r.product === "Widget A"
);
console.assert(
  southWidgetA !== undefined && southWidgetA.refunded === null,
  `Test 2 FAILED: expected refunded to be null, got ${southWidgetA?.refunded}`
);
console.log("Test 2 passed — optional null:", southWidgetA?.refunded);

// -----------------------------------------------------------
// Test 3: parseCsv — bad data produces errors and no rows
// -----------------------------------------------------------
const badResult = parseCsv(badCsv, schema);
console.assert(
  badResult.rows.length === 0,
  `Test 3 FAILED: expected 0 valid rows, got ${badResult.rows.length}`
);
console.assert(
  badResult.errors.length === 3,
  `Test 3b FAILED: expected 3 errors, got ${badResult.errors.length}`
);
console.log("Test 3 passed — parseCsv bad data:", badResult.errors.length, "errors");

// -----------------------------------------------------------
// Test 4: aggregateRows — group by region, sum revenue & units
// -----------------------------------------------------------
const spec = {
  groupBy: "region",
  sum: ["revenue", "units"],
} as const satisfies AggregationSpec<typeof schema>;

const report = aggregateRows(goodResult.rows, spec);

const northRevenue = report["North"]?.revenue ?? 0;
const expectedNorthRevenue = 1200.50 + 800.00 + 400.25; // 2400.75
console.assert(
  Math.abs(northRevenue - expectedNorthRevenue) < 0.01,
  `Test 4 FAILED: North revenue expected ~${expectedNorthRevenue}, got ${northRevenue}`
);
console.assert(
  report["North"]?.count === 3,
  `Test 4b FAILED: North count expected 3, got ${report["North"]?.count}`
);
console.log("Test 4 passed — North revenue:", northRevenue, "count:", report["North"]?.count);

// -----------------------------------------------------------
// Test 5: runPipeline — empty CSV body yields empty report
// -----------------------------------------------------------
const emptyCsv = `region,product,revenue,units,refunded`;
const pipelineResult = runPipeline(emptyCsv, schema, spec);
console.assert(
  pipelineResult.parseOutput.rows.length === 0,
  `Test 5 FAILED: expected 0 rows`
);
console.assert(
  Object.keys(pipelineResult.report).length === 0,
  `Test 5b FAILED: expected empty report, got ${JSON.stringify(pipelineResult.report)}`
);
console.log("Test 5 passed — empty pipeline report:", pipelineResult.report);

console.log("\n✅ All tests passed!");
