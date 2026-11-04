// ============================================================
// Typed API Response Paginator with Result Accumulation
// ============================================================
// Your job is to implement a generic paginator that:
//   1. Fetches pages from a typed API one at a time (or in bounded batches)
//   2. Wraps every page fetch in a Result<T, E> so failures don't throw
//   3. Accumulates successes and collects failures independently
//   4. Returns a typed PaginationSummary the compiler fully enforces
//
// Rules:
//   - No `any`, no `as`, no non-null assertions (!), no type-assertion casts
//   - All types must be inferred or explicitly declared — no implicit unknowns
//   - Use strict: true compatible code throughout
// ============================================================

// -----------------------------------------------------------
// 1. Result<T, E> — a discriminated union for safe error handling
// -----------------------------------------------------------

export type Ok<T> = { readonly status: "ok"; readonly value: T };
export type Err<E> = { readonly status: "err"; readonly error: E };

/** A Result is either a successful value or a typed error. */
export type Result<T, E> = Ok<T> | Err<E>;

/** Constructor helpers — implement these two. */
export function ok<T>(value: T): Ok<T> {
  // TODO: return an Ok<T>
  throw new Error("Not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO: return an Err<E>
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 2. Page shapes
// -----------------------------------------------------------

/** A single page returned by the API. */
export interface ApiPage<TItem> {
  readonly page: number;
  readonly totalPages: number;
  readonly items: ReadonlyArray<TItem>;
}

/** The error shape returned when a page fetch fails. */
export interface PageFetchError {
  readonly page: number;
  readonly reason: string;
}

// -----------------------------------------------------------
// 3. Fetcher type
// -----------------------------------------------------------

/**
 * A function that fetches a single page.
 * It must return a Promise that ALWAYS resolves (never rejects) —
 * errors are represented as Err<PageFetchError>.
 *
 * Requirement 3a: fetchPage must be generic over TItem so that
 * different paginators can work with different item shapes.
 */
export type PageFetcher<TItem> = (
  page: number
) => Promise<Result<ApiPage<TItem>, PageFetchError>>;

// -----------------------------------------------------------
// 4. PaginationSummary — the final accumulation shape
// -----------------------------------------------------------

/**
 * Requirement 4a: PaginationSummary must be generic over TItem.
 * Requirement 4b: `items` holds every successfully fetched item (all pages flattened).
 * Requirement 4c: `failures` holds every PageFetchError (one per failed page).
 * Requirement 4d: `totalPagesAttempted` is the count of pages we tried to fetch.
 * Requirement 4e: `outcome` is a discriminated literal:
 *   - "full"    → every page succeeded
 *   - "partial" → at least one page succeeded AND at least one failed
 *   - "empty"   → every attempted page failed (zero items)
 */
export interface PaginationSummary<TItem> {
  readonly items: ReadonlyArray<TItem>;
  readonly failures: ReadonlyArray<PageFetchError>;
  readonly totalPagesAttempted: number;
  readonly outcome: "full" | "partial" | "empty";
}

// -----------------------------------------------------------
// 5. Core paginator — implement this
// -----------------------------------------------------------

/**
 * Fetches ALL pages of a paginated API sequentially, starting at page 1.
 *
 * Algorithm:
 *   - Fetch page 1 to learn `totalPages`.
 *   - If page 1 fails, immediately return a summary with outcome "empty".
 *   - Fetch pages 2…totalPages sequentially.
 *   - Accumulate items from Ok results; collect errors from Err results.
 *   - Derive `outcome` from the final success/failure counts.
 *
 * Requirement 5a: The function must be generic over TItem.
 * Requirement 5b: Must accept a PageFetcher<TItem> as its only argument.
 * Requirement 5c: Must return Promise<PaginationSummary<TItem>>.
 * Requirement 5d: Must NOT throw — all errors are captured in `failures`.
 */
export async function paginateAll<TItem>(
  fetcher: PageFetcher<TItem>
): Promise<PaginationSummary<TItem>> {
  // TODO: implement the sequential pagination algorithm described above
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 6. Utility — implement this type-level helper
// -----------------------------------------------------------

/**
 * Given a PaginationSummary, extract only the items that satisfy
 * a user-supplied type guard, narrowing the output array type.
 *
 * Requirement 6a: Must be generic over TItem and TNarrowed extends TItem.
 * Requirement 6b: Must accept a type guard `(item: TItem) => item is TNarrowed`.
 * Requirement 6c: Must return ReadonlyArray<TNarrowed>.
 */
export function filterItems<TItem, TNarrowed extends TItem>(
  summary: PaginationSummary<TItem>,
  guard: (item: TItem) => item is TNarrowed
): ReadonlyArray<TNarrowed> {
  // TODO: filter summary.items using the type guard
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. Branded type — complete the definition
// -----------------------------------------------------------

/**
 * A page number that has been validated to be >= 1.
 * Requirement 7a: Declare ValidPageNumber as a branded type over number.
 * Requirement 7b: Implement `toValidPageNumber` which returns
 *   Result<ValidPageNumber, string> — Err if n < 1, Ok otherwise.
 */
declare const __validPage: unique symbol;
export type ValidPageNumber = number & { readonly [__validPage]: true };

export function toValidPageNumber(n: number): Result<ValidPageNumber, string> {
  // TODO: validate n >= 1 and return the branded type or an error string
  throw new Error("Not implemented");
}
