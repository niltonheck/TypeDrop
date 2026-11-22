// ============================================================
// Typed Book Lending Library: Checkout, Returns & Overdue Tracker
// ============================================================
// Today's date (inject for deterministic testing):
//   const TODAY: CalendarDate = "2026-11-22";
//
// REQUIREMENTS
// 1. Define a branded CalendarDate type (string brand) so plain strings
//    cannot be passed where a CalendarDate is expected.
// 2. Define a Book type with: id (string), title (string), author (string),
//    genre (Genre), and totalCopies (number).
// 3. Define a discriminated-union LoanStatus:
//      - { status: "checked-out"; dueDate: CalendarDate }
//      - { status: "returned";   returnedOn: CalendarDate }
//      - { status: "overdue";    dueDate: CalendarDate; daysOverdue: number }
// 4. Define a LoanRecord type with: id (string), bookId (string),
//    memberId (string), checkedOutOn (CalendarDate), and a LoanStatus.
// 5. Implement checkoutBook() — creates a new LoanRecord with status
//    "checked-out". The due date is loanDays after checkedOutOn.
// 6. Implement returnBook() — returns a NEW LoanRecord (do not mutate)
//    with status "returned" and the supplied returnedOn date.
// 7. Implement markOverdue() — given today's date, returns a NEW LoanRecord
//    with status "overdue" and the correct daysOverdue count.
//    Only "checked-out" loans whose dueDate < today may be marked overdue.
//    Throw a TypeError for any other loan state.
// 8. Implement getOverdueReport() — given a list of LoanRecords and today's
//    CalendarDate, return an OverdueReport. See the OverdueReport type below.
// ============================================================

// --- Utility -------------------------------------------------

/** ISO-8601 calendar date string, e.g. "2026-11-22" */
export type CalendarDate = string & { readonly __brand: "CalendarDate" };

/**
 * Helper already provided — use this to create CalendarDate values
 * without a type assertion in your own code.
 */
export function toCalendarDate(raw: string): CalendarDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new TypeError(`Invalid calendar date: "${raw}"`);
  }
  return raw as CalendarDate; // single assertion kept inside the helper
}

/**
 * Adds `days` to a CalendarDate and returns a new CalendarDate.
 * Already implemented — use freely.
 */
export function addDays(date: CalendarDate, days: number): CalendarDate {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10) as CalendarDate;
}

/**
 * Returns the number of calendar days between two dates.
 * Positive when `later` is after `earlier`.
 * Already implemented — use freely.
 */
export function daysBetween(earlier: CalendarDate, later: CalendarDate): number {
  const msPerDay = 86_400_000;
  return Math.round(
    (new Date(later).getTime() - new Date(earlier).getTime()) / msPerDay
  );
}

// --- Domain types --------------------------------------------

export type Genre =
  | "fiction"
  | "non-fiction"
  | "science"
  | "history"
  | "biography"
  | "fantasy";

// TODO: Define the Book type (Requirement 2)
export type Book = {
  // ... fill this in
};

// TODO: Define the LoanStatus discriminated union (Requirement 3)
export type LoanStatus = never; // replace `never` with your union

// TODO: Define the LoanRecord type (Requirement 4)
export type LoanRecord = {
  // ... fill this in
};

// --- OverdueReport type (provided — do not change) -----------

export type OverdueReport = {
  /** Total number of overdue loans in the input list */
  totalOverdue: number;
  /** The single most-overdue loan record, or null if none are overdue */
  mostOverdue: LoanRecord | null;
  /** All overdue loan records, sorted by daysOverdue descending */
  overdueLoans: ReadonlyArray<LoanRecord>;
};

// --- Functions to implement ----------------------------------

/**
 * Creates a new LoanRecord with status "checked-out".
 *
 * @param params.id          Unique loan ID
 * @param params.book        The book being checked out
 * @param params.memberId    The member checking out the book
 * @param params.checkedOutOn  The date of checkout
 * @param params.loanDays    How many days the member has to return the book
 */
// TODO: Implement checkoutBook (Requirement 5)
export function checkoutBook(params: {
  id: string;
  book: Book;
  memberId: string;
  checkedOutOn: CalendarDate;
  loanDays: number;
}): LoanRecord {
  throw new Error("Not implemented");
}

/**
 * Returns a new LoanRecord with status "returned".
 * Must not mutate the original record.
 *
 * @param loan        The existing checked-out loan
 * @param returnedOn  The date the book was returned
 */
// TODO: Implement returnBook (Requirement 6)
export function returnBook(loan: LoanRecord, returnedOn: CalendarDate): LoanRecord {
  throw new Error("Not implemented");
}

/**
 * Returns a new LoanRecord with status "overdue".
 * Must not mutate the original record.
 * Throws TypeError if the loan is not currently "checked-out"
 * OR if dueDate >= today.
 *
 * @param loan   The existing checked-out loan
 * @param today  Today's date (used to compute daysOverdue)
 */
// TODO: Implement markOverdue (Requirement 7)
export function markOverdue(loan: LoanRecord, today: CalendarDate): LoanRecord {
  throw new Error("Not implemented");
}

/**
 * Scans a list of LoanRecords and builds an OverdueReport.
 * Only records with status "overdue" are included in the report.
 *
 * @param loans  All loan records in the system
 * @param today  Today's date (for context — no re-computation needed)
 */
// TODO: Implement getOverdueReport (Requirement 8)
export function getOverdueReport(
  loans: ReadonlyArray<LoanRecord>,
  today: CalendarDate
): OverdueReport {
  throw new Error("Not implemented");
}
