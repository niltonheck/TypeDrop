// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  isExpenseCategory,
  validateExpenseEntry,
  buildExpenseReport,
  type ExpenseCategory,
  type ExpenseReport,
} from "./challenge";

// ── Mock data ────────────────────────────────────────────────

const validRaw1 = {
  id: "exp-001",
  employeeId: "emp-42",
  category: "travel",
  amountCents: 15000,
  date: "2026-05-01",
  description: "Flight to NYC",
};

const validRaw2 = {
  id: "exp-002",
  employeeId: "emp-42",
  category: "meals",
  amountCents: 2400,
  date: "2026-05-02",
  description: "Team lunch",
};

const validRaw3 = {
  id: "exp-003",
  employeeId: "emp-99",
  category: "meals",
  amountCents: 800,
  date: "2026-05-03",
  description: "Coffee",
};

const validRaw4 = {
  id: "exp-004",
  employeeId: "emp-99",
  category: "equipment",
  amountCents: 49900,
  date: "2026-05-04",
  description: "USB-C hub",
};

// Invalid entries
const invalidMissingId = {
  id: "",
  employeeId: "emp-10",
  category: "other",
  amountCents: 500,
  date: "2026-05-01",
  description: "Misc",
};

const invalidBadCategory = {
  id: "exp-005",
  employeeId: "emp-10",
  category: "luxury",          // not a valid category
  amountCents: 5000,
  date: "2026-05-01",
  description: "Spa day",
};

const invalidNegativeAmount = {
  id: "exp-006",
  employeeId: "emp-10",
  category: "accommodation",
  amountCents: -100,            // must be > 0
  date: "2026-05-02",
  description: "Hotel refund",
};

const invalidBadDate = {
  id: "exp-007",
  employeeId: "emp-10",
  category: "travel",
  amountCents: 3000,
  date: "05/02/2026",           // wrong format
  description: "Taxi",
};

const notAnObject = "just a string";

// ── Tests ────────────────────────────────────────────────────

// T1: isExpenseCategory narrows correctly
const categories: ExpenseCategory[] = [
  "travel", "meals", "accommodation", "equipment", "other",
];
console.assert(
  categories.every(isExpenseCategory),
  "T1a FAILED: all valid categories should return true"
);
console.assert(
  !isExpenseCategory("luxury") && !isExpenseCategory(42) && !isExpenseCategory(null),
  "T1b FAILED: invalid values should return false"
);

// T2: validateExpenseEntry succeeds for valid input
const r1 = validateExpenseEntry(validRaw1);
console.assert(
  r1.kind === "success" && r1.entry.amountCents === 15000,
  "T2 FAILED: valid entry should produce a success result with correct amountCents"
);

// T3: validateExpenseEntry fails for each invalid case
const failMissingId = validateExpenseEntry(invalidMissingId);
const failBadCat    = validateExpenseEntry(invalidBadCategory);
const failNegAmt    = validateExpenseEntry(invalidNegativeAmount);
const failBadDate   = validateExpenseEntry(invalidBadDate);
const failNotObj    = validateExpenseEntry(notAnObject);
console.assert(
  [failMissingId, failBadCat, failNegAmt, failBadDate, failNotObj].every(
    (r) => r.kind === "failure"
  ),
  "T3 FAILED: every invalid entry should produce a failure result"
);

// T4: buildExpenseReport aggregates correctly
const report: ExpenseReport = buildExpenseReport([
  validRaw1, validRaw2, validRaw3, validRaw4,
  invalidMissingId, invalidBadCategory,
]);

console.assert(
  report.entries.length === 4,
  `T4a FAILED: expected 4 valid entries, got ${report.entries.length}`
);
console.assert(
  report.failures.length === 2,
  `T4b FAILED: expected 2 failures, got ${report.failures.length}`
);
console.assert(
  report.grandTotalCents === 15000 + 2400 + 800 + 49900,
  `T4c FAILED: expected grandTotalCents ${15000 + 2400 + 800 + 49900}, got ${report.grandTotalCents}`
);

// T5: categorySummary has every category key and correct sub-totals
const summary = report.categorySummary;
const allKeys: ExpenseCategory[] = [
  "travel", "meals", "accommodation", "equipment", "other",
];
console.assert(
  allKeys.every((k) => k in summary),
  "T5a FAILED: categorySummary must contain every ExpenseCategory key"
);
console.assert(
  summary.meals.totalCents === 2400 + 800 && summary.meals.count === 2,
  `T5b FAILED: meals totalCents should be ${2400 + 800} and count 2`
);
console.assert(
  summary.accommodation.totalCents === 0 && summary.accommodation.count === 0,
  "T5c FAILED: accommodation should have totalCents 0 and count 0"
);

console.log("All tests passed! ✅");
