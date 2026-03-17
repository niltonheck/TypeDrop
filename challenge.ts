// ============================================================
// Typed Book Club Reading List Builder
// ============================================================
// SCENARIO:
// Members of a book club submit raw book data from a web form.
// Your job is to:
//   1. Parse & validate the raw unknown input
//   2. Derive a ReadingStatus from the data
//   3. Build a sorted, fully typed ReadingList
//
// Solve every TODO. Do NOT use `any` or type assertions (`as`).
// ============================================================

// ------------------------------------------------------------
// § 1 — Core domain types
// ------------------------------------------------------------

/** All genres the book club recognises. */
export type Genre = "fiction" | "non-fiction" | "biography" | "science" | "history";

/**
 * A reading status derived from page progress.
 *
 * - "not-started"  → pagesRead === 0
 * - "in-progress"  → 0 < pagesRead < totalPages
 * - "completed"    → pagesRead >= totalPages
 */
export type ReadingStatus = "not-started" | "in-progress" | "completed";

/** A fully validated and enriched book entry. */
export interface Book {
  id: string;           // non-empty string
  title: string;        // non-empty string
  author: string;       // non-empty string
  genre: Genre;
  totalPages: number;   // positive integer
  pagesRead: number;    // integer, 0 ≤ pagesRead ≤ totalPages
  status: ReadingStatus; // derived — do NOT accept from input
}

// ------------------------------------------------------------
// § 2 — Result type for safe error handling
// ------------------------------------------------------------

export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// TODO: Implement a helper `ok<T>(value: T): Result<T, never>` that
//       wraps a success value.
export function ok<T>(value: T): Result<T, never> {
  // TODO
  throw new Error("Not implemented");
}

// TODO: Implement a helper `err<E>(error: E): Result<never, E>` that
//       wraps a failure value.
export function err<E>(error: E): Result<never, E> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------
// § 3 — Validation helpers
// ------------------------------------------------------------

/**
 * TODO: Implement `isGenre`.
 *
 * Requirements:
 * - Returns `true` (and narrows the type to `Genre`) if `value` is
 *   one of the five recognised genre strings.
 * - Returns `false` otherwise.
 */
export function isGenre(value: unknown): value is Genre {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------
// § 4 — Status derivation
// ------------------------------------------------------------

/**
 * TODO: Implement `deriveStatus`.
 *
 * Requirements (match the ReadingStatus definition above exactly):
 * - pagesRead === 0              → "not-started"
 * - 0 < pagesRead < totalPages  → "in-progress"
 * - pagesRead >= totalPages      → "completed"
 */
export function deriveStatus(pagesRead: number, totalPages: number): ReadingStatus {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------
// § 5 — Raw input parsing
// ------------------------------------------------------------

/** Possible validation error messages. */
export type BookValidationError =
  | "missing-id"
  | "missing-title"
  | "missing-author"
  | "invalid-genre"
  | "invalid-total-pages"
  | "invalid-pages-read"
  | "pages-read-exceeds-total";

/**
 * TODO: Implement `parseBook`.
 *
 * Requirements:
 * 1. `input` is `unknown` — you must narrow every field manually.
 * 2. `id`, `title`, `author` must be non-empty strings.
 *    Return the appropriate error if missing or empty.
 * 3. `genre` must pass `isGenre`. Return `"invalid-genre"` otherwise.
 * 4. `totalPages` must be a positive integer (> 0).
 *    Return `"invalid-total-pages"` otherwise.
 * 5. `pagesRead` must be a non-negative integer (>= 0).
 *    Return `"invalid-pages-read"` otherwise.
 * 6. `pagesRead` must not exceed `totalPages`.
 *    Return `"pages-read-exceeds-total"` otherwise.
 * 7. Derive `status` using `deriveStatus` — do NOT read it from input.
 * 8. On success return `ok(book)`, on first failure return `err(message)`.
 *    (Return the FIRST error encountered in the order listed above.)
 */
export function parseBook(input: unknown): Result<Book, BookValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------
// § 6 — Reading list aggregation
// ------------------------------------------------------------

/** The shape returned by `buildReadingList`. */
export interface ReadingList {
  /** All successfully parsed books, sorted A-Z by title. */
  books: Book[];
  /** Count of books per ReadingStatus. */
  summary: Record<ReadingStatus, number>;
  /** Raw entries that failed validation, preserved for debugging. */
  rejected: Array<{ input: unknown; error: BookValidationError }>;
}

/**
 * TODO: Implement `buildReadingList`.
 *
 * Requirements:
 * 1. Call `parseBook` on every element of `rawEntries`.
 * 2. Accumulate successes into `books` and failures into `rejected`.
 * 3. Sort `books` alphabetically by `title` (case-insensitive).
 * 4. Compute `summary` as a count of books per `ReadingStatus`.
 *    Every status key must be present even if its count is 0.
 * 5. Return the fully typed `ReadingList`.
 */
export function buildReadingList(rawEntries: unknown[]): ReadingList {
  // TODO
  throw new Error("Not implemented");
}
