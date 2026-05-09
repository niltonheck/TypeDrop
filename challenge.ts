// ============================================================
// Typed Streaming ETL Pipeline — challenge.ts
// Difficulty: Hard
// Topics: discriminated unions, conditional types, mapped types,
//         generics + infer, middleware chains, concurrency limits,
//         Result<T,E> error handling, branded types
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque brand helper — do NOT use `as` or `any` to construct these. */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type EventId   = Brand<string, "EventId">;
export type TopicName = Brand<string, "TopicName">;
export type SourceId  = Brand<string, "SourceId">;

/**
 * TODO 1 — Implement `makeEventId`, `makeTopicName`, and `makeSourceId`.
 * Each function must accept a plain `string` and return the correct branded type.
 * Hint: You may use a type-safe casting approach via a generic `brand<B>()` helper
 * that narrows through a runtime check (non-empty string), returning
 * `Result<BrandedType, PipelineError>` instead of throwing.
 */
export function makeEventId(raw: string): Result<EventId, PipelineError> {
  // TODO
  throw new Error("not implemented");
}

export function makeTopicName(raw: string): Result<TopicName, PipelineError> {
  // TODO
  throw new Error("not implemented");
}

export function makeSourceId(raw: string): Result<SourceId, PipelineError> {
  // TODO
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 2. RESULT TYPE
// ------------------------------------------------------------------

export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// ------------------------------------------------------------------
// 3. PIPELINE ERRORS — discriminated union
// ------------------------------------------------------------------

export type PipelineError =
  | { readonly kind: "ValidationError"; readonly field: string; readonly message: string }
  | { readonly kind: "TransformError";  readonly stage: string; readonly message: string }
  | { readonly kind: "SinkError";       readonly topic: TopicName; readonly message: string }
  | { readonly kind: "BrandError";      readonly input: string;  readonly message: string };

// ------------------------------------------------------------------
// 4. RAW EVENT (unvalidated, from upstream)
// ------------------------------------------------------------------

export interface RawEvent {
  readonly id:        unknown;
  readonly source:    unknown;
  readonly topic:     unknown;
  readonly payload:   unknown;
  readonly timestamp: unknown;
}

// ------------------------------------------------------------------
// 5. VALIDATED EVENT (post-validation)
// ------------------------------------------------------------------

export interface ValidatedEvent {
  readonly id:        EventId;
  readonly source:    SourceId;
  readonly topic:     TopicName;
  readonly payload:   Record<string, unknown>;
  readonly timestamp: number;
}

// ------------------------------------------------------------------
// 6. TRANSFORMED EVENT
// Generically parameterised so middleware can enrich the payload type.
// ------------------------------------------------------------------

export interface TransformedEvent<P extends Record<string, unknown>> {
  readonly id:        EventId;
  readonly source:    SourceId;
  readonly topic:     TopicName;
  readonly payload:   P;
  readonly timestamp: number;
  readonly processedAt: number; // ms since epoch, added by pipeline
}

// ------------------------------------------------------------------
// 7. MIDDLEWARE
// A middleware receives a ValidatedEvent and either enriches it or
// returns a PipelineError. Middlewares are chained left-to-right;
// the OUTPUT payload type of stage N becomes the INPUT of stage N+1.
//
// Use conditional types + `infer` to extract the output payload type
// of a middleware.
// ------------------------------------------------------------------

export type Middleware<
  TIn  extends Record<string, unknown>,
  TOut extends Record<string, unknown>
> = (event: TransformedEvent<TIn>) => Promise<Result<TransformedEvent<TOut>, PipelineError>>;

/**
 * TODO 2 — Define `MiddlewareChain<MS>`.
 * `MS` is a tuple of `Middleware<In, Out>` values.
 * The chain must be TYPE-SAFE end-to-end: the output payload type of
 * middleware[N] must equal the input payload type of middleware[N+1].
 * Hint: Use a recursive conditional type (or mapped tuple type) to
 * validate the chain at compile time, yielding the final output type.
 *
 * Example (compile-time check only — no runtime work here):
 *   type M1 = Middleware<{ a: string }, { a: string; b: number }>;
 *   type M2 = Middleware<{ a: string; b: number }, { a: string; b: number; c: boolean }>;
 *   type Chain = MiddlewareChain<[M1, M2]>; // valid ✓
 *
 *   type M3 = Middleware<{ x: number }, { x: number }>;
 *   type Bad  = MiddlewareChain<[M1, M3]>; // should resolve to `never` ✗
 */
export type MiddlewareChain<MS extends readonly Middleware<Record<string, unknown>, Record<string, unknown>>[]> =
  /* TODO — replace `unknown` with your recursive conditional type */
  unknown;

// ------------------------------------------------------------------
// 8. SINK
// A sink consumes a fully-transformed event for a specific topic.
// ------------------------------------------------------------------

export type Sink<P extends Record<string, unknown>> = (
  event: TransformedEvent<P>
) => Promise<Result<void, PipelineError>>;

/** Registry mapping each TopicName to its typed Sink. */
export type SinkRegistry<Topics extends TopicName> = {
  readonly [K in Topics]: Sink<Record<string, unknown>>;
};

// ------------------------------------------------------------------
// 9. PIPELINE CONFIG
// ------------------------------------------------------------------

export interface PipelineConfig<Topics extends TopicName> {
  /** Maximum number of sink invocations running simultaneously. */
  readonly concurrencyLimit: number;
  /** Middleware stages applied to every event after validation. */
  readonly middlewares: ReadonlyArray<
    Middleware<Record<string, unknown>, Record<string, unknown>>
  >;
  /** Per-topic sinks. */
  readonly sinks: SinkRegistry<Topics>;
}

// ------------------------------------------------------------------
// 10. PIPELINE REPORT
// ------------------------------------------------------------------

export type EventOutcome =
  | { readonly status: "success"; readonly eventId: EventId; readonly topic: TopicName }
  | { readonly status: "failed";  readonly eventId: string;  readonly error: PipelineError };

export interface PipelineReport {
  readonly totalReceived:   number;
  readonly totalSucceeded:  number;
  readonly totalFailed:     number;
  /** Outcomes grouped by topic (succeeded events only). */
  readonly byTopic:         Record<string, number>;
  readonly outcomes:        ReadonlyArray<EventOutcome>;
}

// ------------------------------------------------------------------
// 11. VALIDATION — TODO 3
// ------------------------------------------------------------------

/**
 * TODO 3 — Implement `validateEvent(raw: unknown): Result<ValidatedEvent, PipelineError>`.
 *
 * Requirements (all must be checked at runtime):
 *   a) `raw` must be a non-null object.
 *   b) `raw.id` must be a non-empty string → wrap as EventId via makeEventId.
 *   c) `raw.source` must be a non-empty string → wrap as SourceId via makeSourceId.
 *   d) `raw.topic` must be a non-empty string → wrap as TopicName via makeTopicName.
 *   e) `raw.payload` must be a non-null object (Record<string, unknown>).
 *   f) `raw.timestamp` must be a finite number.
 *   On any failure return `err({ kind: "ValidationError", field: "...", message: "..." })`.
 */
export function validateEvent(raw: unknown): Result<ValidatedEvent, PipelineError> {
  // TODO
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 12. TRANSFORM CHAIN RUNNER — TODO 4
// ------------------------------------------------------------------

/**
 * TODO 4 — Implement `runMiddlewares`.
 * Given a `ValidatedEvent` and an ordered list of middlewares, wrap the
 * event in a `TransformedEvent<Record<string,unknown>>` (setting
 * `processedAt` to `Date.now()`), then pipe it through each middleware
 * sequentially, short-circuiting on the first error.
 * Return the final `TransformedEvent` or the first `PipelineError`.
 */
export function runMiddlewares(
  event: ValidatedEvent,
  middlewares: ReadonlyArray<Middleware<Record<string, unknown>, Record<string, unknown>>>
): Promise<Result<TransformedEvent<Record<string, unknown>>, PipelineError>> {
  // TODO
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 13. CONCURRENCY-LIMITED FAN-OUT — TODO 5
// ------------------------------------------------------------------

/**
 * TODO 5 — Implement `fanOutToSinks`.
 * Given a list of transformed events and a `PipelineConfig`, invoke
 * each event's matching sink (by `event.topic`) with a concurrency limit.
 *
 * Rules:
 *   - At most `config.concurrencyLimit` sink calls may be in-flight at once.
 *   - If no sink is registered for a topic, record a SinkError outcome.
 *   - Collect all outcomes (success + failure) without throwing.
 *   - Return an array of `EventOutcome`.
 */
export function fanOutToSinks<Topics extends TopicName>(
  events: ReadonlyArray<TransformedEvent<Record<string, unknown>>>,
  config: PipelineConfig<Topics>
): Promise<ReadonlyArray<EventOutcome>> {
  // TODO
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 14. MAIN PIPELINE ENTRY POINT — TODO 6
// ------------------------------------------------------------------

/**
 * TODO 6 — Implement `runPipeline`.
 *
 * Steps (in order):
 *   1. Validate every element of `rawBatch` via `validateEvent`.
 *      Immediately record a failed outcome for any invalid event.
 *   2. Run all valid events through the middleware chain via `runMiddlewares`.
 *      Record a failed outcome for any transform error.
 *   3. Fan-out successfully transformed events to sinks via `fanOutToSinks`
 *      (respecting the concurrency limit).
 *   4. Assemble and return a `PipelineReport`.
 */
export async function runPipeline<Topics extends TopicName>(
  rawBatch: ReadonlyArray<unknown>,
  config: PipelineConfig<Topics>
): Promise<PipelineReport> {
  // TODO
  throw new Error("not implemented");
}
