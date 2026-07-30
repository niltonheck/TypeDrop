// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts
// Typed Pagination Aggregator with Cursor-Based Fetching
// ─────────────────────────────────────────────────────────────────────────────
// REQUIREMENTS
// 1. Define a `Page<T>` type representing one page of results:
//    - `items`: an array of T
//    - `nextCursor`: string | null  (null means "last page")
//
// 2. Define a `PaginatorConfig<T>` type:
//    - `fetchPage`: a function (cursor: string | null, signal: AbortSignal) => Promise<Page<T>>
//    - `pageTimeoutMs`: number — each individual page fetch must be aborted after this many ms
//    - `maxPages`: number — hard cap on how many pages to fetch (prevents infinite loops)
//
// 3. Define a discriminated-union `AggregatorResult<T>`:
//    - { status: "ok";    items: T[];          pagesFetched: number }
//    - { status: "error"; reason: FetchError;  pagesFetched: number; partialItems: T[] }
//
// 4. Define a `FetchError` discriminated union with at least these members:
//    - { kind: "timeout";   pageIndex: number }
//    - { kind: "aborted";   pageIndex: number }
//    - { kind: "network";   pageIndex: number; message: string }
//    - { kind: "max_pages"; limit: number }
//
// 5. Implement `aggregatePages<T>(config: PaginatorConfig<T>): Promise<AggregatorResult<T>>`
//    - Fetch pages sequentially, starting with cursor = null
//    - Each page fetch must race against a per-page AbortController timeout
//      (use `pageTimeoutMs` to abort if the fetch takes too long)
//    - Stop when `nextCursor` is null OR `maxPages` is reached
//    - If maxPages is reached before a null cursor, return an error result with kind "max_pages"
//    - On timeout: return error result with kind "timeout" and the current pageIndex
//    - On abort (signal from outside): return error result with kind "aborted"
//    - On any other thrown error: return error result with kind "network" with message
//    - On success: return all collected items and total pagesFetched count
//
// 6. Implement `paginatorFor<T>`: a helper that builds a `PaginatorConfig<T>` from:
//    - `url`: string (base URL; cursor appended as ?cursor=<value> when non-null)
//    - `transform`: (raw: unknown) => Page<T>  (parse/validate the raw response)
//    - `pageTimeoutMs` and `maxPages` (with sensible defaults: 5000ms, 100 pages)
//    The returned config's `fetchPage` must call the global `fetch`, pass the signal,
//    await the JSON response, and run `transform` on it.
//
// ─────────────────────────────────────────────────────────────────────────────
// TYPE STUBS — fill these in (no `any`, no `as`, no type assertions)
// ─────────────────────────────────────────────────────────────────────────────

export type Page<T> = {
  // TODO
};

export type FetchError =
  | { kind: "timeout";   pageIndex: number }
  | { kind: "aborted";   pageIndex: number }
  | { kind: "network";   pageIndex: number; message: string }
  | { kind: "max_pages"; limit: number };

export type AggregatorResult<T> =
  // TODO: discriminated union — "ok" | "error"
  never;

export type PaginatorConfig<T> = {
  // TODO
};

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION STUBS — implement these
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches all pages sequentially according to config, collecting items.
 * Returns a typed AggregatorResult<T> — never throws.
 */
export async function aggregatePages<T>(
  config: PaginatorConfig<T>
): Promise<AggregatorResult<T>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Convenience builder: wraps a URL + transform function into a PaginatorConfig<T>.
 * Defaults: pageTimeoutMs = 5000, maxPages = 100
 */
export function paginatorFor<T>(options: {
  url: string;
  transform: (raw: unknown) => Page<T>;
  pageTimeoutMs?: number;
  maxPages?: number;
}): PaginatorConfig<T> {
  // TODO
  throw new Error("Not implemented");
}
