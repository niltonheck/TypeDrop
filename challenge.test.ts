// challenge.test.ts
import {
  toCalendarDate,
  addDays,
  checkoutBook,
  returnBook,
  markOverdue,
  getOverdueReport,
  Book,
  LoanRecord,
} from "./challenge";

// ── Mock data ────────────────────────────────────────────────

const TODAY = toCalendarDate("2026-11-22");

const book1: Book = {
  id: "b-001",
  title: "The TypeScript Handbook",
  author: "Microsoft",
  genre: "science",
  totalCopies: 3,
};

const book2: Book = {
  id: "b-002",
  title: "Effective TypeScript",
  author: "Dan Vanderkam",
  genre: "science",
  totalCopies: 2,
};

// ── Test 1: checkoutBook creates a correct LoanRecord ────────

const loan1 = checkoutBook({
  id: "loan-001",
  book: book1,
  memberId: "member-42",
  checkedOutOn: toCalendarDate("2026-11-10"),
  loanDays: 14,
});

console.assert(loan1.id === "loan-001", "Test 1a: loan id should be 'loan-001'");
console.assert(loan1.bookId === "b-001", "Test 1b: bookId should be 'b-001'");
console.assert(loan1.memberId === "member-42", "Test 1c: memberId should be 'member-42'");
console.assert(
  loan1.status.status === "checked-out",
  "Test 1d: status should be 'checked-out'"
);
console.assert(
  (loan1.status as { status: "checked-out"; dueDate: string }).dueDate === "2026-11-24",
  "Test 1e: dueDate should be 2026-11-24 (10 Nov + 14 days)"
);

// ── Test 2: returnBook produces a returned record ────────────

const returnedLoan = returnBook(loan1, toCalendarDate("2026-11-20"));

console.assert(
  returnedLoan.status.status === "returned",
  "Test 2a: status should be 'returned'"
);
console.assert(
  (returnedLoan.status as { status: "returned"; returnedOn: string }).returnedOn ===
    "2026-11-20",
  "Test 2b: returnedOn should be 2026-11-20"
);
// Original must not be mutated
console.assert(
  loan1.status.status === "checked-out",
  "Test 2c: original loan should still be 'checked-out'"
);

// ── Test 3: markOverdue computes daysOverdue correctly ───────

// loan1 dueDate = 2026-11-24, but let's create an overdue loan:
const overdueLoan = checkoutBook({
  id: "loan-002",
  book: book2,
  memberId: "member-7",
  checkedOutOn: toCalendarDate("2026-11-01"),
  loanDays: 7, // due 2026-11-08 → 14 days overdue on 2026-11-22
});

const markedOverdue = markOverdue(overdueLoan, TODAY);

console.assert(
  markedOverdue.status.status === "overdue",
  "Test 3a: status should be 'overdue'"
);
console.assert(
  (markedOverdue.status as { status: "overdue"; daysOverdue: number }).daysOverdue === 14,
  "Test 3b: daysOverdue should be 14"
);

// ── Test 4: markOverdue throws on non-checked-out loan ───────

let threw = false;
try {
  markOverdue(returnedLoan, TODAY);
} catch (e) {
  threw = e instanceof TypeError;
}
console.assert(threw, "Test 4: markOverdue should throw TypeError for a returned loan");

// ── Test 5: getOverdueReport aggregates correctly ────────────

const loans: ReadonlyArray<LoanRecord> = [
  loan1,          // checked-out, NOT overdue (due 2026-11-24)
  returnedLoan,   // returned
  markedOverdue,  // overdue, 14 days
  // a second overdue loan
  (() => {
    const l = checkoutBook({
      id: "loan-003",
      book: book1,
      memberId: "member-99",
      checkedOutOn: toCalendarDate("2026-10-01"),
      loanDays: 7, // due 2026-10-08 → 45 days overdue on 2026-11-22
    });
    return markOverdue(l, TODAY);
  })(),
];

const report = getOverdueReport(loans, TODAY);

console.assert(report.totalOverdue === 2, "Test 5a: totalOverdue should be 2");
console.assert(
  report.mostOverdue?.id === "loan-003",
  "Test 5b: mostOverdue should be loan-003 (45 days)"
);
console.assert(
  report.overdueLoans.length === 2,
  "Test 5c: overdueLoans should contain 2 records"
);
console.assert(
  report.overdueLoans[0]?.id === "loan-003",
  "Test 5d: overdueLoans[0] should be loan-003 (sorted descending)"
);

console.log("All tests passed! ✅");
