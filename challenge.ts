// ============================================================
// Typed Paginated API Client with Retry, Cancellation & Result Aggregation
// ============================================================
// Requirement 0: No `any`, `as`, or unsafe casts anywhere in your solution.
// ============================================================

// ---------------------------------------------------------------------------
// 1. BRANDED TYPES
// ---------------------------------------------------------------------------

/** Opaque brand helper — do not modify. */
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** A cursor token returned by the API to fetch the next page. */
export type PageCursor = Brand<string, "PageCursor">;

/** Make a PageCursor from a raw string (use only at trust boundaries). */
export function makePageCursor(raw: string): PageCursor {
  return raw as PageCursor; // sole permitted cast — already provided
}

// ---------------------------------------------------------------------------
// 2. API SHAPES
// ---------------------------------------------------------------------------

/** Every row returned by the /reports endpoint. */
export interface ReportRecord {
  readonly id: string;
  readonly region: "NA" | "EU" | "APAC";
  readonly revenue: number;
  readonly sessions: number;
  readonly bounceRate: number; // 0–1
}

/** A single page envelope returned by the API. */
export interface ReportPage {
  readonly records: readonly ReportRecord[];
  readonly nextCursor: PageCursor | null;
  readonly totalPages: number;
}

// ---------------------------------------------------------------------------
// 3. TYPED ERROR VARIANTS  (discriminated union)
// ---------------------------------------------------------------------------

export type FetchError =
  | { readonly kind: "NetworkError"; readonly message: string }
  | { readonly kind: "TimeoutError"; readonly afterMs: number }
  | { readonly kind: "ParseError"; readonly raw: string }
  | { readonly kind: "AbortedError" }
  | { readonly kind: "MaxRetriesExceeded"; readonly attempts: number; readonly lastError: FetchError };

// ---------------------------------------------------------------------------
// 4. RESULT TYPE
// ---------------------------------------------------------------------------

export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ---------------------------------------------------------------------------
// 5. FETCH ADAPTER  (injected dependency — keeps tests pure)
// ---------------------------------------------------------------------------

/**
 * Signature of the low-level page-fetching function you will receive.
 * It either resolves with a ReportPage or rejects with a FetchError.
 * It honours the AbortSignal and throws `{ kind: "AbortedError" }` when
 * the signal fires.
 */
export type PageFetcher = (
  cursor: PageCursor | null,
  signal: AbortSignal
) => Promise<ReportPage>;

// ---------------------------------------------------------------------------
// 6. RETRY CONFIG
// ---------------------------------------------------------------------------

export interface RetryConfig {
  /** Maximum number of attempts (initial + retries). Must be >= 1. */
  readonly maxAttempts: number;
  /** Base delay in ms for exponential back-off: delay = baseDelayMs * 2^attempt */
  readonly baseDelayMs: number;
  /** Error kinds that should NOT be retried (fail immediately). */
  readonly nonRetryableKinds: ReadonlyArray<FetchError["kind"]>;
}

// ---------------------------------------------------------------------------
// 7. AGGREGATION TYPES
// ---------------------------------------------------------------------------

/** Per-region breakdown included in the final summary. */
export interface RegionSummary {
  readonly totalRevenue: number;
  readonly totalSessions: number;
  readonly avgBounceRate: number;
  readonly recordCount: number;
}

/** The fully aggregated result produced after all pages are consumed. */
export interface ReportSummary {
  readonly totalRecords: number;
  readonly totalRevenue: number;
  readonly avgBounceRate: number;
  /** Keyed by region — every region present in the data must appear here. */
  readonly byRegion: Readonly<Record<ReportRecord["region"], RegionSummary>>;
  readonly pagesConsumed: number;
}

// ---------------------------------------------------------------------------
// 8. CLIENT CONFIG
// ---------------------------------------------------------------------------

export interface PaginatedClientConfig {
  readonly retry: RetryConfig;
  /**
   * Maximum number of pages to fetch. If the API still has more pages after
   * this limit, stop and return the summary of what was collected so far.
   */
  readonly maxPages: number;
}

// ---------------------------------------------------------------------------
// 9. YOUR TASKS
// ---------------------------------------------------------------------------

/**
 * TODO A — fetchPageWithRetry
 *
 * Fetch a single page at `cursor` using `fetcher`, retrying on transient
 * errors according to `config`.
 *
 * Requirements:
 * R1. Attempt the fetch up to `config.maxAttempts` times.
 * R2. Between attempts, wait `config.baseDelayMs * 2^attemptIndex` ms
 *     (attempt 0 = first try, no pre-delay; attempt 1 = first retry, delay = baseDelayMs * 1; etc.)
 * R3. If the error's `kind` is in `config.nonRetryableKinds`, stop immediately
 *     and return that error wrapped in a Result.
 * R4. If the AbortSignal is already aborted before an attempt, return
 *     `{ kind: "AbortedError" }` immediately without calling the fetcher.
 * R5. If all attempts are exhausted, return a `MaxRetriesExceeded` error
 *     wrapping the last encountered FetchError.
 * R6. On success, return `ok(page)`.
 */
export async function fetchPageWithRetry(
  cursor: PageCursor | null,
  fetcher: PageFetcher,
  config: RetryConfig,
  signal: AbortSignal
): Promise<Result<ReportPage, FetchError>> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO B — aggregateRecords
 *
 * Fold an array of ReportRecord into a ReportSummary.
 *
 * Requirements:
 * R7.  `totalRecords` = total number of records across all pages.
 * R8.  `totalRevenue` = sum of all `revenue` fields.
 * R9.  `avgBounceRate` = mean of all `bounceRate` fields (0 if no records).
 * R10. `byRegion` must contain an entry for every region that appears in
 *      the records. Each entry's `avgBounceRate` is the mean for that region.
 * R11. `pagesConsumed` is passed in separately (not derivable from records alone).
 *
 * The function signature must be PURE (no side-effects, no async).
 */
export function aggregateRecords(
  records: readonly ReportRecord[],
  pagesConsumed: number
): ReportSummary {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO C — fetchAllPages
 *
 * Orchestrate paginated fetching from the first page to the last (or until
 * `maxPages` is reached), then return the aggregated summary.
 *
 * Requirements:
 * R12. Start with `cursor = null` (first page).
 * R13. After each successful page, use `page.nextCursor` as the next cursor;
 *      stop when `nextCursor` is `null` or `pagesConsumed >= config.maxPages`.
 * R14. Each page fetch must go through `fetchPageWithRetry`.
 * R15. If any page fetch fails (after retries), stop immediately and return
 *      that error as a failed Result — do NOT aggregate partial data on error.
 * R16. If the AbortSignal fires mid-pagination, propagate the AbortedError.
 * R17. On full success, return `ok(summary)` where summary = aggregateRecords
 *      over ALL collected records.
 */
export async function fetchAllPages(
  fetcher: PageFetcher,
  config: PaginatedClientConfig,
  signal: AbortSignal
): Promise<Result<ReportSummary, FetchError>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 10. BONUS  (optional stretch goal)
// ---------------------------------------------------------------------------
// TODO D — Add a generic `mapResult<T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E>`
// utility and use it inside fetchAllPages to transform the raw ReportSummary
// into a "rounded" version where avgBounceRate values are rounded to 4 decimal
// places — without introducing any type assertions.
