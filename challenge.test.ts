// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  toISBN,
  toMemberID,
  isOverdue,
  calculateFine,
  buildLibraryReport,
  Book,
  FinePolicy,
} from "./challenge";

// --------------- Mock Data -----------------------------------

const TODAY = "2026-10-28";

const POLICY: FinePolicy = {
  overduePerDay: 0.25,
  lostFlatFee: 25.0,
};

const books: Book[] = [
  // Available
  {
    status: "available",
    isbn: toISBN("978-0-06-112008-4"),
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
  },
  // Checked out, NOT overdue (due tomorrow)
  {
    status: "checkedOut",
    isbn: toISBN("978-0-7432-7356-5"),
    title: "1984",
    author: "George Orwell",
    memberId: toMemberID("M001"),
    dueDate: "2026-10-29",
  },
  // Checked out, overdue by 7 days
  {
    status: "checkedOut",
    isbn: toISBN("978-0-14-028329-7"),
    title: "Of Mice and Men",
    author: "John Steinbeck",
    memberId: toMemberID("M001"),
    dueDate: "2026-10-21",
  },
  // Checked out, overdue by 14 days
  {
    status: "checkedOut",
    isbn: toISBN("978-0-06-093546-9"),
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    memberId: toMemberID("M002"),
    dueDate: "2026-10-14",
  },
  // Lost
  {
    status: "lost",
    isbn: toISBN("978-0-7432-7357-2"),
    title: "Brave New World",
    author: "Aldous Huxley",
    memberId: toMemberID("M002"),
  },
];

// --------------- Test 1: isOverdue --------------------------

const overdueBook = books[2] as Book; // "Of Mice and Men", due 2026-10-21
const notOverdueBook = books[1] as Book; // "1984", due 2026-10-29
const availableBook = books[0] as Book;

console.assert(
  isOverdue(overdueBook, TODAY) === true,
  "FAIL Test 1a: 'Of Mice and Men' should be overdue"
);
console.assert(
  isOverdue(notOverdueBook, TODAY) === false,
  "FAIL Test 1b: '1984' should NOT be overdue (due tomorrow)"
);
console.assert(
  isOverdue(availableBook, TODAY) === false,
  "FAIL Test 1c: available book should never be overdue"
);
console.log("Test 1 (isOverdue): passed ✓");

// --------------- Test 2: calculateFine ----------------------

// Available book → $0
console.assert(
  calculateFine(books[0], TODAY, POLICY) === 0,
  "FAIL Test 2a: available book fine should be 0"
);

// Not overdue checked-out book → $0
console.assert(
  calculateFine(books[1], TODAY, POLICY) === 0,
  "FAIL Test 2b: non-overdue book fine should be 0"
);

// Overdue by 7 days → 7 * 0.25 = $1.75
console.assert(
  calculateFine(books[2], TODAY, POLICY) === 1.75,
  `FAIL Test 2c: expected $1.75, got $${calculateFine(books[2], TODAY, POLICY)}`
);

// Overdue by 14 days → 14 * 0.25 = $3.50
console.assert(
  calculateFine(books[3], TODAY, POLICY) === 3.5,
  `FAIL Test 2d: expected $3.50, got $${calculateFine(books[3], TODAY, POLICY)}`
);

// Lost book → flat $25
console.assert(
  calculateFine(books[4], TODAY, POLICY) === 25,
  `FAIL Test 2e: expected $25.00 lost fee, got $${calculateFine(books[4], TODAY, POLICY)}`
);
console.log("Test 2 (calculateFine): passed ✓");

// --------------- Test 3: buildLibraryReport -----------------

const report = buildLibraryReport(books, TODAY, POLICY);

console.assert(report.totalBooks === 5, "FAIL Test 3a: totalBooks should be 5");
console.assert(report.availableCount === 1, "FAIL Test 3b: availableCount should be 1");
console.assert(report.checkedOutCount === 3, "FAIL Test 3c: checkedOutCount should be 3");
console.assert(report.lostCount === 1, "FAIL Test 3d: lostCount should be 1");
console.assert(
  report.memberSummaries.length === 2,
  "FAIL Test 3e: should have 2 member summaries"
);

// Sorted ascending by memberId → M001 first
const m001 = report.memberSummaries[0];
console.assert(m001.checkedOutCount === 2, "FAIL Test 3f: M001 checkedOutCount should be 2");
console.assert(m001.lostCount === 0, "FAIL Test 3g: M001 lostCount should be 0");
// fines: $0 (not overdue) + $1.75 (overdue 7d) = $1.75
console.assert(
  m001.totalFinesDue === 1.75,
  `FAIL Test 3h: M001 totalFinesDue should be 1.75, got ${m001.totalFinesDue}`
);
console.assert(
  m001.overdueTitles.length === 1 && m001.overdueTitles[0] === "Of Mice and Men",
  "FAIL Test 3i: M001 overdueTitles should contain 'Of Mice and Men'"
);

const m002 = report.memberSummaries[1];
console.assert(m002.checkedOutCount === 1, "FAIL Test 3j: M002 checkedOutCount should be 1");
console.assert(m002.lostCount === 1, "FAIL Test 3k: M002 lostCount should be 1");
// fines: $3.50 (overdue 14d) + $25 (lost) = $28.50
console.assert(
  m002.totalFinesDue === 28.5,
  `FAIL Test 3l: M002 totalFinesDue should be 28.50, got ${m002.totalFinesDue}`
);
console.assert(
  m002.overdueTitles.length === 1 && m002.overdueTitles[0] === "The Great Gatsby",
  "FAIL Test 3m: M002 overdueTitles should contain 'The Great Gatsby'"
);

console.log("Test 3 (buildLibraryReport): passed ✓");
console.log("\n✅ All tests passed!");
