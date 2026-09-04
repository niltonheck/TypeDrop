// ============================================================
// Typed HTTP Retry Client with Exponential Backoff & Error Classification
// ============================================================
// TOPICS: discriminated unions, generics, conditional types,
//         branded types, Result<T,E>, async/retry logic
// ============================================================

// ── 1. Branded primitive for HTTP status codes ───────────────
type HttpStatus = number & { readonly __brand: "HttpStatus" };

/** Cast a plain number to a branded HttpStatus. */
function toHttpStatus(code: number): HttpStatus {
  return code as HttpStatus; // sole permitted use of `as` in this file
}

// ── 2. Error hierarchy (discriminated union) ─────────────────
/**
 * Requirement 1 — Define a discriminated union `HttpError` with
 * exactly three members, each carrying a `kind` discriminant:
 *
 *  • "network"    — a transient connectivity failure; carries `message: string`
 *  • "client"     — a 4xx response that must NOT be retried;
 *                   carries `status: HttpStatus` and `body: string`
 *  • "server"     — a 5xx response that MAY be retried;
 *                   carries `status: HttpStatus` and `body: string`
 *
 * All three members must share no extra fields beyond their own.
 */
// TODO: declare `HttpError` here

// ── 3. Result type ───────────────────────────────────────────
/**
 * Requirement 2 — Define a generic `Result<T, E>` discriminated union:
 *  • `{ ok: true;  value: T }`
 *  • `{ ok: false; error: E }`
 *
 * Then define the convenience alias:
 *   `HttpResult<T> = Result<T, HttpError>`
 */
// TODO: declare `Result<T, E>` and `HttpResult<T>` here

// ── 4. Request / Response shapes ────────────────────────────
interface RequestConfig<TBody> {
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Typed request body — `undefined` for bodyless methods */
  body?: TBody;
  headers?: Record<string, string>;
}

/** The raw response returned by the transport layer. */
interface RawResponse {
  status: HttpStatus;
  body: string;
}

/**
 * Requirement 3 — Define the `RetryPolicy` interface:
 *  • `maxAttempts: number`          — total tries (including the first)
 *  • `baseDelayMs: number`          — delay before the 2nd attempt (ms)
 *  • `retryOn: ReadonlyArray<"network" | "server">`
 *                                   — which error kinds trigger a retry
 */
// TODO: declare `RetryPolicy` here

// ── 5. Transport abstraction ─────────────────────────────────
/**
 * A "transport" is an async function that performs a single raw HTTP call.
 * It resolves to a `RawResponse` on any HTTP response (even 4xx/5xx),
 * and rejects (throws) only on true network failures.
 *
 * Requirement 4 — Declare the `Transport` type as a generic function type:
 *   <TBody>(config: RequestConfig<TBody>) => Promise<RawResponse>
 */
// TODO: declare `Transport` type here

// ── 6. Response classifier ───────────────────────────────────
/**
 * Requirement 5 — Implement `classifyResponse`:
 *   (raw: RawResponse) => HttpResult<string>
 *
 * Rules:
 *  • status 200–299 → `{ ok: true, value: raw.body }`
 *  • status 400–499 → `{ ok: false, error: { kind: "client", status, body } }`
 *  • status 500–599 → `{ ok: false, error: { kind: "server", status, body } }`
 *  • anything else  → treat as a "server" error with the raw status
 */
export function classifyResponse(raw: RawResponse): HttpResult<string> {
  // TODO
  throw new Error("Not implemented");
}

// ── 7. Delay helper ─────────────────────────────────────────
/**
 * Requirement 6 — Implement `exponentialDelay`:
 *   (baseMs: number, attempt: number) => Promise<void>
 *
 * Formula: wait `baseMs * 2^(attempt - 1)` milliseconds.
 *  • attempt 1 → baseMs * 1
 *  • attempt 2 → baseMs * 2
 *  • attempt 3 → baseMs * 4
 *  …and so on.
 *
 * Use `setTimeout` wrapped in a Promise.
 */
export function exponentialDelay(baseMs: number, attempt: number): Promise<void> {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. Core retry client ─────────────────────────────────────
/**
 * Requirement 7 — Implement `fetchWithRetry`:
 *
 *   async function fetchWithRetry<TBody>(
 *     config: RequestConfig<TBody>,
 *     transport: Transport,
 *     policy: RetryPolicy,
 *   ): Promise<HttpResult<string>>
 *
 * Behaviour:
 *  a) Call `transport(config)`. If it throws, wrap it as a "network" error.
 *  b) Pass the raw response through `classifyResponse`.
 *  c) If the result is `ok`, return it immediately.
 *  d) If the error's `kind` is NOT in `policy.retryOn`, return the error immediately.
 *  e) If `maxAttempts` have been exhausted, return the last error.
 *  f) Otherwise, call `exponentialDelay(policy.baseDelayMs, attemptNumber)`
 *     and then retry from step (a).
 *
 * The function must be generic over `TBody`.
 */
// TODO: implement `fetchWithRetry` here

// ── 9. Error renderer ────────────────────────────────────────
/**
 * Requirement 8 — Implement `renderError`:
 *   (error: HttpError) => string
 *
 * Use an exhaustive switch on `error.kind` and return a human-readable string:
 *  • "network" → `"Network error: <message>"`
 *  • "client"  → `"Client error <status>: <body>"`
 *  • "server"  → `"Server error <status>: <body>"`
 *
 * The compiler must catch any unhandled `kind` via the exhaustive check pattern
 * (assign `error` to a `never` variable in the default branch).
 */
export function renderError(error: HttpError): string {
  // TODO
  throw new Error("Not implemented");
}

// ── 10. Typed convenience wrappers ───────────────────────────
/**
 * Requirement 9 — Implement two typed wrappers using `fetchWithRetry`:
 *
 *  • `get<TResponse>(url: string, transport: Transport, policy: RetryPolicy): Promise<HttpResult<string>>`
 *    — Issues a GET request (no body).
 *
 *  • `post<TBody>(url: string, body: TBody, transport: Transport, policy: RetryPolicy): Promise<HttpResult<string>>`
 *    — Issues a POST request with a typed body.
 *
 * Both must delegate entirely to `fetchWithRetry`.
 */
// TODO: implement `get` and `post` here

// ── Exports (do not remove) ───────────────────────────────────
export { toHttpStatus, RequestConfig, RawResponse, RetryPolicy, Transport, HttpError, HttpResult, Result };
