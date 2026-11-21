// ============================================================
// Typed HTTP API Client: Paginated Fetch, Response Validation & Retry
// ============================================================
// SCENARIO: You are building the data-fetching core for a dashboard that
// pulls paginated records from a REST API. Raw responses arrive as `unknown`,
// must be validated into strongly-typed pages, retried on transient failures
// with a typed retry policy, and aggregated into a single typed collection.
//
// YOUR TASK: Implement every function marked TODO below.
// Rules:
//   - No `any`, no type assertions (`as`), no non-null assertions (`!`)
//   - strict: true must pass
//   - All runtime validation must go through the provided `validate*` helpers
// ============================================================

// ------------------------------------------------------------------
// 1. CORE DOMAIN TYPES
// ------------------------------------------------------------------

/** Supported sort directions */
export type SortDirection = "asc" | "desc";

/** Fields that can be sorted on a User record */
export type UserSortField = "name" | "email" | "createdAt";

/** A validated user record returned by the API */
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  createdAt: string; // ISO-8601
}

/** A single page of results from the API */
export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

/** Parameters for a paginated request */
export interface PageRequest {
  page: number;
  pageSize: number;
  sort?: { field: UserSortField; direction: SortDirection };
}

// ------------------------------------------------------------------
// 2. RESULT TYPE  (no external libraries)
// ------------------------------------------------------------------

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

/** Constructor helpers */
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

// ------------------------------------------------------------------
// 3. ERROR HIERARCHY  (discriminated union)
// ------------------------------------------------------------------

export type ApiError =
  | { kind: "network";    message: string }
  | { kind: "timeout";    message: string; afterMs: number }
  | { kind: "http";       status: number;  message: string }
  | { kind: "validation"; fields: string[]; raw: unknown }
  | { kind: "exhausted";  attempts: number; lastError: ApiError };

// ------------------------------------------------------------------
// 4. RETRY POLICY
// ------------------------------------------------------------------

export interface RetryPolicy {
  /** Maximum total attempts (including the first) */
  maxAttempts: number;
  /** Base delay in ms; actual delay = baseDelayMs * attempt (linear backoff) */
  baseDelayMs: number;
  /** Only retry for these error kinds */
  retryOn: ReadonlyArray<ApiError["kind"]>;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 100,
  retryOn: ["network", "timeout"],
};

// ------------------------------------------------------------------
// 5. FETCH ABSTRACTION
// ------------------------------------------------------------------

/**
 * A typed "fetcher" — replaces raw `fetch` so it can be swapped in tests.
 * Returns a Result rather than throwing.
 */
export type Fetcher = (
  url: string,
  request: PageRequest
) => Promise<Result<unknown, ApiError>>;

// ------------------------------------------------------------------
// 6. RUNTIME VALIDATORS  (provided — do NOT modify)
// ------------------------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * Validates that `raw` conforms to the User shape.
 * Returns Ok<User> or Err<ApiError> with kind "validation".
 */
export function validateUser(raw: unknown): Result<User, ApiError> {
  if (!isRecord(raw)) {
    return err({ kind: "validation", fields: ["<root>"], raw });
  }
  const badFields: string[] = [];
  if (typeof raw["id"] !== "string") badFields.push("id");
  if (typeof raw["name"] !== "string") badFields.push("name");
  if (typeof raw["email"] !== "string") badFields.push("email");
  if (!["admin", "editor", "viewer"].includes(raw["role"] as string))
    badFields.push("role");
  if (typeof raw["createdAt"] !== "string") badFields.push("createdAt");

  if (badFields.length > 0) {
    return err({ kind: "validation", fields: badFields, raw });
  }
  return ok({
    id: raw["id"] as string,
    name: raw["name"] as string,
    email: raw["email"] as string,
    role: raw["role"] as User["role"],
    createdAt: raw["createdAt"] as string,
  });
}

/**
 * Validates that `raw` conforms to the Page<unknown> envelope shape.
 * Does NOT validate individual items — call validateUser per item separately.
 */
export function validatePageEnvelope(
  raw: unknown
): Result<{ data: unknown[]; page: number; pageSize: number; totalPages: number; totalItems: number }, ApiError> {
  if (!isRecord(raw)) {
    return err({ kind: "validation", fields: ["<root>"], raw });
  }
  const badFields: string[] = [];
  if (!Array.isArray(raw["data"])) badFields.push("data");
  if (typeof raw["page"] !== "number") badFields.push("page");
  if (typeof raw["pageSize"] !== "number") badFields.push("pageSize");
  if (typeof raw["totalPages"] !== "number") badFields.push("totalPages");
  if (typeof raw["totalItems"] !== "number") badFields.push("totalItems");

  if (badFields.length > 0) {
    return err({ kind: "validation", fields: badFields, raw });
  }
  return ok({
    data: raw["data"] as unknown[],
    page: raw["page"] as number,
    pageSize: raw["pageSize"] as number,
    totalPages: raw["totalPages"] as number,
    totalItems: raw["totalItems"] as number,
  });
}

