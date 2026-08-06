// ============================================================
// Challenge: Typed Paginated API Client with Cursor-Based Iteration
// ============================================================
// You are building a generic, strongly-typed paginated API client.
// The client must lazily walk cursor-based pages, wrap every
// network result in a Result type, and expose a typed async
// generator so callers can process items one page at a time.
//
// Rules:
//  - No `any`, no `as`, no type assertions anywhere.
//  - All functions must compile under strict: true.
//  - The generic parameter T represents the shape of one resource item.
// ============================================================

// -----------------------------------------------------------
// 1. Result type  (no throwing — all errors are values)
// -----------------------------------------------------------

// TODO: Define a discriminated union `Result<T, E>` with two
//       variants: Ok<T> (tag "ok") and Err<E> (tag "err").
export type Result<T, E> = never; // replace `never` with your implementation

// -----------------------------------------------------------
// 2. Error hierarchy
// -----------------------------------------------------------

// TODO: Define a discriminated union `FetchError` with three variants:
//   - NetworkError  { kind: "network";  message: string }
//   - HttpError     { kind: "http";     status: number; body: string }
//   - ParseError    { kind: "parse";    raw: string }
export type FetchError = never; // replace `never` with your implementation

// -----------------------------------------------------------
// 3. Pagination envelope
// -----------------------------------------------------------

// TODO: Define a generic interface `Page<T>` representing one page
//       returned by the API:
//   - items:      T[]           — the resource items on this page
//   - nextCursor: string | null — null means "last page"
//   - total:      number        — total item count across all pages
export interface Page<T> {
  // your fields here
}

// -----------------------------------------------------------
// 4. Fetcher callback type
// -----------------------------------------------------------

// TODO: Define `PageFetcher<T>` — a function type that:
//   - accepts a cursor: string | null  (null = fetch the first page)
//   - returns Promise<Result<Page<T>, FetchError>>
//
// Requirement: express it as a generic type alias (not an interface).
export type PageFetcher<T> = unknown; // replace `unknown` with your implementation

// -----------------------------------------------------------
// 5. Client configuration
// -----------------------------------------------------------

// TODO: Define interface `PaginatedClientConfig<T>` with:
//   - fetcher:   PageFetcher<T>
//   - maxPages?: number   — optional hard cap on pages to fetch (default: unlimited)
//   - signal?:  AbortSignal — optional cancellation signal
export interface PaginatedClientConfig<T> {
  // your fields here
}

// -----------------------------------------------------------
// 6. Page result yielded to the caller
// -----------------------------------------------------------

// TODO: Define `PageOutcome<T>` — what the async generator yields
//       for each attempted page fetch:
//   - result:      Result<Page<T>, FetchError>
//   - pageIndex:   number   — 0-based index of this page attempt
//   - cursorUsed:  string | null — the cursor that was sent for this fetch
export interface PageOutcome<T> {
  // your fields here
}

// -----------------------------------------------------------
// 7. Async generator: fetchPages
// -----------------------------------------------------------

// TODO: Implement `fetchPages<T>`, an async generator that:
//
//   Requirement 1 — Iterate cursor chain:
//     Start with cursor = null. After each successful page, read
//     nextCursor from the response. Stop when nextCursor is null
//     (end of data) or when maxPages is reached.
//
//   Requirement 2 — Yield PageOutcome for every attempt:
//     Yield one PageOutcome<T> per fetch attempt, whether the fetch
//     succeeded (Ok) or failed (Err). On an Err, stop iterating.
//
//   Requirement 3 — Respect AbortSignal:
//     Before each fetch, check if signal?.aborted is true.
//     If so, yield a final PageOutcome whose result is an Err with
//     kind "network" and message "Aborted" — then return.
//
//   Requirement 4 — maxPages cap:
//     If maxPages is set, stop after that many successful pages
//     (do not count failed attempts against the cap).
//
//   Requirement 5 — Type safety:
//     The generator must be typed as AsyncGenerator<PageOutcome<T>, void, unknown>.
export async function* fetchPages<T>(
  config: PaginatedClientConfig<T>
): AsyncGenerator<PageOutcome<T>, void, unknown> {
  // TODO: implement
}

// -----------------------------------------------------------
// 8. Collector utility: collectAll
// -----------------------------------------------------------

// TODO: Implement `collectAll<T>`, which:
//
//   Requirement 1 — Drains the generator:
//     Consumes all yielded PageOutcomes from fetchPages.
//
//   Requirement 2 — Accumulates items:
//     On each Ok page, appends page.items into a running T[] array.
//
//   Requirement 3 — Collects errors:
//     On each Err page, appends the FetchError to a FetchError[] array.
//     Continue iterating (don't stop on error — fetchPages already stops,
//     but collectAll must not add extra stopping logic).
//
//   Requirement 4 — Returns a typed summary:
//     Return { items: T[]; errors: FetchError[]; pagesConsumed: number }
//     where pagesConsumed is the total number of PageOutcomes received.
export async function collectAll<T>(
  config: PaginatedClientConfig<T>
): Promise<{ items: T[]; errors: FetchError[]; pagesConsumed: number }> {
  // TODO: implement
}

// -----------------------------------------------------------
// 9. Type-level helper: ExtractOk
// -----------------------------------------------------------

// TODO: Define a conditional type `ExtractOk<R>` that, given a
//       Result<T, E>, resolves to T. If R is not a Result, resolve to never.
//
// Example:
//   ExtractOk<Result<User, FetchError>>  →  User
export type ExtractOk<R> = never; // replace `never` with your implementation
