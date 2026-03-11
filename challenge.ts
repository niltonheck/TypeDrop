// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts
// Typed Paginated API Client with Result Chaining
// ─────────────────────────────────────────────────────────────────────────────
// REQUIREMENTS
// 1. Define a generic `Result<T, E>` discriminated union with `ok` and `err`
//    variants.  Provide `ok()` and `err()` constructor helpers.
// 2. Define a `Page<T>` type that holds an array of items, the current page
//    number, and an optional `nextPage` number (absent on the last page).
// 3. Implement `parsePage<T>` — a runtime validator that accepts `unknown`
//    input and a per-item validator, and returns `Result<Page<T>, ParseError>`.
//    It must reject non-objects, missing fields, and items that fail the
//    per-item validator.
// 4. Implement `fetchAllPages<T>` — an async function that:
//    a. Accepts a `fetcher` function typed as `(page: number) => Promise<unknown>`
//       and a per-item validator.
//    b. Starts at page 1, calls `parsePage` on each raw response.
//    c. Follows `nextPage` links until there are none.
//    d. Returns `Result<T[], FetchError>` — either all collected items or the
//       first error encountered (parse failure OR fetch exception).
// 5. Define a `ParseError` branded type with a `message` string and a
//    `ParseError` brand, and a `FetchError` branded type with a `message`
//    string, a `FetchError` brand, and an optional `cause: unknown`.
// 6. Implement `mapResult<T, U, E>` — a utility that transforms the `ok` value
//    of a `Result<T, E>` using a mapping function, leaving `err` untouched.
// 7. Implement `chainResult<T, U, E>` — a utility that flat-maps the `ok`
//    value of a `Result<T, E>` using a function that itself returns a
//    `Result<U, E>`, leaving `err` untouched.
//
// CONSTRAINTS
// - No `any`, no type assertions (`as`), no non-null assertions (`!`).
// - All functions must compile under `strict: true`.
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Result type & constructors ────────────────────────────────────────────

export type Result<T, E> = // TODO: discriminated union  { ok: true; value: T } | { ok: false; error: E }

export function ok<T, E = never>(value: T): Result<T, E> {
  // TODO
  throw new Error("Not implemented");
}

export function err<E, T = never>(error: E): Result<T, E> {
  // TODO
  throw new Error("Not implemented");
}

// ── 2. Page type ─────────────────────────────────────────────────────────────

export type Page<T> = {
  // TODO: items: T[], page: number, nextPage?: number
};

// ── 3. Branded error types ────────────────────────────────────────────────────

declare const ParseErrorBrand: unique symbol;
export type ParseError = {
  // TODO: message: string + brand
};

declare const FetchErrorBrand: unique symbol;
export type FetchError = {
  // TODO: message: string + brand + optional cause: unknown
};

// ── 4. Constructor helpers for errors ────────────────────────────────────────

export function makeParseError(message: string): ParseError {
  // TODO
  throw new Error("Not implemented");
}

export function makeFetchError(message: string, cause?: unknown): FetchError {
  // TODO
  throw new Error("Not implemented");
}

// ── 5. parsePage ─────────────────────────────────────────────────────────────

/**
 * Validates raw unknown data into a Page<T>.
 * @param raw       - the unknown value to validate
 * @param parseItem - validator for each item; returns Result<T, ParseError>
 */
export function parsePage<T>(
  raw: unknown,
  parseItem: (item: unknown) => Result<T, ParseError>
): Result<Page<T>, ParseError> {
  // TODO:
  // - Confirm `raw` is a non-null object
  // - Confirm `raw.items` is an array
  // - Confirm `raw.page` is a number
  // - If `raw.nextPage` is present, confirm it is a number
  // - Validate each item with `parseItem`; return first failure immediately
  throw new Error("Not implemented");
}

// ── 6. fetchAllPages ──────────────────────────────────────────────────────────

/**
 * Fetches every page from a paginated endpoint and collects all items.
 * @param fetcher   - async function that returns raw unknown for a given page number
 * @param parseItem - per-item validator
 */
export async function fetchAllPages<T>(
  fetcher: (page: number) => Promise<unknown>,
  parseItem: (item: unknown) => Result<T, ParseError>
): Promise<Result<T[], FetchError>> {
  // TODO:
  // - Start at page 1
  // - In a loop: call fetcher, parsePage, collect items
  // - If parsePage fails, wrap the ParseError message in a FetchError and return
  // - If fetcher throws, catch and return a FetchError with the thrown value as cause
  // - Follow nextPage until absent
  throw new Error("Not implemented");
}

// ── 7. mapResult ─────────────────────────────────────────────────────────────

export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. chainResult ────────────────────────────────────────────────────────────

export function chainResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, E>
): Result<U, E> {
  // TODO
  throw new Error("Not implemented");
}
