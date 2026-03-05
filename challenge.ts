// ============================================================
// challenge.ts — Typed Paginated API Client with Result Chaining
// ============================================================
// Implement every function marked TODO.
// Requirements are listed as numbered comments.
// Compile with: tsc --strict --noEmit challenge.ts
// ============================================================

// ── 1. Result type ───────────────────────────────────────────
// Req 1: Define a discriminated-union Result<T, E> with two
//        variants: Ok<T> and Err<E>.
//        - Ok  carries `value: T`
//        - Err carries `error: E`
//        Both variants must have a `readonly kind` discriminant.

export type Ok<T> = { readonly kind: "ok"; readonly value: T };
export type Err<E> = { readonly kind: "err"; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

// Helper constructors (already provided — do NOT modify)
export const ok  = <T>(value: T): Ok<T>   => ({ kind: "ok",  value });
export const err = <E>(error: E): Err<E>  => ({ kind: "err", error });

// ── 2. API error hierarchy ───────────────────────────────────
// Req 2: Define a discriminated union `ApiError` with three members:
//        - NetworkError  { kind: "network";  message: string }
//        - NotFoundError { kind: "not_found"; resource: string }
//        - ParseError    { kind: "parse";    raw: string }
//        Use `readonly` on every field.

export type NetworkError  = { readonly kind: "network";   readonly message: string };
export type NotFoundError = { readonly kind: "not_found"; readonly resource: string };
export type ParseError    = { readonly kind: "parse";     readonly raw: string };
export type ApiError = NetworkError | NotFoundError | ParseError;

// ── 3. Paginated envelope ────────────────────────────────────
// Req 3: Define a generic `Page<T>` interface that represents one
//        page of results from the API:
//        - items:    T[]
//        - nextCursor: string | null   (null means no more pages)
//        - total:    number

export interface Page<T> {
  readonly items: T[];
  readonly nextCursor: string | null;
  readonly total: number;
}

// ── 4. Fetcher abstraction ───────────────────────────────────
// Req 4: Define a `PageFetcher<T>` type — a function that accepts
//        an optional cursor (`string | null`) and returns
//        `Promise<Result<Page<T>, ApiError>>`.

export type PageFetcher<T> = (cursor: string | null) => Promise<Result<Page<T>, ApiError>>;

// ── 5. fetchAllPages ─────────────────────────────────────────
// Req 5: Implement `fetchAllPages<T>`.
//        - Walks every page by following `nextCursor` until it is null.
//        - Accumulates all items into a single array.
//        - Returns `Result<T[], ApiError>`.
//        - On the FIRST page that returns an Err, stop immediately
//          and return that Err (do NOT fetch further pages).
//        - Pages must be fetched SEQUENTIALLY (not in parallel).

export async function fetchAllPages<T>(
  fetcher: PageFetcher<T>
): Promise<Result<T[], ApiError>> {
  // TODO
  throw new Error("Not implemented");
}

// ── 6. mapResult ─────────────────────────────────────────────
// Req 6: Implement a generic `mapResult<T, U, E>` function.
//        - If the result is Ok, apply `fn` to its value and return Ok<U>.
//        - If the result is Err, return the Err unchanged.
//        - Must be fully generic with no type assertions.

export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  // TODO
  throw new Error("Not implemented");
}

// ── 7. flatMapResult ─────────────────────────────────────────
// Req 7: Implement `flatMapResult<T, U, E>`.
//        - If the result is Ok, apply `fn` (which itself returns a Result)
//          and return that inner Result directly (no double-wrapping).
//        - If the result is Err, return it unchanged.

export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. Resource definitions ──────────────────────────────────
// Req 8: Define two resource types used by the dashboard:

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: "admin" | "viewer" | "editor";
}

export interface AuditLog {
  readonly id: string;
  readonly userId: string;
  readonly action: string;
  readonly timestamp: number; // Unix ms
}

// ── 9. validateUser / validateAuditLog ───────────────────────
// Req 9: Implement two runtime validators:
//
//   validateUser(raw: unknown): Result<User, ParseError>
//   validateAuditLog(raw: unknown): Result<AuditLog, ParseError>
//
//        - Use type narrowing (typeof, `in`, etc.) — NO `as` casts.
//        - Return ParseError with `raw` set to JSON.stringify(raw)
//          if any required field is missing or the wrong type.
//        - For `role`, also check it is one of the three valid literals.

export function validateUser(raw: unknown): Result<User, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

export function validateAuditLog(raw: unknown): Result<AuditLog, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

// ── 10. validatePage ─────────────────────────────────────────
// Req 10: Implement `validatePage<T>`.
//         - Accepts `raw: unknown` and a per-item validator
//           `(item: unknown) => Result<T, ParseError>`.
//         - Returns `Result<Page<T>, ParseError>`.
//         - Validates the envelope fields (items array, nextCursor, total)
//           and then validates each item, failing on the first bad item.

export function validatePage<T>(
  raw: unknown,
  itemValidator: (item: unknown) => Result<T, ParseError>
): Result<Page<T>, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

// ── 11. groupById ────────────────────────────────────────────
// Req 11: Implement `groupById<T extends { id: string }>`.
//         - Accepts `T[]` and returns `ReadonlyMap<string, T>`.
//         - Uses a generic constraint — no extra type parameters needed.

export function groupById<T extends { id: string }>(
  items: T[]
): ReadonlyMap<string, T> {
  // TODO
  throw new Error("Not implemented");
}

// ── 12. pipeResults ──────────────────────────────────────────
// Req 12: Implement `pipeResults<T, E>`.
//         - Accepts `Result<T, E>[]` (an array of results).
//         - Returns `Result<T[], E>`.
//         - If ALL are Ok, returns Ok with an array of all values
//           in the original order.
//         - If ANY is Err, returns the first Err encountered.

export function pipeResults<T, E>(results: Result<T, E>[]): Result<T[], E> {
  // TODO
  throw new Error("Not implemented");
}
