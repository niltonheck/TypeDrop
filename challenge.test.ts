// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  buildExpenseReport,
  isExpenseCategory,
  isISODateString,
  parseExpense,
} from "./challenge";

// ── Mock Data ────────────────────────────────────────────────

const validRaw1 = {
  id: "exp-001",
  submittedBy: "alice",
  category: "travel",
  description: "Flight to NYC",
  amountCents: 32000,
  date: "2026-06-15",
};

const validRaw2 = {
  id: "exp-002",
  submittedBy: "bob",
  category: "meals",
  description: "Team lunch",
  amountCents: 4800,
  date: "2026-06-16",
};

const validRaw3 = {
  id: "exp-003",
  submittedBy: "alice",
  category: "travel",
  description: "Train tickets",
  amountCents: 8500,
  date: "2026-06-17",
};

const invalidRaw1 = {
  id: "",                  // ❌ empty id
  submittedBy: "charlie",
  category: "snacks",      // ❌ invalid category
  description: "Chips",
  amountCents: -5,         // ❌ negative amount
  date: "2026-06-18",
};

const invalidRaw2 = {
  id: "exp-005",
  submittedBy: "diana",
  category: "equipment",
  description: "Keyboard",
  amountCents: 12000,
  date: "06/19/2026",      // ❌ wrong date format
};

// ── Test 1: isISODateString ──────────────────────────────────
console.assert(
  isISODateString("2026-07-02") === true,
  "Test 1a FAILED: '2026-07-02' should be a valid ISODateString"
);
console.assert(
  isISODateString("07/02/2026") === false,
  "Test 1b FAILED: '07/02/2026' should NOT be a valid ISODateString"
);
console.assert(
  isISODateString(20260702) === false,
  "Test 1c FAILED: number should NOT be a valid ISODateString"
);
console.log("✅ Test 1 passed: isISODateString");

// ── Test 2: isExpenseCategory ────────────────────────────────
console.assert(
  isExpenseCategory("meals") === true,
  "Test 2a FAILED: 'meals' should be a valid ExpenseCategory"
);
console.assert(
  isExpenseCategory("snacks") === false,
  "Test 2b FAILED: 'snacks' should NOT be a valid ExpenseCategory"
);
console.assert(
  isExpenseCategory(null) === false,
  "Test 2c FAILED: null should NOT be a valid ExpenseCategory"
);
console.log("✅ Test 2 passed: isExpenseCategory");

// ── Test 3: parseExpense — valid entry ───────────────────────
const result1 = parseExpense(validRaw1, 0);
console.assert(
  result1.ok === true,
  "Test 3a FAILED: validRaw1 should parse successfully"
);
if (result1.ok) {
  console.assert(
    result1.expense.amountCents === 32000,
    "Test 3b FAILED: amountCents should be 32000"
  );
  console.assert(
    result1.expense.category === "travel",
    "Test 3c FAILED: category should be 'travel'"
  );
}
console.log("✅ Test 3 passed: parseExpense (valid)");

// ── Test 4: parseExpense — invalid entry collects all errors ─
const result2 = parseExpense(invalidRaw1, 2);
console.assert(
  result2.ok === false,
  "Test 4a FAILED: invalidRaw1 should fail parsing"
);
if (!result2.ok) {
  console.assert(
    result2.rawIndex === 2,
    "Test 4b FAILED: rawIndex should be 2"
  );
  console.assert(
    result2.errors.length >= 3,
    `Test 4c FAILED: expected ≥3 errors, got ${result2.errors.length}`
  );
}
console.log("✅ Test 4 passed: parseExpense (invalid, multi-error)");

// ── Test 5: buildExpenseReport — full pipeline ───────────────
const report = buildExpenseReport([
  validRaw1,
  validRaw2,
  validRaw3,
  invalidRaw1,
  invalidRaw2,
]);

console.assert(
  report.validCount === 3,
  `Test 5a FAILED: expected validCount=3, got ${report.validCount}`
);
console.assert(
  report.invalidCount === 2,
  `Test 5b FAILED: expected invalidCount=2, got ${report.invalidCount}`
);
console.assert(
  report.totalCents === 32000 + 4800 + 8500,
  `Test 5c FAILED: expected totalCents=${32000 + 4800 + 8500}, got ${report.totalCents}`
);

// byCategory should be sorted A-Z: ["meals", "travel"]
console.assert(
  report.byCategory.length === 2,
  `Test 5d FAILED: expected 2 categories, got ${report.byCategory.length}`
);
console.assert(
  report.byCategory[0].category === "meals" &&
    report.byCategory[1].category === "travel",
  "Test 5e FAILED: byCategory should be sorted A-Z"
);

const travelSummary = report.byCategory.find((c) => c.category === "travel");
console.assert(
  travelSummary?.count === 2 && travelSummary?.totalCents === 40500,
  `Test 5f FAILED: travel should have count=2, totalCents=40500`
);

console.assert(
  report.parseErrors.length === 2,
  `Test 5g FAILED: expected 2 parseErrors, got ${report.parseErrors.length}`
);
console.log("✅ Test 5 passed: buildExpenseReport (full pipeline)");

console.log("\n🎉 All tests passed!");