// ------------------------------------------------------------------
// 7. DELAY HELPER  (provided — do NOT modify)
// ------------------------------------------------------------------

/** Resolves after `ms` milliseconds. Replace in tests via dependency injection. */
export type Delay = (ms: number) => Promise<void>;
export const realDelay: Delay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ------------------------------------------------------------------
// 8. YOUR IMPLEMENTATIONS
// ------------------------------------------------------------------

/**
 * TODO — implement this function.
 *
 * Parse a raw API response into a typed Page<User>.
 *
 * Requirements:
 *  R1. Validate the page envelope using `validatePageEnvelope`.
 *  R2. Validate every item in `data` using `validateUser`.
 *  R3. If ANY item fails validation, return Err with kind "validation";
 *      the `fields` array must contain the index (as a string, e.g. "2")
 *      of every invalid item, and `raw` must be the original raw value.
 *  R4. On success, return Ok<Page<User>> with all envelope fields preserved.
 */
export function parseUserPage(raw: unknown): Result<Page<User>, ApiError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO — implement this function.
 *
 * Fetch a single page with retry logic.
 *
 * Requirements:
 *  R5. Call `fetcher(url, request)` up to `policy.maxAttempts` times.
 *  R6. After a successful fetch (Ok), parse the response with `parseUserPage`
 *      and return the result immediately (do NOT retry a validation error).
 *  R7. On Err, retry only if the error's `kind` is listed in `policy.retryOn`.
 *      Wait `policy.baseDelayMs * attemptNumber` ms before each retry
 *      (attempt 1 = no wait, attempt 2 = 1× delay, attempt 3 = 2× delay, …).
 *  R8. If all attempts are exhausted, return Err with kind "exhausted",
 *      `attempts` set to the number of attempts made, and `lastError` set to
 *      the final error that caused the last failure.
 *  R9. Non-retryable errors must be returned immediately without further attempts.
 */
export async function fetchPageWithRetry(
  url: string,
  request: PageRequest,
  fetcher: Fetcher,
  policy: RetryPolicy,
  delay: Delay
): Promise<Result<Page<User>, ApiError>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO — implement this function.
 *
 * Fetch ALL pages for a given endpoint sequentially and return every User
 * in a single flat array.
 *
 * Requirements:
 *  R10. Start at page 1 with the provided `pageSize`.
 *  R11. After fetching each page, determine `totalPages` from the response
 *       and continue fetching until all pages are retrieved.
 *  R12. If ANY page fetch fails, stop immediately and return that Err.
 *  R13. Return Ok<User[]> containing all users from all pages in order.
 *  R14. Respect the provided `sort` option (pass it through to every PageRequest).
 */
export async function fetchAllUsers(
  url: string,
  options: {
    pageSize: number;
    sort?: PageRequest["sort"];
    fetcher: Fetcher;
    policy: RetryPolicy;
    delay: Delay;
  }
): Promise<Result<User[], ApiError>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO — implement this function.
 *
 * Group an array of Users by their `role` field.
 *
 * Requirements:
 *  R15. Return a `Record` keyed by `User["role"]` where every key that has at
 *       least one user is present; roles with zero users must be OMITTED
 *       (not present as empty arrays).
 *  R16. The return type must be `Partial<Record<User["role"], User[]>>` —
 *       do NOT widen it to a plain object type.
 *  R17. Users within each group must preserve their original order.
 */
export function groupUsersByRole(
  users: User[]
): Partial<Record<User["role"], User[]>> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO — implement this function.
 *
 * Produce a typed summary from a list of users.
 *
 * Requirements:
 *  R18. `total` = total number of users.
 *  R19. `byRole` = count per role (only roles that appear; same omission rule as R15).
 *  R20. `newestCreatedAt` = the ISO-8601 string of the most-recently-created user,
 *       or `null` if the list is empty.
 *  R21. The return type must be the `UserSummary` interface defined below — do not
 *       change that interface.
 */
export interface UserSummary {
  total: number;
  byRole: Partial<Record<User["role"], number>>;
  newestCreatedAt: string | null;
}

export function summariseUsers(users: User[]): UserSummary {
  // TODO
  throw new Error("Not implemented");
}
