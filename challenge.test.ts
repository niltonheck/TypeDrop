// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validateExpenseEntry,
  deriveStatus,
  buildExpenseReport,
  AUTO_APPROVE_LIMIT,
  REVIEW_LIMIT,
  type RawExpenseEntry,
  type ExpenseEntry,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const validRaws: RawExpenseEntry[] = [
  {
    employeeId: "emp_001",
    description: "Flight to NYC",
    category: "travel",
    amountUSD: 320,
    submittedAt: "2026-03-01T09:00:00Z",
  },
  {
    employeeId: "emp_002",
    description: "Team lunch",
    category: "meals",
    amountUSD: 45,
    submittedAt: "2026-03-02T12:30:00Z",
  },
  {
    employeeId: "emp_001",
    description: "VS Code license",
    category: "software",
    amountUSD: 10,
    submittedAt: "2026-03-03T08:00:00Z",
  },
  {
    employeeId: "emp_003",
    description: "Laptop",
    category: "equipment",
    amountUSD: 1200,
    submittedAt: "2026-03-04T10:00:00Z",
  },
];

const invalidRaws: RawExpenseEntry[] = [
  // missing employeeId
  {
    employeeId: "",
    description: "Coffee",
    category: "meals",
    amountUSD: 5,
    submittedAt: "2026-03-05T07:00:00Z",
  },
  // bad category
  {
    employeeId: "emp_004",
    description: "Mystery item",
    category: "luxury",
    amountUSD: 99,
    submittedAt: "2026-03-06T11:00:00Z",
  },
  // negative amount
  {
    employeeId: "emp_005",
    description: "Refund?",
    category: "other",
    amountUSD: -20,
    submittedAt: "2026-03-07T14:00:00Z",
  },
  // invalid date
  {
    employeeId: "emp_006",
    description: "Taxi",
    category: "travel",
    amountUSD: 30,
    submittedAt: "not-a-date",
  },
];

// -----------------------------------------------------------
// Test 1: validateExpenseEntry — valid entry succeeds
// -----------------------------------------------------------
const validResult = validateExpenseEntry(validRaws[0]);
console.assert(
  validResult.ok === true,
  "TEST 1 FAILED: valid entry should pass validation"
);
if (validResult.ok) {
  console.assert(
    validResult.value.employeeId === "emp_001",
    "TEST 1b FAILED: employeeId should be 'emp_001'"
  );
  console.assert(
    validResult.value.submittedAt instanceof Date,
    "TEST 1c FAILED: submittedAt should be a Date instance"
  );
}

// -----------------------------------------------------------
// Test 2: validateExpenseEntry — invalid entries fail
// -----------------------------------------------------------
const invalidResults = invalidRaws.map(validateExpenseEntry);
console.assert(
  invalidResults.every((r) => r.ok === false),
  "TEST 2 FAILED: all invalid entries should fail validation"
);

// -----------------------------------------------------------
// Test 3: deriveStatus — correct status derivation
// -----------------------------------------------------------
const makeEntry = (amountUSD: number): ExpenseEntry => ({
  employeeId: "emp_x",
  description: "Test",
  category: "other",
  amountUSD,
  submittedAt: new Date("2026-03-10T00:00:00Z"),
});

const autoEntry    = deriveStatus(makeEntry(AUTO_APPROVE_LIMIT));       // exactly at limit → auto_approved
const reviewEntry  = deriveStatus(makeEntry(AUTO_APPROVE_LIMIT + 1));   // just over → needs_review
const flaggedEntry = deriveStatus(makeEntry(REVIEW_LIMIT + 1));         // just over → flagged

console.assert(
  autoEntry.kind === "auto_approved",
  `TEST 3a FAILED: expected auto_approved, got ${autoEntry.kind}`
);
console.assert(
  reviewEntry.kind === "needs_review",
  `TEST 3b FAILED: expected needs_review, got ${reviewEntry.kind}`
);
console.assert(
  flaggedEntry.kind === "flagged",
  `TEST 3c FAILED: expected flagged, got ${flaggedEntry.kind}`
);
if (flaggedEntry.kind === "flagged") {
  console.assert(
    flaggedEntry.flaggedAmount === REVIEW_LIMIT + 1,
    "TEST 3d FAILED: flaggedAmount should match the entry amount"
  );
}

// -----------------------------------------------------------
// Test 4: buildExpenseReport — structure and aggregation
// -----------------------------------------------------------
const allRaws = [...validRaws, ...invalidRaws];
const report  = buildExpenseReport(allRaws);

console.assert(
  report.entries.length === validRaws.length,
  `TEST 4a FAILED: expected ${validRaws.length} valid entries, got ${report.entries.length}`
);
console.assert(
  report.rejected.length === invalidRaws.length,
  `TEST 4b FAILED: expected ${invalidRaws.length} rejected entries, got ${report.rejected.length}`
);

// sortedByAmount must be descending
const amounts = report.sortedByAmount.map((e) => e.amountUSD);
const isSortedDesc = amounts.every((a, i) => i === 0 || a <= amounts[i - 1]);
console.assert(isSortedDesc, "TEST 4c FAILED: sortedByAmount should be descending");

// grandTotalUSD
const expectedTotal = validRaws.reduce(
  (sum, r) => sum + (r.amountUSD as number),
  0
);
console.assert(
  Math.abs(report.grandTotalUSD - expectedTotal) < 0.001,
  `TEST 4d FAILED: grandTotalUSD expected ${expectedTotal}, got ${report.grandTotalUSD}`
);

// categorySummaries — travel entry should exist with correct total
const travelSummary = report.categorySummaries.find(
  (s) => s.category === "travel"
);
console.assert(
  travelSummary !== undefined,
  "TEST 4e FAILED: travel category summary should exist"
);
if (travelSummary) {
  console.assert(
    travelSummary.totalUSD === 320,
    `TEST 4f FAILED: travel totalUSD expected 320, got ${travelSummary.totalUSD}`
  );
  console.assert(
    travelSummary.count === 1,
    `TEST 4g FAILED: travel count expected 1, got ${travelSummary.count}`
  );
  console.assert(
    travelSummary.byStatus["needs_review"] === 1,
    `TEST 4h FAILED: travel needs_review count expected 1, got ${travelSummary.byStatus["needs_review"]}`
  );
}

// flagged entry (laptop, $1200) should appear as flagged
const laptopEntry = report.entries.find((e) => e.description === "Laptop");
console.assert(
  laptopEntry?.status.kind === "flagged",
  `TEST 4i FAILED: Laptop entry should be flagged, got ${laptopEntry?.status.kind}`
);

console.log("All tests completed. Check assertions above for failures.");
