// ============================================================
// Typed Paginated API Client with Result Chaining
// challenge.ts
// ============================================================
// REQUIREMENTS
// 1. Define a `Result<T, E>` discriminated union with `ok` and `err` variants.
// 2. Define `Page<T>` to represent a single API response page (items, nextCursor).
// 3. Implement `fetchPage` — a typed async function that simulates an HTTP fetch
//    and returns `Promise<Result<Page<T>, ApiError>>`.
// 4. Implement `fetchAllPages` — traverses all pages via cursor, collecting items,
//    and short-circuits on the first error, returning `Promise<Result<T[], ApiError>>`.
// 5. Implement `mapResult` — a generic helper that transforms the `ok` value of a
//    Result without touching the `err` branch (functor map).
// 6. Implement `flatMapResult` — chains a Result-returning function over the `ok`
//    value (monadic bind), propagating errors transparently.
// 7. All functions must compile under strict: true with no `any` usage.
// ============================================================

// ----- Error Types -------------------------------------------------------

export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "PARSE_ERROR"
  | "UNKNOWN";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  /** HTTP status code, if applicable */
  status?: number;
}

// ----- REQUIREMENT 1: Result<T, E> ---------------------------------------
// Define a discriminated union with two variants:
//   - Ok<T>:  { success: true;  value: T }
//   - Err<E>: { success: false; error: E }
// Then alias Result<T, E> as the union of the two.

export type Ok<T> = TODO; // replace TODO
export type Err<E> = TODO; // replace TODO
export type Result<T, E> = TODO; // replace TODO

// Convenience constructors (implement these — no `any`, no type assertions):
export function ok<T>(value: T): Ok<T> {
  // TODO
  throw new Error("Not implemented");
}

export function err<E>(error: E): Err<E> {
  // TODO
  throw new Error("Not implemented");
}

// ----- REQUIREMENT 2: Page<T> --------------------------------------------
// A page carries:
//   - items: T[]
//   - nextCursor: string | null   (null means no more pages)
//   - totalCount: number          (total items across ALL pages, from server)

export interface Page<T> {
  // TODO — define the fields described above
}

// ----- REQUIREMENT 3: fetchPage ------------------------------------------
// Simulate fetching a single page from the API.
// Signature:
//   fetchPage<T>(
//     endpoint: string,
//     cursor: string | null,
//     adapter: PageAdapter<T>,
//   ): Promise<Result<Page<T>, ApiError>>
//
// A `PageAdapter<T>` is a function that receives raw unknown JSON and either
// returns a typed `Page<T>` or throws an Error (you must catch it and return
// an Err with code "PARSE_ERROR").
//
// Use the provided `simulateFetch` helper to get the raw payload.

export type PageAdapter<T> = (raw: unknown) => Page<T>;

/**
 * Internal fetch simulator — do NOT modify.
 * Returns raw unknown data or rejects with an Error whose message is
 * a JSON string: `{ "code": ApiErrorCode, "status": number }`.
 */
export async function simulateFetch(
  endpoint: string,
  cursor: string | null
): Promise<unknown> {
  // Stub — replaced by mock in tests.
  void endpoint;
  void cursor;
  return {};
}

export async function fetchPage<T>(
  endpoint: string,
  cursor: string | null,
  adapter: PageAdapter<T>
): Promise<Result<Page<T>, ApiError>> {
  // TODO
  // Hint: wrap simulateFetch in try/catch.
  //   - If simulateFetch rejects, parse the error message JSON to build ApiError.
  //     If JSON parsing itself fails, use code "NETWORK_ERROR".
  //   - If the adapter throws, return Err with code "PARSE_ERROR".
  //   - On success, return Ok(page).
  throw new Error("Not implemented");
}

// ----- REQUIREMENT 4: fetchAllPages --------------------------------------
// Traverse ALL pages starting from cursor `null`, collecting every item.
// Short-circuit and return the first Err encountered.
// On full success return Ok(allItems).

export async function fetchAllPages<T>(
  endpoint: string,
  adapter: PageAdapter<T>
): Promise<Result<T[], ApiError>> {
  // TODO
  // Hint: use a while loop; check page.nextCursor to decide whether to continue.
  throw new Error("Not implemented");
}

// ----- REQUIREMENT 5: mapResult ------------------------------------------
// Transform the `ok` value of a Result, leaving `err` untouched.
// Signature: mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>

export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  // TODO
  throw new Error("Not implemented");
}

// ----- REQUIREMENT 6: flatMapResult --------------------------------------
// Chain a Result-returning function over the `ok` value.
// If the input is already Err, return it unchanged.
// Signature: flatMapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E>

export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  // TODO
  throw new Error("Not implemented");
}
