// ============================================================
// challenge.ts — Typed Paginated API Client with Retry & Result Aggregation
// ============================================================
// Requirements:
//  1. Define a `Result<T, E>` discriminated union with `Ok` and `Err` variants.
//  2. Define `Page<T>` to represent one page of API data (items + pagination meta).
//  3. Define `FetchPage<T>` — a typed async callback that accepts a cursor and
//     returns `Promise<Result<Page<T>, ApiError>>`.
//  4. Implement `withRetry<T>` — wraps any `() => Promise<Result<T, ApiError>>`
//     and retries up to `maxRetries` times on `Err` results, using exponential
//     back-off (delay doubles each attempt: 100 ms, 200 ms, 400 ms …).
//     Returns the first `Ok` result, or the final `Err` after all retries.
//  5. Implement `fetchAllPages<T>` — drives the pagination loop:
//       a. Starts at cursor `null` (first page).
//       b. Wraps each `FetchPage<T>` call with `withRetry` (maxRetries = 3).
//       c. Stops when `page.nextCursor` is `null`.
//       d. Returns `Result<T[], ApiError>` — all items collected across pages,
//          or the first error that survived all retries.
//  6. Implement `aggregateRecords<T extends Record<string, unknown>>(
//       items: T[],
//       groupKey: keyof T
//     ): Map<string, T[]>` — groups collected items by the value at `groupKey`
//       (coerce the key's value to `string`). Returns a `Map` where each entry
//       holds the subset of items sharing that key value.
// ============================================================

// --- 1. Result type ---
export type Ok<T> = { readonly tag: "ok"; readonly value: T };
export type Err<E> = { readonly tag: "err"; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

// Convenience constructors (implement these)
export function ok<T>(value: T): Ok<T> {
  // TODO
  throw new Error("Not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO
  throw new Error("Not implemented");
}

// --- 2. API domain types ---
export type ApiError = {
  readonly code: number;
  readonly message: string;
};

export type Page<T> = {
  readonly items: T[];
  readonly nextCursor: string | null; // null means "last page"
};

// --- 3. FetchPage callback type ---
// A function that takes a cursor (null = first page) and returns a Result-wrapped Page.
export type FetchPage<T> = (
  cursor: string | null
) => Promise<Result<Page<T>, ApiError>>;

// --- 4. withRetry ---
// Requirement: retries on Err up to maxRetries times with exponential back-off.
// Base delay = 100 ms; delay doubles each retry (100, 200, 400, …).
// Returns first Ok encountered, or final Err after exhausting retries.
export async function withRetry<T>(
  fn: () => Promise<Result<T, ApiError>>,
  maxRetries: number
): Promise<Result<T, ApiError>> {
  // TODO
  throw new Error("Not implemented");
}

// --- 5. fetchAllPages ---
// Requirement: drives the full pagination loop using withRetry on each page fetch.
// Collects all items into a flat array; returns Result<T[], ApiError>.
export async function fetchAllPages<T>(
  fetchPage: FetchPage<T>
): Promise<Result<T[], ApiError>> {
  // TODO
  throw new Error("Not implemented");
}

// --- 6. aggregateRecords ---
// Requirement: groups items by the string value of groupKey.
// T must extend Record<string, unknown> so keyof T is safe.
export function aggregateRecords<T extends Record<string, unknown>>(
  items: T[],
  groupKey: keyof T
): Map<string, T[]> {
  // TODO
  throw new Error("Not implemented");
}
