// ============================================================
// challenge.ts — Typed Paginated API Client with Aggregation
// ============================================================
// TOPICS: generics, conditional types, mapped types, branded types,
//         discriminated unions (Result<T,E>), Promise.all concurrency,
//         unknown → typed narrowing, single-pass aggregation
// ============================================================

// ── 1. Branded primitives ────────────────────────────────────

/** A non-empty string cursor returned by the API. */
export type Cursor = string & { readonly __brand: "Cursor" };

/** A positive integer representing a page size (1-500). */
export type PageSize = number & { readonly __brand: "PageSize" };

// ── 2. Domain types ──────────────────────────────────────────

export type EventKind = "click" | "view" | "purchase" | "share";

export interface ActivityEvent {
  readonly id: string;
  readonly userId: string;
  readonly kind: EventKind;
  readonly durationMs: number; // ≥ 0
  readonly revenueUsd: number; // ≥ 0; only meaningful for "purchase"
  readonly timestamp: string;  // ISO-8601
}

// ── 3. Raw API response shape (comes in as `unknown`) ────────

// NOTE: Do NOT export RawPage — callers only ever see validated types.
// You'll need to define it internally for your validation logic.

// ── 4. Result type ───────────────────────────────────────────

export type Result<T, E extends string> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E; readonly detail: string };

// ── 5. Validated page ────────────────────────────────────────

export interface Page<T> {
  readonly items: readonly T[];
  readonly nextCursor: Cursor | null;
  readonly totalCount: number;
}

// ── 6. Aggregation report ────────────────────────────────────

/** Per-kind statistics collected in a single pass over all events. */
export type KindStats = {
  readonly [K in EventKind]: {
    readonly count: number;
    readonly totalDurationMs: number;
    readonly totalRevenueUsd: number;
  };
};

export interface AggregationReport {
  readonly totalEvents: number;
  readonly uniqueUsers: number;
  readonly kindStats: KindStats;
  readonly avgDurationMs: number;        // across all events
  readonly topRevenueUserId: string | null; // userId with highest sum of revenueUsd
}

// ── 7. Fetch abstraction ─────────────────────────────────────

/**
 * Signature of the injected fetch function.
 * Returns the raw JSON body as `unknown` — your code must validate it.
 */
export type PageFetcher = (cursor: Cursor | null, pageSize: PageSize) => Promise<unknown>;

// ── 8. Client config ─────────────────────────────────────────

export interface ClientConfig {
  /** Maximum number of in-flight page fetches at one time (1–10). */
  readonly concurrency: number;
  /** Number of items per page (1–500). */
  readonly pageSize: number;
  /** Total page cap — stop after fetching this many pages (safety valve). */
  readonly maxPages: number;
}

// ── 9. Branded constructors ──────────────────────────────────

/**
 * TODO (REQUIREMENT 1): Implement `makeCursor`.
 *
 * Returns Result<Cursor, "InvalidCursor"> where the error case covers:
 *   - empty string
 *   - string longer than 512 characters
 */
export function makeCursor(raw: string): Result<Cursor, "InvalidCursor"> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO (REQUIREMENT 2): Implement `makePageSize`.
 *
 * Returns Result<PageSize, "InvalidPageSize"> where the error case covers:
 *   - non-integer values
 *   - values outside [1, 500]
 */
export function makePageSize(raw: number): Result<PageSize, "InvalidPageSize"> {
  // TODO
  throw new Error("Not implemented");
}

// ── 10. Page validator ───────────────────────────────────────

/**
 * TODO (REQUIREMENT 3): Implement `validatePage`.
 *
 * Accepts `unknown` input and returns Result<Page<ActivityEvent>, "InvalidPage">.
 *
 * Validation rules:
 *   - Must be a plain object with keys: items (array), nextCursor (string | null),
 *     totalCount (number, integer ≥ 0).
 *   - Each item in `items` must satisfy the ActivityEvent shape:
 *       • id, userId, timestamp — non-empty strings
 *       • kind — one of the four EventKind values
 *       • durationMs, revenueUsd — finite numbers ≥ 0
 *   - nextCursor (when non-null) must pass `makeCursor` validation.
 *   - On ANY validation failure, return ok:false with a descriptive `detail`.
 */
export function validatePage(raw: unknown): Result<Page<ActivityEvent>, "InvalidPage"> {
  // TODO
  throw new Error("Not implemented");
}

// ── 11. Single-pass aggregator ───────────────────────────────

/**
 * TODO (REQUIREMENT 4): Implement `aggregateEvents`.
 *
 * Performs a single pass over all events (no intermediate arrays) and returns
 * an AggregationReport.
 *
 * Rules:
 *   - `uniqueUsers` counts distinct userIds.
 *   - `avgDurationMs` is the mean durationMs across ALL events (0 if no events).
 *   - `topRevenueUserId` is the userId whose revenueUsd sum is highest
 *     (null if no events or all revenues are 0).
 *   - KindStats must be initialised for all four EventKind values even if count=0.
 */
export function aggregateEvents(events: readonly ActivityEvent[]): AggregationReport {
  // TODO
  throw new Error("Not implemented");
}

// ── 12. Paginated client ─────────────────────────────────────

/**
 * TODO (REQUIREMENT 5): Implement `fetchAllPages`.
 *
 * Drives cursor-based pagination using `fetcher`, validates every page with
 * `validatePage`, and collects all ActivityEvents.
 *
 * Concurrency rules (the trickiest part):
 *   - Use `config.concurrency` to cap simultaneous in-flight requests.
 *   - The FIRST fetch always uses cursor=null (the initial page).
 *   - From the first response extract `nextCursor`; if non-null, enqueue the
 *     next fetch. Continue until nextCursor is null OR maxPages is reached.
 *   - Because cursors are sequential (each page reveals the next cursor),
 *     real fan-out is limited — model this as a rolling window: always keep
 *     up to `concurrency` fetches in flight when cursors are available.
 *   - If ANY page fails validation, reject with a typed FetchError.
 *   - Returns all collected events in page-arrival order.
 *
 * Typed error:
 */
export interface FetchError {
  readonly kind: "FetchError";
  readonly page: number;   // 1-based page index that failed
  readonly detail: string;
}

export async function fetchAllPages(
  fetcher: PageFetcher,
  config: ClientConfig
): Promise<readonly ActivityEvent[]> {
  // TODO
  throw new Error("Not implemented");
}

// ── 13. Orchestrator ─────────────────────────────────────────

/**
 * TODO (REQUIREMENT 6): Implement `runIngestion`.
 *
 * Ties everything together:
 *   1. Validate `config.pageSize` with `makePageSize`; return a Result error
 *      if invalid.
 *   2. Call `fetchAllPages`; if it throws a FetchError, return a Result error
 *      with error:"FetchFailed" and detail from the FetchError.
 *   3. Call `aggregateEvents` on the collected events.
 *   4. Return Result<AggregationReport, "InvalidPageSize" | "FetchFailed">.
 */
export async function runIngestion(
  fetcher: PageFetcher,
  config: ClientConfig
): Promise<Result<AggregationReport, "InvalidPageSize" | "FetchFailed">> {
  // TODO
  throw new Error("Not implemented");
}
