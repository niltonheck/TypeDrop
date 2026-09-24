// ============================================================
// Typed Paginated API Client with Retry & Cancellation
// ============================================================
// REQUIREMENTS
// 1. Define the core branded, generic, and discriminated-union
//    types listed below — no `any`, no type assertions.
// 2. Implement `fetchPage` — a typed fetch wrapper that returns
//    Result<PageEnvelope<T>, ApiError>.
// 3. Implement `fetchAllPages` — iterates pages until exhausted,
//    respects an AbortSignal, and collects all items into T[].
// 4. Implement `withRetry` — wraps an async operation with
//    exponential back-off; honours the AbortSignal between
//    attempts and never retries after cancellation.
// 5. Implement `createPaginatedClient` — composes the three
//    primitives above into a single, reusable client object
//    whose `fetchAll` method is fully typed on the resource T.
// ============================================================

// ----------------------------------------------------------
// § 1  Branded primitives
// ----------------------------------------------------------

/** A URL string that has been validated (non-empty). */
export type ValidUrl = string & { readonly __brand: "ValidUrl" };

/** Positive integer page number (1-based). */
export type PageNumber = number & { readonly __brand: "PageNumber" };

/** Runtime constructor — throws if value fails the predicate. */
export function makeValidUrl(raw: string): ValidUrl {
  // TODO: throw a TypeError if `raw` is empty or not a string;
  //       otherwise return it as ValidUrl.
  throw new Error("Not implemented");
}

export function makePageNumber(n: number): PageNumber {
  // TODO: throw a RangeError if n < 1 or not an integer;
  //       otherwise return it as PageNumber.
  throw new Error("Not implemented");
}

// ----------------------------------------------------------
// § 2  Result type  (discriminated union)
// ----------------------------------------------------------

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

// TODO: implement helper constructors `ok` and `err` so callers
//       can write  ok(value)  and  err(error)  without casting.
export function ok<T>(value: T): Ok<T> {
  throw new Error("Not implemented");
}
export function err<E>(error: E): Err<E> {
  throw new Error("Not implemented");
}

// ----------------------------------------------------------
// § 3  API envelope & error types
// ----------------------------------------------------------

/**
 * Shape returned by every paginated endpoint.
 * `items` holds the current page's records.
 * `nextPage` is undefined when there are no more pages.
 */
export interface PageEnvelope<T> {
  readonly items: readonly T[];
  readonly page: PageNumber;
  readonly totalPages: number;
  readonly nextPage: PageNumber | undefined;
}

/** Discriminated union of all error kinds the client can produce. */
export type ApiError =
  | { readonly kind: "network";     readonly message: string }
  | { readonly kind: "http";        readonly status: number; readonly message: string }
  | { readonly kind: "parse";       readonly message: string }
  | { readonly kind: "cancelled";   readonly message: string }
  | { readonly kind: "exhausted";   readonly attempts: number; readonly lastError: ApiError };

// ----------------------------------------------------------
// § 4  Retry configuration
// ----------------------------------------------------------

export interface RetryConfig {
  /** Maximum number of attempts (including the first). Min: 1 */
  readonly maxAttempts: number;
  /** Base delay in milliseconds for exponential back-off. */
  readonly baseDelayMs: number;
  /**
   * Optional predicate — return true if the error is retryable.
   * Defaults to retrying on "network" and "http" (5xx) errors only.
   */
  readonly isRetryable?: (error: ApiError) => boolean;
}

// ----------------------------------------------------------
// § 5  Client configuration
// ----------------------------------------------------------

export interface ClientConfig<T> {
  readonly baseUrl: ValidUrl;
  /**
   * Given a base URL and page number, produce the full endpoint URL.
   * e.g. (base, page) => `${base}?page=${page}&limit=50`
   */
  readonly buildUrl: (base: ValidUrl, page: PageNumber) => ValidUrl;
  /**
   * Parse a raw JSON value (unknown) into T[].
   * Return Err<ApiError> if the shape is wrong.
   */
  readonly parseItems: (raw: unknown) => Result<T[], ApiError>;
  readonly retry: RetryConfig;
}

// ----------------------------------------------------------
// § 6  Core primitives  (implement these)
// ----------------------------------------------------------

/**
 * Fetches a single page from `url`.
 * - If the signal is already aborted before the call, immediately
 *   return Err({ kind: "cancelled", ... }).
 * - Map non-2xx HTTP responses to Err({ kind: "http", ... }).
 * - Use `parseItems` to validate the body; on failure return
 *   Err({ kind: "parse", ... }).
 * - Catch network-level rejections as Err({ kind: "network", ... }).
 *
 * REQUIREMENT: The function must be generic in T and infer the
 * item type solely from the `parseItems` callback's return type.
 */
export async function fetchPage<T>(
  url: ValidUrl,
  page: PageNumber,
  parseItems: ClientConfig<T>["parseItems"],
  signal: AbortSignal
): Promise<Result<PageEnvelope<T>, ApiError>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Iterates pages starting from `startPage`, collecting all items.
 * Stops when `nextPage` is undefined or the signal is aborted.
 * Returns Err on the first failed page.
 *
 * REQUIREMENT: propagate the exact ApiError variant — do not
 * swallow or wrap it in an extra layer here.
 */
export async function fetchAllPages<T>(
  config: ClientConfig<T>,
  signal: AbortSignal,
  startPage?: PageNumber
): Promise<Result<T[], ApiError>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Wraps `operation` with retry logic described by `retryConfig`.
 * - Between attempts, wait `baseDelayMs * 2^(attempt - 1)` ms.
 * - If the signal fires during a delay, stop immediately and
 *   return Err({ kind: "cancelled", ... }).
 * - If all attempts fail, return
 *   Err({ kind: "exhausted", attempts, lastError }).
 * - If an attempt returns Ok, return it immediately.
 *
 * REQUIREMENT: generic in T so the Ok value type is preserved.
 */
export async function withRetry<T>(
  operation: (attempt: number, signal: AbortSignal) => Promise<Result<T, ApiError>>,
  retryConfig: RetryConfig,
  signal: AbortSignal
): Promise<Result<T, ApiError>> {
  // TODO
  throw new Error("Not implemented");
}

// ----------------------------------------------------------
// § 7  Composed client  (implement this)
// ----------------------------------------------------------

export interface PaginatedClient<T> {
  /**
   * Fetch every page and return all items combined.
   * Internally uses `withRetry` around each `fetchPage` call.
   */
  fetchAll(signal: AbortSignal): Promise<Result<T[], ApiError>>;
  /**
   * Fetch a single page (with retry) and return the envelope.
   */
  fetchPage(page: PageNumber, signal: AbortSignal): Promise<Result<PageEnvelope<T>, ApiError>>;
}

/**
 * Factory that wires together `fetchPage`, `fetchAllPages`, and
 * `withRetry` using the provided `config`.
 *
 * REQUIREMENT: return type must be PaginatedClient<T> — the
 * compiler should reject callers that treat items as the wrong type.
 */
export function createPaginatedClient<T>(
  config: ClientConfig<T>
): PaginatedClient<T> {
  // TODO
  throw new Error("Not implemented");
}
