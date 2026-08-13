// ============================================================
// Challenge: Typed Paginated API Client with Cursor-Based Iteration
// ============================================================
// You are building a generic paginated API client that:
//   1. Accepts a typed page-fetcher function and an AbortSignal
//   2. Yields individual items (not pages) via an async generator
//   3. Wraps each yielded item in a typed Result<T, FetchError>
//   4. Stops cleanly when the AbortSignal fires or pages are exhausted
//   5. Supports a configurable per-page item transform (map function)
//
// Requirements are listed as numbered comments below.
// ============================================================

// --------------- Core Result type ---------------

/** Req 1: Define a discriminated-union Result type with two variants:
 *  - Ok<T>:  { ok: true;  value: T }
 *  - Err<E>: { ok: false; error: E }
 *  The exported type Result<T, E> must be the union of both.
 */
export type Ok<T> = /* TODO */ never;
export type Err<E> = /* TODO */ never;
export type Result<T, E> = Ok<T> | Err<E>;

// --------------- Error hierarchy ---------------

/** Req 2: Define a discriminated-union FetchError with three variants,
 *  each identified by a `kind` literal string field:
 *  - NetworkError:  kind: "network";  message: string; retryable: boolean
 *  - ParseError:    kind: "parse";    message: string; raw: string
 *  - AbortError:    kind: "abort";    message: string
 */
export type FetchError = /* TODO */ never;

// --------------- Pagination types ---------------

/** Req 3: A page returned by the API contains:
 *  - items: T[]           — the records on this page
 *  - nextCursor: string | null  — null signals the last page
 *  - totalCount?: number  — optional total record count hint
 */
export type Page<T> = {
  // TODO
};

/** Req 4: Options accepted by `paginatedFetch`:
 *  - fetcher:    (cursor: string | null, signal: AbortSignal) => Promise<Page<T>>
 *                — async function that retrieves one page
 *  - signal:     AbortSignal  — controls cancellation of the whole iteration
 *  - transform?: (item: T) => U
 *                — optional per-item mapping; when omitted U must equal T
 *                  (hint: use a conditional/default generic parameter)
 *  - startCursor?: string | null  — cursor to begin from (default null = first page)
 */
export type PaginatedFetchOptions<T, U = T> = {
  // TODO
};

// --------------- Helper type utilities ---------------

/** Req 5: Define a type-level helper `UnwrapPage<P>` that, given a Page<T>,
 *  extracts T. Use `infer`.
 *  Example: UnwrapPage<Page<User>> → User
 */
export type UnwrapPage<P> = /* TODO */ never;

/** Req 6: Define a mapped type `PageSummary<T>` that takes any object type T
 *  and produces a readonly version where every value is wrapped in Result<V, FetchError>
 *  (i.e. each field type V becomes Result<V, FetchError>).
 *  Example: PageSummary<{ id: number; name: string }>
 *    → { readonly id: Result<number, FetchError>; readonly name: Result<string, FetchError> }
 */
export type PageSummary<T> = {
  // TODO
};

// --------------- Main async generator ---------------

/**
 * Req 7: Implement `paginatedFetch` as an async generator function.
 *
 * Behaviour requirements:
 *  a) Start from `options.startCursor` (default: null).
 *  b) On each iteration, call `options.fetcher(cursor, signal)`.
 *  c) If the AbortSignal is already aborted BEFORE calling the fetcher,
 *     yield one Err({ kind: "abort", message: "Aborted" }) then return.
 *  d) If the fetcher throws a DOMException with name "AbortError",
 *     yield Err({ kind: "abort", message: err.message }) then return.
 *  e) If the fetcher throws any other error, yield
 *     Err({ kind: "network", message: String(err), retryable: true }) then return.
 *  f) For each item in the page, apply `options.transform` if provided,
 *     then yield Ok({ value: transformedItem }).
 *  g) Advance the cursor to `page.nextCursor`; stop when it is null.
 *  h) The generator's TypeScript return type must be:
 *       AsyncGenerator<Result<U, FetchError>>
 *     where U is inferred from the transform (or equals T when absent).
 *
 * Req 8: The function signature must be generic over T and U with a default:
 *   export async function* paginatedFetch<T, U = T>(
 *     options: PaginatedFetchOptions<T, U>
 *   ): AsyncGenerator<Result<U, FetchError>>
 */
export async function* paginatedFetch<T, U = T>(
  options: PaginatedFetchOptions<T, U>
): AsyncGenerator<Result<U, FetchError>> {
  // TODO: implement according to requirements 7a–7g
}

// --------------- Collector utility ---------------

/**
 * Req 9: Implement `collectResults` — a regular async function (NOT a generator)
 * that drives the async generator to completion and returns:
 *   { values: U[]; errors: FetchError[] }
 * Successes go into `values`, failures into `errors`.
 * The function must be generic and infer U from the generator type.
 */
export async function collectResults<U>(
  gen: AsyncGenerator<Result<U, FetchError>>
): Promise<{ values: U[]; errors: FetchError[] }> {
  // TODO
}

// --------------- Typed guard helpers ---------------

/**
 * Req 10: Implement two type-guard functions:
 *  - isOk<T, E>(result: Result<T, E>): result is Ok<T>
 *  - isErr<T, E>(result: Result<T, E>): result is Err<E>
 * These must narrow the discriminated union correctly.
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  // TODO
}

export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  // TODO
}
