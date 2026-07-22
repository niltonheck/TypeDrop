// ─── challenge.ts ────────────────────────────────────────────────────────────
//
// TYPED PAGINATED API CLIENT WITH RESULT AGGREGATION
//
// Your task: implement the three functions below so that the types compile
// under strict:true with zero `any`, and all requirements are satisfied.
//
// ─────────────────────────────────────────────────────────────────────────────

// ---------------------------------------------------------------------------
// 1. CORE RESULT TYPE
// ---------------------------------------------------------------------------

/**
 * A discriminated union representing either a successful value or a typed error.
 *
 * Requirement 1: `Ok<T>` must carry `{ ok: true; value: T }`.
 * Requirement 2: `Err<E>` must carry `{ ok: false; error: E }`.
 */
export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

/** Convenience constructors — implement these. */
export function ok<T>(value: T): Ok<T> {
  // TODO
  throw new Error("Not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 2. PAGINATED RESPONSE SHAPE
// ---------------------------------------------------------------------------

/**
 * A single page returned by the backend.
 *
 * Requirement 3: `nextCursor` must be `string | null` — null signals the last page.
 */
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  totalCount: number;
}

/**
 * The function signature your client will call for each page.
 * It receives an optional cursor (undefined = first page) and returns a
 * Promise that resolves to a Result — it never rejects.
 */
export type FetchPage<T, E> = (
  cursor: string | undefined
) => Promise<Result<Page<T>, E>>;

// ---------------------------------------------------------------------------
// 3. AGGREGATED RESULT
// ---------------------------------------------------------------------------

/**
 * What `fetchAllPages` returns after walking the full cursor chain.
 *
 * Requirement 4: `items` must be the flat concatenation of every page's items.
 * Requirement 5: `totalCount` comes from the LAST successfully fetched page.
 * Requirement 6: `pagesFetched` is the count of pages that succeeded.
 * Requirement 7: `errors` collects every per-page error in order (may be empty).
 *
 * NOTE: The aggregation is "best-effort" — a page error does NOT stop iteration
 * if a next cursor is somehow available; see `fetchAllPages` requirements below.
 */
export interface AggregatedResult<T, E> {
  items: T[];
  totalCount: number;
  pagesFetched: number;
  errors: E[];
}

// ---------------------------------------------------------------------------
// 4. FETCH ALL PAGES  ← main function to implement
// ---------------------------------------------------------------------------

/**
 * Walk the cursor chain, collecting all items across pages.
 *
 * Requirement 8:  Start with `cursor = undefined` (first page).
 * Requirement 9:  On a successful page, append its `items` to the accumulator
 *                 and advance the cursor to `page.nextCursor`.
 * Requirement 10: On a failed page result (`Err`), push the error into `errors`
 *                 and STOP iteration (we have no cursor to continue with).
 * Requirement 11: Stop naturally when `nextCursor` is `null`.
 * Requirement 12: Pages must be fetched SEQUENTIALLY (not concurrently).
 * Requirement 13: Return an `AggregatedResult<T, E>` — never throw.
 */
export async function fetchAllPages<T, E>(
  fetchPage: FetchPage<T, E>
): Promise<AggregatedResult<T, E>> {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 5. TYPED FIELD EXTRACTOR  ← bonus utility to implement
// ---------------------------------------------------------------------------

/**
 * Given an `AggregatedResult<T, E>` and a key `K` that exists on `T`,
 * return a flat array of just that field's values across all items.
 *
 * Requirement 14: The return type must be inferred as `Array<T[K]>` — no casting.
 * Requirement 15: `K` must be constrained so only valid keys of `T` are accepted.
 *
 * Example:
 *   pluckField(result, "id")   // → number[]  (if T has id: number)
 *   pluckField(result, "name") // → string[]  (if T has name: string)
 */
export function pluckField<T, E, K extends keyof T>(
  result: AggregatedResult<T, E>,
  key: K
): Array<T[K]> {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 6. PAGE TRANSFORMER  ← compose a new FetchPage that maps items
// ---------------------------------------------------------------------------

/**
 * Wrap an existing `FetchPage<A, E>` so that every successfully fetched page
 * has its items mapped through `transform: (item: A) => B`, producing a
 * `FetchPage<B, E>`.
 *
 * Requirement 16: Errors must pass through unchanged.
 * Requirement 17: The `totalCount` and `nextCursor` on the page are preserved.
 * Requirement 18: The returned function must satisfy the `FetchPage<B, E>` type
 *                 exactly — no wrapper types needed.
 */
export function mapFetchPage<A, B, E>(
  fetchPage: FetchPage<A, E>,
  transform: (item: A) => B
): FetchPage<B, E> {
  // TODO
  throw new Error("Not implemented");
}
