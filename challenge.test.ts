// challenge.test.ts
import {
  isExpenseCategory,
  validateExpense,
  groupByCategory,
  buildReport,
  processRawExpenses,
  type Expense,
  type ExpenseCategory,
} from "./challenge";

// ── isExpenseCategory ────────────────────────────────────────
console.assert(isExpenseCategory("travel") === true,  "FAIL: 'travel' should be a valid category");
console.assert(isExpenseCategory("meals") === true,   "FAIL: 'meals' should be a valid category");
console.assert(isExpenseCategory("unknown") === false, "FAIL: 'unknown' should NOT be a valid category");
console.assert(isExpenseCategory(42) === false,        "FAIL: 42 should NOT be a valid category");
console.assert(isExpenseCategory(null) === false,      "FAIL: null should NOT be a valid category");

// ── validateExpense — happy path ─────────────────────────────
const validRaw = {
  id: "exp-001",
  description: "Team lunch",
  amountCents: 4500,
  category: "meals",
  date: "2026-03-12",
  submittedBy: "alice",
};

const validResult = validateExpense(validRaw);
console.assert(validResult.ok === true, "FAIL: valid raw should produce ok:true");
if (validResult.ok) {
  console.assert(validResult.value.id === "exp-001",       "FAIL: id should be 'exp-001'");
  console.assert(validResult.value.amountCents === 4500,   "FAIL: amountCents should be 4500");
  console.assert(validResult.value.category === "meals",   "FAIL: category should be 'meals'");
}

// ── validateExpense — collects multiple errors ───────────────
const badRaw = {
  id: "",                  // invalid: empty string
  description: "Flight",
  amountCents: -100,       // invalid: negative
  category: "spaceship",  // invalid: unknown category
  date: "not-a-date",     // invalid: wrong format
  submittedBy: "bob",
};

const badResult = validateExpense(badRaw);
console.assert(badResult.ok === false, "FAIL: bad raw should produce ok:false");
if (!badResult.ok) {
  console.assert(
    badResult.error.length >= 3,
    `FAIL: expected ≥3 validation errors, got ${badResult.error.length}`
  );
}

// ── groupByCategory ──────────────────────────────────────────
const expenses: Expense[] = [
  { id: "e1", description: "Laptop",    amountCents: 120000, category: "hardware", date: "2026-03-01", submittedBy: "alice" },
  { id: "e2", description: "Lunch",     amountCents: 2000,   category: "meals",    date: "2026-03-02", submittedBy: "bob"   },
  { id: "e3", description: "Dinner",    amountCents: 3500,   category: "meals",    date: "2026-03-03", submittedBy: "alice" },
  { id: "e4", description: "Train",     amountCents: 8000,   category: "travel",   date: "2026-03-04", submittedBy: "carol" },
];

const grouped = groupByCategory(expenses);
console.assert(grouped.size === 3, `FAIL: expected 3 categories, got ${grouped.size}`);
console.assert((grouped.get("meals") ?? []).length === 2, "FAIL: meals should have 2 entries");
console.assert((grouped.get("hardware") ?? []).length === 1, "FAIL: hardware should have 1 entry");

// ── buildReport ──────────────────────────────────────────────
const report = buildReport(expenses);
console.assert(report.totalCents === 133500, `FAIL: grand total should be 133500, got ${report.totalCents}`);
console.assert(report.summaries.length === 3, `FAIL: should have 3 summaries, got ${report.summaries.length}`);
// summaries sorted by totalCents descending → hardware (120000) first
console.assert(report.summaries[0].category === "hardware", `FAIL: first summary should be 'hardware', got ${report.summaries[0].category}`);
console.assert(report.summaries[0].totalCents === 120000,   "FAIL: hardware totalCents should be 120000");

// ── processRawExpenses ───────────────────────────────────────
const rawEntries: unknown[] = [
  { id: "e5", description: "IDE license", amountCents: 9900, category: "software", date: "2026-03-10", submittedBy: "dave" },
  { id: "",   description: "Mystery",      amountCents: 0,    category: "other",    date: "2026-03-11", submittedBy: "eve"  }, // invalid
  { id: "e7", description: "Hotel",        amountCents: 25000, category: "travel",  date: "2026-03-12", submittedBy: "frank"},
];

const { report: r2, invalid } = processRawExpenses(rawEntries);
console.assert(invalid.length === 1,          `FAIL: expected 1 invalid entry, got ${invalid.length}`);
console.assert(r2.summaries.length === 2,     `FAIL: expected 2 summaries, got ${r2.summaries.length}`);
console.assert(r2.totalCents === 34900,       `FAIL: expected totalCents 34900, got ${r2.totalCents}`);

console.log("All tests passed! ✅");
