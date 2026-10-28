// ============================================================
// Typed Library Book Checkout Tracker
// ============================================================
// You're building the checkout desk software for a public library.
// Books are checked out and returned by members, and you need to
// track availability, compute overdue fines, and produce a
// per-member borrowing summary — with the compiler enforcing every
// status, field name, and summary shape.
// ============================================================

// --------------- Domain Types --------------------------------

/** The ISBN is a branded string so raw strings can't slip through. */
type ISBN = string & { readonly __brand: "ISBN" };

/** Member IDs are also branded. */
type MemberID = string & { readonly __brand: "MemberID" };

/** Helper to create branded values — only call from trusted data entry points. */
export function toISBN(raw: string): ISBN {
  return raw as ISBN;
}
export function toMemberID(raw: string): MemberID {
  return raw as MemberID;
}

// --------------- Book Status ---------------------------------

/** A book that is sitting on the shelf and available to borrow. */
export type AvailableBook = {
  readonly status: "available";
  readonly isbn: ISBN;
  readonly title: string;
  readonly author: string;
};

/** A book that is currently checked out to a member. */
export type CheckedOutBook = {
  readonly status: "checkedOut";
  readonly isbn: ISBN;
  readonly title: string;
  readonly author: string;
  readonly memberId: MemberID;
  /** ISO date string, e.g. "2026-10-01" */
  readonly dueDate: string;
};

/** A book that has been reported lost by the member. */
export type LostBook = {
  readonly status: "lost";
  readonly isbn: ISBN;
  readonly title: string;
  readonly author: string;
  readonly memberId: MemberID;
};

/** Discriminated union of all possible book states. */
export type Book = AvailableBook | CheckedOutBook | LostBook;

// --------------- Fine Policy ---------------------------------

/** Fine rates in dollars. */
export type FinePolicy = {
  readonly overduePerDay: number;  // charged per calendar day overdue
  readonly lostFlatFee: number;    // flat fee for a lost book
};

// --------------- Summary Types ------------------------------

/** Borrowing summary produced for a single member. */
export type MemberSummary = {
  readonly memberId: MemberID;
  /** Total number of books currently checked out (not lost). */
  readonly checkedOutCount: number;
  /** Total number of books reported lost. */
  readonly lostCount: number;
  /** Total fines owed in dollars (overdue + lost), rounded to 2 decimal places. */
  readonly totalFinesDue: number;
  /** Titles of all overdue books (dueDate strictly before today). */
  readonly overdueTitles: string[];
};

/** Overall library status report. */
export type LibraryReport = {
  readonly totalBooks: number;
  readonly availableCount: number;
  readonly checkedOutCount: number;
  readonly lostCount: number;
  /** One summary entry per member who has at least one checked-out or lost book. */
  readonly memberSummaries: MemberSummary[];
};

// ============================================================
// TASK 1 — Type narrowing helper
// ============================================================
// Implement a type guard that returns true when `book` is overdue.
// A book is overdue when it is checked out AND its dueDate is
// strictly before `today` (both are ISO date strings, plain string
// comparison is fine for ISO dates).
//
// Requirements:
//   1. The return type must be a type predicate narrowing to CheckedOutBook.
//   2. Do not use `any` or type assertions.

export function isOverdue(book: Book, today: string): book is CheckedOutBook {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// TASK 2 — Fine calculator
// ============================================================
// Calculate the fine owed for a single book given today's date
// and the library's fine policy.
//
// Requirements:
//   1. Return 0 for available books.
//   2. Return `policy.lostFlatFee` for lost books.
//   3. For checked-out books, return `policy.overduePerDay * daysOverdue`
//      where daysOverdue = max(0, calendar days between dueDate and today).
//      Use Math.round on the final dollar amount to 2 decimal places
//      (hint: Math.round(x * 100) / 100).
//   4. Do not use `any` or type assertions.

export function calculateFine(
  book: Book,
  today: string,
  policy: FinePolicy
): number {
  // TODO: implement
  throw new Error("Not implemented");
}

// ============================================================
// TASK 3 — Build library report
// ============================================================
// Given the full catalogue of books, today's date, and the fine
// policy, produce a LibraryReport.
//
// Requirements:
//   1. Count totals across all three statuses.
//   2. Produce exactly one MemberSummary per member who has at
//      least one checked-out or lost book.
//   3. Each MemberSummary must include:
//        - checkedOutCount  (books with status "checkedOut")
//        - lostCount        (books with status "lost")
//        - totalFinesDue    (sum of calculateFine for all their books,
//                            rounded to 2 decimal places overall)
//        - overdueTitles    (titles of overdue checked-out books, in
//                            the order they appear in `books`)
//   4. memberSummaries should be sorted ascending by memberId string.
//   5. Do not use `any` or type assertions.

export function buildLibraryReport(
  books: Book[],
  today: string,
  policy: FinePolicy
): LibraryReport {
  // TODO: implement
  throw new Error("Not implemented");
}
