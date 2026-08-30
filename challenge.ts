// ============================================================
// challenge.ts — Typed Paginated API Client
// ============================================================
// Topics: Generics, Conditional Types, Mapped Types,
//         Result<T,E> pattern, Async Iteration, Utility Types
// ============================================================

// ------------------------------------------------------------------
// 1. Core Result type — no `any`, no `as`, no `unknown` widening
// ------------------------------------------------------------------

/** A successful result carrying a value of type T */
export type Ok<T> = { readonly status: "ok"; readonly value: T };

/** A failed result carrying a typed error E */
export type Err<E> = { readonly status: "err"; readonly error: E };

/** Discriminated union result monad */
export type Result<T, E> = Ok<T> | Err<E>;

// TODO (1): Implement the two constructor helpers below.
// They must be inferred as their narrow literal types (no widening).
export function ok<T>(value: T): Ok<T> {
  // TODO
  throw new Error("not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 2. Pagination types
// ------------------------------------------------------------------

/**
 * A single page returned by the API.
 * `nextCursor` is present only when more pages exist.
 */
export type Page<T> = {
  readonly items: T[];
  readonly nextCursor: string | null;
  readonly totalCount: number;
};

/**
 * Options passed to the fetcher for each page request.
 * `cursor` is undefined on the very first request.
 */
export type FetchPageOptions = {
  readonly cursor: string | undefined;
  readonly pageSize: number;
};

/**
 * The shape of a function that fetches one page of resource T.
 * It must return a Result — never throw.
 */
export type PageFetcher<T, E> = (
  opts: FetchPageOptions
) => Promise<Result<Page<T>, E>>;

// ------------------------------------------------------------------
// 3. Paginated fetch errors
// ------------------------------------------------------------------

export type NetworkError = { readonly kind: "network"; readonly message: string };
export type ParseError   = { readonly kind: "parse";   readonly message: string; readonly page: number };
export type AuthError    = { readonly kind: "auth";    readonly statusCode: number };

/** Union of all errors the client can surface */
export type FetchError = NetworkError | ParseError | AuthError;

// ------------------------------------------------------------------
// 4. Accumulated result
// ------------------------------------------------------------------

/**
 * What `fetchAllPages` returns on success:
 *  - all items concatenated across every page
 *  - the total number of pages fetched
 *  - the `totalCount` from the *first* page (server-reported grand total)
 */
export type FetchAllResult<T> = {
  readonly items: T[];
  readonly pagesFetched: number;
  readonly reportedTotal: number;
};

// ------------------------------------------------------------------
// 5. TODO: implement `fetchAllPages`
// ------------------------------------------------------------------
/**
 * Fetches every page from a cursor-based paginated endpoint and
 * accumulates all items into a single `FetchAllResult<T>`.
 *
 * Requirements:
 * (R1) Call `fetcher` with `cursor: undefined` for the first page.
 * (R2) If any page returns an `Err`, stop immediately and return
 *      that same `Err` (do NOT fetch further pages).
 * (R3) Use the `nextCursor` from each page to request the next one;
 *      stop when `nextCursor` is `null`.
 * (R4) `reportedTotal` must come from the *first* page's `totalCount`.
 * (R5) `pagesFetched` is the count of pages successfully fetched.
 * (R6) The return type must be inferred — do NOT widen T or E.
 */
export async function fetchAllPages<T, E>(
  fetcher: PageFetcher<T, E>,
  pageSize: number
): Promise<Result<FetchAllResult<T>, E>> {
  // TODO
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 6. TODO: implement `mapFetchResult`
// ------------------------------------------------------------------
/**
 * Transforms the `items` array inside an `Ok<FetchAllResult<T>>`
 * using a mapping function, producing a new `Ok<FetchAllResult<U>>`.
 * If the input is an `Err`, it is returned unchanged.
 *
 * Requirements:
 * (R7) Must be generic over T, U, and E.
 * (R8) The mapping function receives a single item of type T and
 *      returns a value of type U.
 * (R9) All other fields (`pagesFetched`, `reportedTotal`) are
 *      preserved unchanged.
 */
export function mapFetchResult<T, U, E>(
  result: Result<FetchAllResult<T>, E>,
  mapFn: (item: T) => U
): Result<FetchAllResult<U>, E> {
  // TODO
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 7. TODO: implement `matchResult`
// ------------------------------------------------------------------
/**
 * Exhaustively matches a Result<T, E>, calling `onOk` for Ok values
 * and `onErr` for Err values. Returns the value produced by the
 * matched branch.
 *
 * Requirements:
 * (R10) Must be generic over T, E, and the return type R.
 * (R11) `onOk` receives the inner value of type T.
 * (R12) `onErr` receives the inner error of type E.
 * (R13) TypeScript must be able to infer R from the two callbacks
 *       without the caller providing it explicitly.
 */
export function matchResult<T, E, R>(
  result: Result<T, E>,
  onOk: (value: T) => R,
  onErr: (error: E) => R
): R {
  // TODO
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 8. Resource types used in the test harness
// ------------------------------------------------------------------

export type User = {
  readonly id: number;
  readonly name: string;
  readonly role: "admin" | "viewer" | "editor";
};

export type UserSummary = Pick<User, "id" | "name">;
