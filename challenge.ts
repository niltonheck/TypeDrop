// ============================================================
// Typed Paginated API Response Aggregator
// challenge.ts — fill in every TODO, do NOT use `any` or `as`
// ============================================================

// ------------------------------------------------------------------
// 1. RESULT TYPE  (a lightweight Either monad)
// ------------------------------------------------------------------
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

/** TODO: Implement these two constructor helpers. */
export function ok<T>(value: T): Ok<T> {
  // TODO
  throw new Error("Not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 2. DOMAIN TYPES
// ------------------------------------------------------------------

/** A single record returned by the API — generic over its payload. */
export type ApiRecord<T> = {
  id: string;
  createdAt: string; // ISO-8601
  payload: T;
};

/** One page of results from the API. */
export type Page<T> = {
  page: number;
  totalPages: number;
  items: ApiRecord<T>[];
};

/**
 * The shape your fetcher function must conform to.
 * Resolves to a Result so callers can handle per-page failures gracefully.
 */
export type PageFetcher<T> = (page: number) => Promise<Result<Page<T>, FetchError>>;

// ------------------------------------------------------------------
// 3. ERROR HIERARCHY  (discriminated union)
// ------------------------------------------------------------------
export type FetchError =
  | { kind: "network";  message: string; page: number }
  | { kind: "timeout";  page: number; afterMs: number }
  | { kind: "parse";    page: number; raw: string }
  | { kind: "unknown";  page: number; cause: unknown };

// ------------------------------------------------------------------
// 4. AGGREGATION CONFIG & OUTPUT
// ------------------------------------------------------------------

export type AggregateConfig = {
  /** Maximum number of in-flight page requests at one time. */
  concurrency: number;
  /** If true, the entire run fails on the first page error.
   *  If false, failed pages are collected separately and the run
   *  still returns whatever succeeded. */
  failFast: boolean;
};

export type AggregateSuccess<T> = {
  /** All records collected, sorted ascending by `createdAt`. */
  records: ApiRecord<T>[];
  /** Total number of pages fetched (successful + failed). */
  totalPagesFetched: number;
  /** Pages that failed (empty when failFast caused an early exit). */
  failedPages: Array<{ page: number; error: FetchError }>;
};

export type AggregateError = {
  /** The first error that triggered a failFast abort. */
  firstError: FetchError;
  /** How many pages were fetched before the abort. */
  pagesFetchedBeforeAbort: number;
};

// ------------------------------------------------------------------
// 5. CORE FUNCTION SIGNATURE
// ------------------------------------------------------------------

/**
 * Fetches ALL pages from a paginated API endpoint and aggregates the
 * results into a single sorted list.
 *
 * Requirements (implement each TODO below):
 *
 * TODO-1: Fetch page 1 first to discover `totalPages`.
 *         If page 1 fails and `failFast` is true, return Err immediately.
 *         If page 1 fails and `failFast` is false, return Ok with the
 *         single failed page recorded in `failedPages` and empty records.
 *
 * TODO-2: Fetch the remaining pages (2..totalPages) with at most
 *         `config.concurrency` requests in-flight simultaneously.
 *         (Hint: process pages in batches of `config.concurrency`.)
 *
 * TODO-3: For each page result:
 *         - On Ok  → collect items into the master records array.
 *         - On Err and failFast  → abort immediately, return Err<AggregateError>.
 *         - On Err and !failFast → record in failedPages, continue.
 *
 * TODO-4: After all pages are processed, sort the records array
 *         ascending by `createdAt` (lexicographic ISO sort is fine).
 *
 * TODO-5: Return Ok<AggregateSuccess<T>> with the final assembled result.
 */
export async function aggregatePages<T>(
  fetchPage: PageFetcher<T>,
  config: AggregateConfig
): Promise<Result<AggregateSuccess<T>, AggregateError>> {
  // TODO-1 — fetch page 1 to discover totalPages
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. HELPER — format a FetchError into a human-readable string
// ------------------------------------------------------------------

/**
 * TODO-6: Return a human-readable description for each FetchError kind.
 * Must be exhaustive — TypeScript should catch any unhandled kind.
 *
 * Format per kind:
 *  network  → "Page {page} network error: {message}"
 *  timeout  → "Page {page} timed out after {afterMs}ms"
 *  parse    → "Page {page} parse error — raw: {raw}"
 *  unknown  → "Page {page} unknown error"
 */
export function formatFetchError(error: FetchError): string {
  // TODO-6
  throw new Error("Not implemented");
}
