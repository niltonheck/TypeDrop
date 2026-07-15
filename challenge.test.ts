// ============================================================
// Test Harness: challenge.test.ts
// Run with:  npx ts-node --strict challenge.test.ts
// ============================================================
import {
  parseTransactionRow,
  parseAll,
  summariseByCategory,
  type ParseResult,
  type Transaction,
  type SpendingSummary,
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

// ── 1. parseTransactionRow — happy path ──────────────────────
const r1 = parseTransactionRow("2026-07-01,12.50,food,Coffee at Blue Bottle");
assert(r1.ok === true, "valid row parses successfully");
if (r1.ok) {
  assert(r1.value.amount === 12.5,   "amount is parsed as a number");
  assert(r1.value.category === "food", "category is correctly typed");
  assert(r1.value.description === "Coffee at Blue Bottle", "description preserved");
  assert(r1.value.date === "2026-07-01", "date preserved");
}

// ── 2. parseTransactionRow — validation failures ─────────────
const badFields = parseTransactionRow("2026-07-01,12.50,food");          // only 3 fields
assert(badFields.ok === false, "row with wrong field count fails");

const badDate = parseTransactionRow("07-01-2026,12.50,food,Lunch");      // wrong date format
assert(badDate.ok === false, "row with bad date format fails");

const badAmount = parseTransactionRow("2026-07-01,-5.00,food,Lunch");    // negative amount
assert(badAmount.ok === false, "row with negative amount fails");

const badCategory = parseTransactionRow("2026-07-01,5.00,coffee,Espresso"); // unknown category
assert(badCategory.ok === false, "row with unknown category fails");

const badDesc = parseTransactionRow("2026-07-01,5.00,food,");             // empty description
assert(badDesc.ok === false, "row with empty description fails");

// ── 3. parseAll — mixed batch ─────────────────────────────────
const raw = [
  "2026-07-01,12.50,food,Coffee",
  "2026-07-02,3.00,transport,Bus fare",
  "INVALID_ROW",
  "2026-07-03,50.00,utilities,Electric bill",
  "2026-07-04,abc,entertainment,Cinema",   // bad amount
];

const batch = parseAll(raw);
assert(batch.valid.length === 3,  "parseAll returns 3 valid transactions");
assert(batch.errors.length === 2, "parseAll returns 2 errors");
assert(
  batch.errors.every(e => typeof e.row === "string" && typeof e.error === "string"),
  "each error entry has row and error strings"
);

// ── 4. summariseByCategory ────────────────────────────────────
const transactions: Transaction[] = [
  { date: "2026-07-01", amount: 12.50, category: "food",          description: "Coffee" },
  { date: "2026-07-02", amount: 8.75,  category: "food",          description: "Lunch" },
  { date: "2026-07-03", amount: 3.00,  category: "transport",     description: "Bus" },
  { date: "2026-07-04", amount: 50.00, category: "utilities",     description: "Electric" },
];

const summary: SpendingSummary = summariseByCategory(transactions);

assert(summary.food.total === 21.25,       "food total is 21.25");
assert(summary.food.count === 2,           "food count is 2");
assert(summary.transport.total === 3.00,   "transport total is 3.00");
assert(summary.transport.count === 1,      "transport count is 1");
assert(summary.entertainment.total === 0,  "entertainment total is 0 (no entries)");
assert(summary.entertainment.count === 0,  "entertainment count is 0 (no entries)");
assert(summary.other.total === 0,          "other total is 0 (no entries)");

console.log("\nAll checks complete.");
