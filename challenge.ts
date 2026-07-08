// ============================================================
// challenge.ts — Typed Paginated API Client
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`)
// ============================================================

// -----------------------------------------------------------
// 1. CORE DOMAIN TYPES
// -----------------------------------------------------------

/** A single analytics event record returned by the API. */
export interface AnalyticsRecord {
  id: string;
  eventName: string;
  userId: string;
  timestampMs: number;
  metadata: Record<string, string>;
}

/**
 * A raw page envelope as the API sends it.
 * Shape is UNKNOWN at runtime — you must validate it.
 */
export interface RawPage {
  data: unknown;
  nextCursor: unknown;
  totalCount: unknown;
}

/** A successfully validated page. */
export interface ValidPage {
  records: AnalyticsRecord[];
  nextCursor: string | null; // null means "last page"
  totalCount: number;
}

// -----------------------------------------------------------
// 2. RESULT / ERROR TYPES
// -----------------------------------------------------------

/** Typed error variants that can occur during pagination. */
export type PageError =
  | { kind: "validation"; pageIndex: number; reason: string }
  | { kind: "network";   pageIndex: number; message: string }
  | { kind: "cap-reached"; itemsFetched: number; cap: number };

/** Result type — no throwing, no `any`. */
export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// -----------------------------------------------------------
// 3. FETCHER ABSTRACTION
// -----------------------------------------------------------

/**
 * A typed page-fetcher function injected into the client.
 * Returns a Result so network failures are typed, not thrown.
 *
 * @param cursor - null means "fetch the first page"
 */
export type PageFetcher = (
  cursor: string | null
) => Promise<Result<RawPage, string>>;

// -----------------------------------------------------------
// 4. CLIENT CONFIG
// -----------------------------------------------------------

export interface PaginationConfig {
  /** Hard cap on total records to accumulate (inclusive). */
  maxItems: number;
  /** Maximum number of pages to request, regardless of cursors. */
  maxPages: number;
}

// -----------------------------------------------------------
// 5. ACCUMULATION RESULT
// -----------------------------------------------------------

export interface AccumulationResult {
  records: AnalyticsRecord[];
  /** One entry per page that failed validation or network fetch. */
  errors: PageError[];
  /** True when the run stopped because maxItems was reached. */
  cappedAt: number | null;
  /** Total pages successfully fetched (not counting errored pages). */
  pagesSucceeded: number;
}

// -----------------------------------------------------------
// 6. VALIDATION HELPER — you must implement this
// -----------------------------------------------------------

/**
 * Validate a `RawPage` (whose fields are all `unknown`) into a
 * `ValidPage`.
 *
 * Requirements:
 * R-1. `data` must be an array; each element must have:
 *        - id:          non-empty string
 *        - eventName:   non-empty string
 *        - userId:      non-empty string
 *        - timestampMs: finite number
 *        - metadata:    object whose every value is a string
 *             (unknown keys — use a Record<string, string>)
 * R-2. `nextCursor` must be a string or null/undefined
 *        (undefined → treat as null, i.e. last page).
 * R-3. `totalCount` must be a non-negative integer.
 * R-4. Return Result<ValidPage, string> — never throw.
 */
export function validatePage(raw: RawPage): Result<ValidPage, string> {
  // TODO: implement
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. MAIN CLIENT — you must implement this
// -----------------------------------------------------------

/**
 * Fetch and accumulate analytics records across multiple pages.
 *
 * Requirements:
 * R-5.  Start with cursor = null (first page).
 * R-6.  After each successful fetch, validate the raw page via
 *        `validatePage`. A validation failure adds a PageError of
 *        kind "validation" and moves on to the NEXT page —
 *        BUT there is no next cursor available, so stop pagination.
 * R-7.  A network failure (fetcher returns ok:false) adds a
 *        PageError of kind "network" and stops pagination.
 * R-8.  Accumulate records from each valid page.
 * R-9.  If adding a page's records would exceed `config.maxItems`,
 *        slice the records so the total equals exactly `maxItems`,
 *        record a "cap-reached" PageError, set `cappedAt`, and stop.
 * R-10. Stop when: nextCursor is null, maxPages is reached,
 *        a network error occurs, or the cap is reached.
 * R-11. Return an AccumulationResult — never throw.
 */
export async function fetchAllPages(
  fetcher: PageFetcher,
  config: PaginationConfig
): Promise<AccumulationResult> {
  // TODO: implement
  throw new Error("Not implemented");
}
