// ============================================================
// Typed Streaming Log Pipeline with Severity Routing & Structured Sinks
// ============================================================
// TOPICS: discriminated unions · conditional types · mapped types ·
//         generics · infer · Result<T,E> · middleware chains ·
//         branded types · exhaustive matching · Promise.allSettled
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

/** An ISO-8601 timestamp string that has been validated */
export type Timestamp = Brand<string, "Timestamp">;

/** A non-empty service name string */
export type ServiceName = Brand<string, "ServiceName">;

// ------------------------------------------------------------------
// 2. SEVERITY LEVELS & DISCRIMINATED LOG ENTRIES
// ------------------------------------------------------------------

export type SeverityLevel = "debug" | "info" | "warn" | "error" | "fatal";

/** Payload carried by each severity variant */
export interface DebugPayload   { readonly message: string; readonly context?: Record<string, string> }
export interface InfoPayload    { readonly message: string; readonly durationMs?: number }
export interface WarnPayload    { readonly message: string; readonly threshold: number; readonly actual: number }
export interface ErrorPayload   { readonly message: string; readonly stack: string; readonly code: string }
export interface FatalPayload   { readonly message: string; readonly stack: string; readonly code: string; readonly triggeredShutdown: boolean }

/** Map from severity level → its payload type */
export type SeverityPayloadMap = {
  debug: DebugPayload;
  info:  InfoPayload;
  warn:  WarnPayload;
  error: ErrorPayload;
  fatal: FatalPayload;
};

/**
 * A discriminated log entry — the `severity` field acts as the discriminant
 * and the `payload` type is derived from SeverityPayloadMap.
 *
 * TODO: Define `LogEntry` as a union of all five severity variants using a
 *       mapped/distributed type so that each variant is:
 *         { severity: S; payload: SeverityPayloadMap[S]; service: ServiceName; timestamp: Timestamp }
 *
 * Hint: Use a distributive mapped type then index into it.
 */
export type LogEntry = {
  [S in SeverityLevel]: {
    readonly severity:  S;
    readonly payload:   SeverityPayloadMap[S];
    readonly service:   ServiceName;
    readonly timestamp: Timestamp;
  };
}[SeverityLevel];

// ------------------------------------------------------------------
// 3. RESULT TYPE
// ------------------------------------------------------------------

