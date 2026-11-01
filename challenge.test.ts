// challenge.test.ts
import {
  validateExpense,
  applycat,
  applyCapFn,
  buildEmployeeSummaries,
  DEFAULT_CAPS,
  type RawExpense,
  type ValidationResult,
  type EmployeeSummary,
} from "./challenge";

// Re-export applycat under the correct name since it's exported as `applycat` (typo-safe alias)
// Actually import applycat directly:
import { applycat as applyCap } from "./challenge";

// ----------------------------
// Mock Data
// ----------------------------

const raw1: RawExpense = {
  id: "e1",
  employeeId: "emp-A",
  category: "travel",
  amountUSD: 200,
  description: "Flight to NYC",
  submittedAt: "2026-10-15",
};

const raw2: RawExpense = {
  id: "e2",
  employeeId: "emp-A",
  category: "meals",
  amountUSD: 120,          // exceeds $75 cap
  description: "Team dinner",
  submittedAt: "2026-10-16",
};

const raw3: RawExpense = {
  id: "e3",
  employeeId: "emp-B",
  category: "gadget",      // invalid category
  amountUSD: 300,
  description: "Wireless mouse",
  submittedAt: "2026-10-17",
};

const raw4: RawExpense = {
  id: "e4",
  employeeId: "emp-B",
  category: "software",
  amountUSD: -50,          // invalid amount
  description: "Negative entry",
  submittedAt: "2026-10-18",
};

const raw5: RawExpense = {
  id: "e5",
  employeeId: "emp-B",
  category: "hardware",
  amountUSD: 800,
  description: "Monitor",
  submittedAt: "not-a-date", // invalid date
};

const raw6: RawExpense = {
  id: "e6",
  employeeId: "emp-B",
  category: "hardware",
  amountUSD: 1200,         // exceeds $1000 cap
  description: "Standing desk",
  submittedAt: "2026-10-20",
};

// ----------------------------
// Test 1: validateExpense — valid entry passes
// ----------------------------
const result1: ValidationResult = validateExpense(raw1);
console.assert(result1.ok === true, "TEST 1 FAILED: raw1 should be valid");
if (result1.ok) {
  console.assert(
    result1.expense.category === "travel",
    "TEST 1b FAILED: category should be 'travel'"
  );
  console.assert(
    result1.expense.submittedAt instanceof Date,
    "TEST 1c FAILED: submittedAt should be a Date object"
  );
}

// ----------------------------
// Test 2: validateExpense — invalid category is caught
// ----------------------------
const result3: ValidationResult = validateExpense(raw3);
console.assert(result3.ok === false, "TEST 2 FAILED: raw3 should fail validation");
if (!result3.ok) {
  const catFailure = result3.failures.find((f) => f.reason === "invalid_category");
  console.assert(catFailure !== undefined, "TEST 2b FAILED: should have invalid_category failure");
}

// ----------------------------
// Test 3: validateExpense — multiple failures collected
// ----------------------------
const multiFailRaw: RawExpense = {
  id: "e99",
  employeeId: "emp-Z",
  category: "unknown",
  amountUSD: 0,
  description: "Bad entry",
  submittedAt: "garbage",
};
const result99: ValidationResult = validateExpense(multiFailRaw);
console.assert(result99.ok === false, "TEST 3 FAILED: multi-fail entry should be invalid");
if (!result99.ok) {
  console.assert(
    result99.failures.length === 3,
    `TEST 3b FAILED: expected 3 failures, got ${result99.failures.length}`
  );
}

// ----------------------------
// Test 4: applycat — cap is applied correctly
// ----------------------------
const validMeal: RawExpense = { ...raw2 };
const mealResult = validateExpense(validMeal);
if (mealResult.ok) {
  const reimbursed = applyCap(mealResult.expense, DEFAULT_CAPS);
  console.assert(
    reimbursed === 75,
    `TEST 4 FAILED: meals capped at $75, got $${reimbursed}`
  );
}

// ----------------------------
// Test 5: buildEmployeeSummaries — end-to-end shape
// ----------------------------
const summaries: EmployeeSummary[] = buildEmployeeSummaries([
  raw1, raw2, raw3, raw4, raw5, raw6,
]);

const empA = summaries.find((s) => s.employeeId === "emp-A");
const empB = summaries.find((s) => s.employeeId === "emp-B");

console.assert(empA !== undefined, "TEST 5a FAILED: emp-A summary missing");
console.assert(empB !== undefined, "TEST 5b FAILED: emp-B summary missing");

if (empA) {
  // emp-A has 2 valid expenses: travel $200 (cap 1500) + meals $120 (cap 75)
  console.assert(
    empA.grandTotalSubmitted === 320,
    `TEST 5c FAILED: emp-A grandTotalSubmitted should be 320, got ${empA.grandTotalSubmitted}`
  );
  console.assert(
    empA.grandTotalReimbursed === 275,  // 200 + 75
    `TEST 5d FAILED: emp-A grandTotalReimbursed should be 275, got ${empA.grandTotalReimbursed}`
  );
  console.assert(
    empA.rejectedCount === 0,
    `TEST 5e FAILED: emp-A rejectedCount should be 0, got ${empA.rejectedCount}`
  );
}

if (empB) {
  // emp-B: raw3 (bad category), raw4 (bad amount), raw5 (bad date) → 3 rejected
  // raw6: hardware $1200, capped at $1000 → 1 valid
  console.assert(
    empB.rejectedCount === 3,
    `TEST 5f FAILED: emp-B rejectedCount should be 3, got ${empB.rejectedCount}`
  );
  console.assert(
    empB.grandTotalSubmitted === 1200,
    `TEST 5g FAILED: emp-B grandTotalSubmitted should be 1200, got ${empB.grandTotalSubmitted}`
  );
  console.assert(
    empB.grandTotalReimbursed === 1000,
    `TEST 5h FAILED: emp-B grandTotalReimbursed should be 1000, got ${empB.grandTotalReimbursed}`
  );
}

console.log("All tests passed! ✅");
