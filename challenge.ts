// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Paginated API Client
// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO
//   You're building the data-fetching layer for an analytics dashboard that
//   consumes a paginated REST API. Raw page responses arrive as `unknown` from
//   the network; your client must validate each page, lazily accumulate results
//   with a configurable concurrency limit, and surface a discriminated-union
//   outcome per fetch — with zero `any`.
//
// REQUIREMENTS
//   1. Define a `PageResponse<T>` interface with:
//        - items:    T[]
//        - page:     number
//        - pageSize: number
//        - total:    number          (total number of items across all pages)
//
//   2. Define a discriminated-union `FetchResult<T>`:
//        - { status: "ok";      page: number; items: T[] }
//        - { status: "invalid"; page: number; error: string }
//        - { status: "failed";  page: number; error: string }
//      Use a generic type parameter so the "ok" branch is strongly typed.
//
//   3. Implement `validatePageResponse<T>(
//        raw:       unknown,
//        page:      number,
//        validator: (item: unknown) => item is T
//      ): FetchResult<T>`
//      Rules:
//        - The raw value must be an object with the correct shape (see §1).
//        - `items` must be an array where EVERY element satisfies `validator`.
//        - `page` in the payload must equal the requested `page` argument.
//        - On any structural failure → status "invalid" with a descriptive message.
//        - On a validator failure    → status "invalid" with item index in message.
//        - On success                → status "ok".
//
//   4. Implement `fetchPage<T>(
//        fetcher:   (page: number) => Promise<unknown>,
//        validator: (item: unknown) => item is T,
//        page:      number
//      ): Promise<FetchResult<T>>`
//      Rules:
//        - Calls `fetcher(page)`, then passes the result to `validatePageResponse`.
//        - If `fetcher` throws / rejects → return status "failed" with the
//          error message (use `instanceof Error` to extract `.message`; otherwise
//          use String(e)).
//
//   5. Implement `fetchAllPages<T>(
//        fetcher:     (page: number) => Promise<unknown>,
//        validator:   (item: unknown) => item is T,
//        options:     FetchAllOptions
//      ): Promise<FetchAllSummary<T>>`
//      Rules:
//        a. Fetch page 1 first (sequentially) to discover `total` and `pageSize`.
//           If page 1 is not "ok", return immediately with that single result.
//        b. Derive the remaining page numbers from `total` and `pageSize`.
//        c. Fetch remaining pages with at most `options.concurrency` requests
//           in-flight simultaneously (use Promise.all over sliced batches).
//        d. Collect ALL FetchResult<T> entries (including page 1) into `results`.
//        e. Accumulate every item from "ok" pages into `items` in page-number order.
//        f. Return a `FetchAllSummary<T>` (see type below).
//
// ─────────────────────────────────────────────────────────────────────────────
// TYPE STUBS — fill these in (replace `TODO` with real types / implementations)
// ─────────────────────────────────────────────────────────────────────────────

// §1 — Page response shape
export interface PageResponse<T> {
  // TODO: items, page, pageSize, total
}

// §2 — Discriminated-union result
export type FetchResult<T> =
  // TODO: three variants — "ok" | "invalid" | "failed"
  never;

// Options for fetchAllPages
export interface FetchAllOptions {
  /** Maximum number of page requests in-flight at once (≥ 1). */
  concurrency: number;
}

// Summary returned by fetchAllPages
export interface FetchAllSummary<T> {
  /** Every FetchResult produced, one per page attempted. */
  results: FetchResult<T>[];
  /** All items collected from "ok" pages, in page-number order. */
  items: T[];
  /** Count of pages with status "ok". */
  successCount: number;
  /** Count of pages with status "invalid" | "failed". */
  failureCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION STUBS — implement each one (no `any`, no type assertions)
// ─────────────────────────────────────────────────────────────────────────────

// §3
export function validatePageResponse<T>(
  raw: unknown,
  page: number,
  validator: (item: unknown) => item is T
): FetchResult<T> {
  // TODO
  throw new Error("Not implemented");
}

// §4
export async function fetchPage<T>(
  fetcher: (page: number) => Promise<unknown>,
  validator: (item: unknown) => item is T,
  page: number
): Promise<FetchResult<T>> {
  // TODO
  throw new Error("Not implemented");
}

// §5
export async function fetchAllPages<T>(
  fetcher: (page: number) => Promise<unknown>,
  validator: (item: unknown) => item is T,
  options: FetchAllOptions
): Promise<FetchAllSummary<T>> {
  // TODO
  throw new Error("Not implemented");
}
