// =============================================================================
// Challenge: Typed Paginated API Client with Result Accumulation
// =============================================================================
// SCENARIO:
//   You're building the data-sync engine for an analytics dashboard that pulls
//   records from a paginated REST API. Each page of results must be fetched
//   sequentially, validated from `unknown` into a typed shape, and accumulated
//   into a single PagedResult<T> — stopping early on fatal errors and surfacing
//   per-page failures without losing successfully fetched data.
//
// REQUIREMENTS:
//   1. Define the branded type `PageToken` (a branded string) and the
//      `PagedResponse<T>` shape returned by the mock fetcher.
//   2. Define a `ValidationError` and `FetchError` (discriminated union `SyncError`)
//      so callers can tell them apart exhaustively.
//   3. Implement `validateRecord` — a generic type-guard that narrows `unknown`
//      to `T` using a `Schema<T>` (a plain-object map of field → type-string pairs).
//   4. Implement `fetchAllPages` — a generic async function that:
//        a. Fetches pages one at a time (sequential, not parallel) until there
//           is no `nextPageToken`.
//        b. Validates every record on each page with `validateRecord`.
//        c. Accumulates ALL valid records across pages into `items`.
//        d. Accumulates per-page `SyncError[]` into `errors` (never throws).
//        e. Stops fetching further pages if the fetcher itself throws
//           (treat as a fatal `FetchError` — still return accumulated data so far).
//   5. Return a `PagedResult<T>` with `items`, `errors`, and `totalPagesFetched`.
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Branded type for page tokens
// ---------------------------------------------------------------------------

// TODO: Define `PageToken` as a branded string type.
// A branded type uses an intersection with a unique marker so that plain
// strings cannot be silently passed where a PageToken is required.
export type PageToken = string & { readonly __brand: "PageToken" };

export function makePageToken(raw: string): PageToken {
  return raw as PageToken; // allowed only in this factory — nowhere else in your solution
}

// ---------------------------------------------------------------------------
// 2. API response shape
// ---------------------------------------------------------------------------

// TODO: Define `PagedResponse<T>`.
// It must contain:
//   - `data`: T[]                          — the records on this page
//   - `nextPageToken`: PageToken | null     — null means last page
export type PagedResponse<T> = {
  // TODO: fill in the fields
  data: T[];
  nextPageToken: PageToken | null;
};

// ---------------------------------------------------------------------------
// 3. Error types (discriminated union)
// ---------------------------------------------------------------------------

// TODO: Define `ValidationError` with:
//   - kind: "validation"
//   - field: string   — which field failed
//   - expected: string
//   - received: string
export type ValidationError = {
  // TODO
  kind: "validation";
  field: string;
  expected: string;
  received: string;
};

// TODO: Define `FetchError` with:
//   - kind: "fetch"
//   - page: number    — which page number failed (1-based)
//   - message: string
export type FetchError = {
  // TODO
  kind: "fetch";
  page: number;
  message: string;
};

// TODO: Define `SyncError` as the discriminated union of the two above.
export type SyncError = ValidationError | FetchError;

// ---------------------------------------------------------------------------
// 4. Schema-based validator
// ---------------------------------------------------------------------------

// A Schema<T> maps every key of T to the expected `typeof` string for that field.
// Example: Schema<{id: number; name: string}> = { id: "number"; name: "string" }
export type Schema<T> = {
  [K in keyof T]: string; // the expected typeof result for that field
};

// TODO: Implement `validateRecord`.
// - It is a generic type-guard: (raw: unknown, schema: Schema<T>) => raw is T
// - For each key in the schema, check that typeof (raw as object)[key] === schema[key].
// - If any field fails, push a ValidationError into `errors` (passed by reference)
//   and return false.
// - If all fields pass, return true.
//
// REQUIREMENT: No `any`. Use `Record<string, unknown>` for the intermediate cast.
export function validateRecord<T>(
  raw: unknown,
  schema: Schema<T>,
  errors: ValidationError[]
): raw is T {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 5. Accumulated result
// ---------------------------------------------------------------------------

// TODO: Define `PagedResult<T>`:
//   - items: T[]
//   - errors: SyncError[]
//   - totalPagesFetched: number
export type PagedResult<T> = {
  // TODO
  items: T[];
  errors: SyncError[];
  totalPagesFetched: number;
};

// ---------------------------------------------------------------------------
// 6. Core function
// ---------------------------------------------------------------------------

// The fetcher is injected so it can be mocked in tests.
// It accepts an optional PageToken (undefined = first page) and returns a
// PagedResponse<unknown> — records are unvalidated at this layer.
export type Fetcher = (token: PageToken | undefined) => Promise<PagedResponse<unknown>>;

// TODO: Implement `fetchAllPages<T>`.
//
// Generic parameters:
//   T — the target record type
//
// Parameters:
//   fetcher  — the injected page-fetching function
//   schema   — Schema<T> used to validate each record
//
// Behavior (see REQUIREMENTS above):
//   a. Start with token = undefined (first page).
//   b. Loop: call fetcher(token), validate each item, collect errors.
//   c. Stop when nextPageToken is null OR fetcher throws.
//   d. On fetcher throw: push a FetchError, break, return what was collected.
//   e. Never throw — always return PagedResult<T>.
//
// Requirement: No `any`. The return type must be explicitly `Promise<PagedResult<T>>`.
export async function fetchAllPages<T>(
  fetcher: Fetcher,
  schema: Schema<T>
): Promise<PagedResult<T>> {
  // TODO: implement
  throw new Error("Not implemented");
}