export type Ok<T>  = { readonly ok: true;  readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export type ParseError = { readonly kind: "MISSING_FIELD" | "INVALID_SEVERITY" | "INVALID_TIMESTAMP"; readonly detail: string };

// ------------------------------------------------------------------
// 4. PARSE UNKNOWN INPUT → Result<LogEntry, ParseError>
// ------------------------------------------------------------------

/**
 * TODO: Implement `parseLogEntry`.
 *
 * Requirements (numbered for the checklist):
 *   R1. Accept a single `unknown` value.
 *   R2. Return `Result<LogEntry, ParseError>`.
 *   R3. Validate that the input is a non-null object with fields:
 *         severity (one of the five levels), service (non-empty string),
 *         timestamp (string matching /^\d{4}-\d{2}-\d{2}T/), payload (object).
 *   R4. If any required top-level field is missing or wrong type → Err with kind "MISSING_FIELD".
 *   R5. If severity is not one of the five levels → Err with kind "INVALID_SEVERITY".
 *   R6. If timestamp does not match the pattern → Err with kind "INVALID_TIMESTAMP".
 *   R7. On success, return Ok wrapping a fully-typed LogEntry (use branded constructors below).
 *   R8. Must NOT use `any` or type assertions (`as`).
 *       Hint: use type-guard helper functions with explicit return type predicates.
 */
export function parseLogEntry(raw: unknown): Result<LogEntry, ParseError> {
  // TODO
  throw new Error("Not implemented");
}

// Branded constructors — provided for you, use these in parseLogEntry
export function makeTimestamp(s: string): Timestamp { return s as unknown as Timestamp; }
export function makeServiceName(s: string): ServiceName { return s as unknown as ServiceName; }

// ------------------------------------------------------------------
// 5. MIDDLEWARE (TRANSFORM) CHAIN
// ------------------------------------------------------------------

/**
 * A middleware receives a LogEntry and returns a (possibly transformed)
 * LogEntry, or null to DROP the entry from the pipeline.
 */
export type LogMiddleware = (entry: LogEntry) => LogEntry | null;

/**
 * TODO: Implement `buildPipeline`.
 *
 * Requirements:
 *   R9.  Accept an ordered array of `LogMiddleware` functions.
 *   R10. Return a single composed `LogMiddleware` that runs them left-to-right.
 *   R11. If any middleware returns null, short-circuit and return null immediately.
 */
export function buildPipeline(middlewares: readonly LogMiddleware[]): LogMiddleware {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Built-in middleware factory — TODO: Implement `severityFilter`.
 *
 * Requirements:
 *   R12. Accept a minimum `SeverityLevel`.
 *   R13. Return a `LogMiddleware` that drops (returns null) any entry whose
 *        severity rank is strictly below the minimum.
 *   R14. Severity rank (ascending): debug=0, info=1, warn=2, error=3, fatal=4.
 */
export function severityFilter(minLevel: SeverityLevel): LogMiddleware {
  // TODO
  throw new Error("Not implemented");
}

/**
 * Built-in middleware factory — TODO: Implement `serviceRedactor`.
 *
 * Requirements:
 *   R15. Accept a `fieldsToRedact: readonly string[]` — keys inside `payload`
 *        whose string values should be replaced with `"[REDACTED]"`.
 *   R16. Return a `LogMiddleware` that returns a new LogEntry with matching
 *        payload string-fields redacted (non-string fields left untouched).
 *   R17. Must NOT mutate the original entry.
 */
export function serviceRedactor(fieldsToRedact: readonly string[]): LogMiddleware {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. SINKS
// ------------------------------------------------------------------

/** Every sink receives a LogEntry and returns a Promise (async I/O). */
export type LogSink = (entry: LogEntry) => Promise<void>;

/** Per-sink outcome after draining the pipeline */
export type SinkOutcome =
  | { readonly kind: "flushed"; readonly count: number }
  | { readonly kind: "partial"; readonly count: number; readonly failures: number }
  | { readonly kind: "failed";  readonly reason: string };

// ------------------------------------------------------------------
// 7. DRAIN REPORT
// ------------------------------------------------------------------

/**
 * The final report returned after processing all entries through all sinks.
 * `sinkReports` is a Record keyed by sink name → SinkOutcome.
 */
export interface DrainReport {
  readonly totalParsed:   number;
  readonly totalDropped:  number;    // dropped by middleware (null returns)
  readonly totalInvalid:  number;    // failed parsing
  readonly sinkReports:   Record<string, SinkOutcome>;
}

// ------------------------------------------------------------------
// 8. PIPELINE RUNNER
// ------------------------------------------------------------------

/**
 * TODO: Implement `drainPipeline`.
 *
 * Requirements:
 *   R18. Accept:
 *          - `rawEntries: readonly unknown[]`          — unvalidated input
 *          - `pipeline: LogMiddleware`                 — composed middleware
 *          - `sinks: Record<string, LogSink>`          — named async sinks
 *   R19. Parse every raw entry with `parseLogEntry`; track `totalInvalid`.
 *   R20. Pass each valid entry through `pipeline`; track `totalDropped` when null.
 *   R21. For each surviving entry, invoke ALL sinks concurrently via
 *        `Promise.allSettled` — do NOT await them sequentially.
 *   R22. After all entries are processed, compute a `SinkOutcome` per sink:
 *          - All calls fulfilled  → "flushed"  (count = number of entries sent)
 *          - Some fulfilled       → "partial"  (count = fulfilled, failures = rejected)
 *          - All rejected / zero  → "failed"   (reason = first rejection message)
 *   R23. Return a fully-typed `DrainReport`.
 *   R24. Must NOT use `any` or type assertions.
 */
export async function drainPipeline(
  rawEntries: readonly unknown[],
  pipeline:   LogMiddleware,
  sinks:      Record<string, LogSink>,
): Promise<DrainReport> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. CONDITIONAL TYPE UTILITY — SeverityEntries<S>
// ------------------------------------------------------------------

/**
 * TODO: Define `SeverityEntries<S>`.
 *
 * Requirements:
 *   R25. Given a SeverityLevel `S`, produce the specific LogEntry variant
 *        for that severity (i.e. the branch where `severity === S`).
 *   R26. Use `Extract` (or a conditional type with `infer`) — do NOT write
 *        out each variant manually.
 *
 * Example: SeverityEntries<"error"> should equal:
 *   { severity: "error"; payload: ErrorPayload; service: ServiceName; timestamp: Timestamp }
 */
export type SeverityEntries<S extends SeverityLevel> = Extract<LogEntry, { severity: S }>;

/**
 * TODO: Implement `groupBySeverity`.
 *
 * Requirements:
 *   R27. Accept `entries: readonly LogEntry[]`.
 *   R28. Return a `Partial<{ [S in SeverityLevel]: SeverityEntries<S>[] }>` —
 *        only include keys for severity levels that have at least one entry.
 *   R29. Each array must be typed to its specific variant (use type narrowing,
 *        NOT casts).
 */
export function groupBySeverity(
  entries: readonly LogEntry[],
): Partial<{ [S in SeverityLevel]: SeverityEntries<S>[] }> {
  // TODO
  throw new Error("Not implemented");
}
