// ============================================================
// challenge.ts — Typed Paginated API Client
// ============================================================
// Implement the stubs below. All code must compile under
// strict: true with no `any`, no `as`, and no type assertions.
// ============================================================

// ------------------------------------------------------------------
// 1. RESULT MONAD
// ------------------------------------------------------------------

/** A successful result carrying a value. */
export type Ok<T> = { readonly status: "ok"; readonly value: T };

/** A failed result carrying a structured error. */
export type Err<E> = { readonly status: "err"; readonly error: E };

/** Discriminated union result type. */
export type Result<T, E> = Ok<T> | Err<E>;

/** Constructor helpers — implement these. */
export function ok<T>(value: T): Ok<T> {
  // TODO
  throw new Error("Not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO
  throw new Error("Not implemented");
}

/** Requirement 1: isOk must narrow Result<T,E> to Ok<T>. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 2. PAGINATION TYPES
// ------------------------------------------------------------------

/**
 * A single page returned by the API.
 * - `items`      — the records on this page
 * - `nextCursor` — opaque cursor string, or null when there are no more pages
 * - `totalCount` — total number of items across ALL pages (optional; not all
 *                  endpoints return this)
 */
export type Page<T> = {
  readonly items: ReadonlyArray<T>;
  readonly nextCursor: string | null;
  readonly totalCount?: number;
};

/**
 * Branded cursor type — callers must obtain a cursor from a Page, they cannot
 * fabricate one from a plain string.
 *
 * Requirement 2: Implement the `Cursor` branded type so that
 * `string` is NOT assignable to `Cursor` without going through `makeCursor`.
 */
export type Cursor = string & { readonly __cursorBrand: unique symbol };

/** The only way to create a Cursor at runtime. */
export function makeCursor(raw: string): Cursor {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 3. FETCH FUNCTION TYPE
// ------------------------------------------------------------------

/**
 * Requirement 3: A `PageFetcher<T>` is an async function that accepts an
 * optional cursor (undefined = first page) and returns a Result whose
 * success value is a Page<T> and whose error is a `FetchError`.
 */
export type FetchError = {
  readonly kind: "network" | "timeout" | "parse" | "auth";
  readonly message: string;
  readonly retryable: boolean;
};

export type PageFetcher<T> = (
  cursor: Cursor | undefined
) => Promise<Result<Page<T>, FetchError>>;

// ------------------------------------------------------------------
// 4. AGGREGATION TYPES
// ------------------------------------------------------------------

/**
 * The final report produced after iterating all pages.
 *
 * - `items`       — all successfully fetched items, in order
 * - `pagesFetched`— how many pages were fetched (including the failed one, if any)
 * - `totalCount`  — forwarded from the first page that provides it, or undefined
 * - `error`       — the first FetchError encountered (iteration stops on error)
 */
export type FetchAllResult<T> = {
  readonly items: ReadonlyArray<T>;
  readonly pagesFetched: number;
  readonly totalCount: number | undefined;
  readonly error: FetchError | undefined;
};

// ------------------------------------------------------------------
// 5. CORE FUNCTION — fetchAllPages
// ------------------------------------------------------------------

/**
 * Requirement 4: Iterate pages sequentially (cursor-based) until either:
 *   a) `nextCursor` is null  (all pages consumed), or
 *   b) a page returns an Err (stop and record the error).
 *
 * Requirement 5: Return a `FetchAllResult<T>` that aggregates every item
 * collected before the error (if any), the page count, the first seen
 * `totalCount`, and the error (or undefined on full success).
 *
 * Requirement 6: The function must be generic — it works for ANY item type T
 * without the caller needing to provide type annotations beyond the fetcher.
 */
export async function fetchAllPages<T>(
  fetcher: PageFetcher<T>
): Promise<FetchAllResult<T>> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. UTILITY — mapFetcher
// ------------------------------------------------------------------

/**
 * Requirement 7: Given a `PageFetcher<A>` and a mapping function `A → B`,
 * return a new `PageFetcher<B>` that applies the mapping to every item in
 * each page's result — without mutating the original fetcher.
 *
 * The error path must be forwarded unchanged.
 */
export function mapFetcher<A, B>(
  fetcher: PageFetcher<A>,
  transform: (item: A) => B
): PageFetcher<B> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 7. UTILITY — withRetry
// ------------------------------------------------------------------

/**
 * Requirement 8: Wrap a `PageFetcher<T>` so that on a retryable FetchError,
 * it automatically retries up to `maxRetries` times before returning the Err.
 * Non-retryable errors must be returned immediately without retrying.
 *
 * Hint: `FetchError.retryable` tells you whether to retry.
 */
export function withRetry<T>(
  fetcher: PageFetcher<T>,
  maxRetries: number
): PageFetcher<T> {
  // TODO
  throw new Error("Not implemented");
}
