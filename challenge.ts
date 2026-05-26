// ============================================================
// challenge.ts — Typed Event Aggregator with Discriminated Union Streams
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every TODO. Do NOT change existing type signatures.
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------------

/** Every raw event coming off the wire must have at least these fields. */
export interface RawEvent {
  id: string;
  category: string;
  ts: number; // Unix ms timestamp
  payload: unknown;
}

// --- Typed payloads per category ---

export interface ErrorPayload {
  message: string;
  code: number;
  fatal: boolean;
}

export interface MetricPayload {
  name: string;
  value: number;
  unit: string;
}

export interface AuditPayload {
  actor: string;
  action: string;
  resource: string;
}

// ------------------------------------------------------------------
// 2. DISCRIMINATED UNION — typed events
// ------------------------------------------------------------------

// TODO: Define `TypedEvent` as a discriminated union of three members:
//   • { category: "error";  id: string; ts: number; payload: ErrorPayload  }
//   • { category: "metric"; id: string; ts: number; payload: MetricPayload }
//   • { category: "audit";  id: string; ts: number; payload: AuditPayload  }
export type TypedEvent = // TODO

// ------------------------------------------------------------------
// 3. CATEGORY EXTRACTION — mapped + conditional types
// ------------------------------------------------------------------

// TODO: Define `EventCategory` as a union of every `category` string
//       that appears in `TypedEvent` (derive it from the union, don't hardcode).
export type EventCategory = // TODO

// TODO: Define `EventByCategory<C extends EventCategory>` — given a category
//       string literal, resolve to the specific TypedEvent member whose
//       `category` field equals C.
//       Hint: use a conditional type or Extract<>.
export type EventByCategory<C extends EventCategory> = // TODO

// ------------------------------------------------------------------
// 4. SUMMARY TYPES — one per category
// ------------------------------------------------------------------

export interface ErrorSummary {
  category: "error";
  totalCount: number;
  fatalCount: number;
  topCode: number;         // most frequently occurring error code
}

export interface MetricSummary {
  category: "metric";
  totalCount: number;
  byName: Record<string, { count: number; avg: number; unit: string }>;
}

export interface AuditSummary {
  category: "audit";
  totalCount: number;
  uniqueActors: number;
  actionBreakdown: Record<string, number>; // action → count
}

// TODO: Define `SummaryByCategory<C extends EventCategory>` — maps each
//       category to its corresponding Summary type.
//       Hint: use a conditional type.
export type SummaryByCategory<C extends EventCategory> = // TODO

// ------------------------------------------------------------------
// 5. RESULT TYPES
// ------------------------------------------------------------------

export type ValidationError = {
  kind: "ValidationError";
  id: string;
  reason: string;
};

// A Result type — either a valid TypedEvent or a ValidationError
// TODO: Define `ParseResult` as a discriminated union:
//       • { ok: true;  value: TypedEvent }
//       • { ok: false; error: ValidationError }
export type ParseResult = // TODO

// ------------------------------------------------------------------
// 6. CORE FUNCTIONS — implement all five
// ------------------------------------------------------------------

/**
 * REQUIREMENT 1 — Runtime validation
 *
 * Validate a single `unknown` value as a `RawEvent`.
 * A valid RawEvent must have:
 *   - `id`       : non-empty string
 *   - `category` : one of "error" | "metric" | "audit"
 *   - `ts`       : finite number
 *   - `payload`  : an object (not null, not array)
 *
 * Returns the narrowed `RawEvent` or throws a `ValidationError`-shaped
 * object (you may throw a plain object literal matching `ValidationError`).
 */
export function validateRawEvent(raw: unknown): RawEvent {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 2 — Payload narrowing
 *
 * Given a validated `RawEvent`, attempt to parse its payload into the
 * correct typed form and return a `ParseResult`.
 *
 * Payload rules:
 *   "error"  → payload must have { message: string, code: number, fatal: boolean }
 *   "metric" → payload must have { name: string, value: number, unit: string }
 *   "audit"  → payload must have { actor: string, action: string, resource: string }
 *
 * On success → { ok: true, value: TypedEvent }
 * On failure → { ok: false, error: { kind: "ValidationError", id, reason } }
 */
export function parseEvent(raw: RawEvent): ParseResult {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 3 — Batch ingestion
 *
 * Given an array of `unknown` values, run each through `validateRawEvent`
 * then `parseEvent`. Collect ALL results (don't short-circuit on failure).
 * Returns an array of `ParseResult`.
 */
export function ingestEvents(raws: unknown[]): ParseResult[] {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 4 — Category stream extraction
 *
 * Given a list of `ParseResult[]`, extract only the successfully parsed
 * events that match the given category `C`, returning them as
 * `EventByCategory<C>[]`.
 *
 * This function must be generic — the return type must be inferred from `C`.
 */
export function extractCategory<C extends EventCategory>(
  results: ParseResult[],
  category: C
): EventByCategory<C>[] {
  // TODO
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5 — Per-category summary
 *
 * Given a list of `ParseResult[]` and a category `C`, compute and return
 * a `SummaryByCategory<C>`.
 *
 * Summary rules per category:
 *
 * "error":
 *   - totalCount  : number of error events
 *   - fatalCount  : number where payload.fatal === true
 *   - topCode     : the error code that appears most often
 *                   (if tie or empty, use 0)
 *
 * "metric":
 *   - totalCount  : number of metric events
 *   - byName      : for each unique metric name → { count, avg, unit }
 *                   avg = arithmetic mean of all `value`s for that name
 *
 * "audit":
 *   - totalCount  : number of audit events
 *   - uniqueActors: count of distinct `actor` strings
 *   - actionBreakdown: map of action → how many times it appears
 *
 * This function must be generic — the return type must narrow to the
 * correct Summary type based on `C`.
 */
export function summarize<C extends EventCategory>(
  results: ParseResult[],
  category: C
): SummaryByCategory<C> {
  // TODO
  throw new Error("Not implemented");
}
