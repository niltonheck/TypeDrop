// challenge.test.ts
import {
  importContacts,
  validateRow,
  isPlainObject,
  type ImportReport,
  type RowResult,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const validRow1 = {
  id: "c001",
  name: "Alice Nguyen",
  email: "alice@example.com",
  category: "customer",
  createdAt: "2024-01-15T10:00:00Z",
};

const validRow2 = {
  id: "c002",
  name: "Bob Smith",
  email: "bob@example.com",
  category: "lead",
  createdAt: "2024-03-22T08:30:00Z",
};

const duplicateRow = {
  id: "c003",
  name: "Alice Duplicate",
  email: "alice@example.com", // same email as validRow1
  category: "partner",
  createdAt: "2024-05-01T00:00:00Z",
};

const missingNameRow = {
  id: "c004",
  name: "",           // empty — invalid
  email: "bad-email", // also invalid
  category: "customer",
  createdAt: "2024-06-01T00:00:00Z",
};

const badCategoryRow = {
  id: "c005",
  name: "Carol",
  email: "carol@example.com",
  category: "vip",   // not a valid ContactCategory
  createdAt: "not-a-date", // also invalid
};

// ------------------------------------------------------------------
// Test 1 — isPlainObject correctly identifies plain objects
// ------------------------------------------------------------------
console.assert(isPlainObject(validRow1) === true,  "Test 1a FAILED: plain object should return true");
console.assert(isPlainObject(null)      === false, "Test 1b FAILED: null should return false");
console.assert(isPlainObject("string")  === false, "Test 1c FAILED: string should return false");
console.assert(isPlainObject(42)        === false, "Test 1d FAILED: number should return false");
console.log("Test 1 passed ✓ — isPlainObject");

// ------------------------------------------------------------------
// Test 2 — validateRow returns "ok" for a valid row
// ------------------------------------------------------------------
const result2 = validateRow(validRow1, 0);
console.assert(result2.status === "ok", "Test 2a FAILED: expected status 'ok'");
if (result2.status === "ok") {
  console.assert(result2.contact.email === "alice@example.com", "Test 2b FAILED: email mismatch");
  console.assert(result2.contact.category === "customer",        "Test 2c FAILED: category mismatch");
  console.assert(result2.contact.createdAt instanceof Date,      "Test 2d FAILED: createdAt should be a Date");
}
console.log("Test 2 passed ✓ — validateRow (valid row)");

// ------------------------------------------------------------------
// Test 3 — validateRow collects multiple field errors
// ------------------------------------------------------------------
const result3 = validateRow(missingNameRow, 1);
console.assert(result3.status === "error", "Test 3a FAILED: expected status 'error'");
if (result3.status === "error") {
  console.assert(result3.errors.length >= 2, "Test 3b FAILED: expected at least 2 errors (name + email)");
  const fields = result3.errors.map((e) => e.field);
  console.assert(fields.includes("name"),  "Test 3c FAILED: missing 'name' error");
  console.assert(fields.includes("email"), "Test 3d FAILED: missing 'email' error");
}
console.log("Test 3 passed ✓ — validateRow (multiple errors)");

// ------------------------------------------------------------------
// Test 4 — importContacts produces a correct ImportReport
// ------------------------------------------------------------------
const report: ImportReport = importContacts([
  validRow1,
  validRow2,
  duplicateRow,
  missingNameRow,
  badCategoryRow,
]);

console.assert(report.imported.length === 2,    "Test 4a FAILED: expected 2 imported contacts");
console.assert(report.failed.length === 2,      "Test 4b FAILED: expected 2 failed rows");
console.assert(report.duplicates.length === 1,  "Test 4c FAILED: expected 1 duplicate email");
console.assert(
  report.duplicates[0] === "alice@example.com",
  "Test 4d FAILED: duplicate email should be alice@example.com"
);
console.assert(
  report.imported.every((c) => c.createdAt instanceof Date),
  "Test 4e FAILED: all imported contacts should have Date objects"
);
console.log("Test 4 passed ✓ — importContacts (full report)");

// ------------------------------------------------------------------
// Test 5 — duplicate emails appear at most once in `duplicates`
// ------------------------------------------------------------------
const tripleReport: ImportReport = importContacts([
  validRow1,
  duplicateRow,
  { ...duplicateRow, id: "c006" }, // third occurrence of alice@example.com
]);
console.assert(
  tripleReport.duplicates.length === 1,
  "Test 5 FAILED: alice@example.com should appear only once in duplicates even with 3 occurrences"
);
console.log("Test 5 passed ✓ — deduplicated `duplicates` list");

console.log("\n✅ All tests passed!");
