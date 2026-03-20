// ============================================================
// Typed Workflow State Machine Executor
// challenge.ts — fill in every TODO. No `any`, no `as`.
// ============================================================

// ---------------------------------------------------------------------------
// 1. RESULT MONAD
// ---------------------------------------------------------------------------

/** Requirement 1: Define a discriminated-union Result type with Ok<T> and Err<E> variants. */
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

// ---------------------------------------------------------------------------
// 2. WORKFLOW STATES & PAYLOADS  (discriminated by `kind`)
// ---------------------------------------------------------------------------

/**
 * Requirement 2: Define a `StateKind` union of at least five literal string types:
 *   'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'
 */
export type StateKind = 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';

/** Each state carries its own payload shape — keyed by StateKind. */
export type StatePayloadMap = {
  idle:      { readonly createdAt: number };
  queued:    { readonly queuedAt: number; readonly priority: number };
  running:   { readonly startedAt: number; readonly runnerId: string };
  succeeded: { readonly finishedAt: number; readonly durationMs: number };
  failed:    { readonly finishedAt: number; readonly reason: string };
  cancelled: { readonly cancelledAt: number; readonly requestedBy: string };
};

/**
 * Requirement 3: Use a mapped type + discriminant to build a `WorkflowState<K>` generic
 * where `K extends StateKind`. The resulting type must have `kind: K` plus all fields
 * from `StatePayloadMap[K]`.
 */
export type WorkflowState<K extends StateKind> = { readonly kind: K } & StatePayloadMap[K];

/** A union of all concrete workflow states. */
export type AnyWorkflowState = { [K in StateKind]: WorkflowState<K> }[StateKind];

// ---------------------------------------------------------------------------
// 3. TRANSITIONS
// ---------------------------------------------------------------------------

/**
 * Requirement 4: Define `AllowedTransitions` as a mapped type over StateKind whose values
 * are `ReadonlyArray<StateKind>`. Encode the following legal edges:
 *   idle      → queued
 *   queued    → running | cancelled
 *   running   → succeeded | failed | cancelled
 *   succeeded → (none)
 *   failed    → queued          (retry)
 *   cancelled → (none)
 */
export type AllowedTransitions = {
  // TODO: fill in each key with its permitted next states
  [K in StateKind]: ReadonlyArray<StateKind>;
};

export const ALLOWED_TRANSITIONS: AllowedTransitions = {
  // TODO: implement, matching the edges described above
  idle:      [],
  queued:    [],
  running:   [],
  succeeded: [],
  failed:    [],
  cancelled: [],
};

// ---------------------------------------------------------------------------
// 4. TRANSITION ERRORS
// ---------------------------------------------------------------------------

/**
 * Requirement 5: Define a discriminated-union `TransitionError` with at least three variants:
 *   - InvalidTransition  { from: StateKind; to: StateKind }
 *   - PayloadValidationError { field: string; message: string }
 *   - GuardRejected      { guardName: string; reason: string }
 */
export type TransitionError =
  // TODO: define the three variants with a `kind` discriminant
  | never; // replace this

// ---------------------------------------------------------------------------
// 5. GUARD FUNCTION TYPE
// ---------------------------------------------------------------------------

/**
 * Requirement 6: A `Guard<From extends StateKind, To extends StateKind>` is a function
 * that receives the current state and the raw (unknown) next-state payload, and returns
 * `Result<true, TransitionError>`.
 * Use conditional types so that `Guard<F, T>` only compiles when T is in
 * AllowedTransitions[F] — encode this constraint with a generic bound.
 */
export type Guard<
  From extends StateKind,
  To extends AllowedTransitions[From][number]
> = (
  current: WorkflowState<From>,
  rawPayload: unknown
) => Result<true, TransitionError>;

// ---------------------------------------------------------------------------
// 6. PAYLOAD VALIDATOR
// ---------------------------------------------------------------------------

/**
 * Requirement 7: Implement `validatePayload<K extends StateKind>`.
 * Given a `kind: K` and `raw: unknown`, validate that `raw` is a non-null object
 * containing all required fields for `StatePayloadMap[K]` with correct primitive types.
 * Return `Result<StatePayloadMap[K], TransitionError>`.
 *
 * You must handle all six state kinds without `any` or type assertions.
 * Hint: use a `switch` on `kind` and narrow inside each branch.
 */
export function validatePayload<K extends StateKind>(
  kind: K,
  raw: unknown
): Result<StatePayloadMap[K], TransitionError> {
  // TODO: implement
  throw new Error('Not implemented');
}

// ---------------------------------------------------------------------------
// 7. SIDE-EFFECT EVENTS
// ---------------------------------------------------------------------------

/**
 * Requirement 8: Define `WorkflowEvent` as a discriminated union of side-effect events
 * emitted after a successful transition. Each variant must carry `workflowId: string`
 * and a `kind` discriminant, plus transition-specific fields:
 *   - WorkflowQueued    { kind: 'WorkflowQueued';    priority: number }
 *   - WorkflowStarted   { kind: 'WorkflowStarted';   runnerId: string }
 *   - WorkflowSucceeded { kind: 'WorkflowSucceeded'; durationMs: number }
 *   - WorkflowFailed    { kind: 'WorkflowFailed';    reason: string }
 *   - WorkflowCancelled { kind: 'WorkflowCancelled'; requestedBy: string }
 */
export type WorkflowEvent =
  // TODO: define the five variants
  | never; // replace this

// ---------------------------------------------------------------------------
// 8. EVENT EMITTER TYPE
// ---------------------------------------------------------------------------

/** A typed event emitter that receives a `WorkflowEvent` after each transition. */
export type EventEmitter = (event: WorkflowEvent) => void;

// ---------------------------------------------------------------------------
// 9. CORE ENGINE
// ---------------------------------------------------------------------------

/**
 * Requirement 9: Implement the `StateMachine` class.
 *
 * Constructor: `constructor(workflowId: string, initial: WorkflowState<'idle'>, emit: EventEmitter)`
 *
 * Public API:
 *   - `get state(): AnyWorkflowState`  — returns the current state (read-only)
 *
 *   - `transition<To extends AllowedTransitions[StateKind][number]>(
 *         to: To,
 *         rawPayload: unknown,
 *         ...guards: ReadonlyArray<Guard<StateKind, To>>   // ← variadic guards
 *     ): Result<WorkflowState<To>, TransitionError>`
 *
 *     Steps (in order):
 *       a. Check that `to` is in `ALLOWED_TRANSITIONS[current.kind]`.
 *          If not → return Err with InvalidTransition.
 *       b. Run each guard in sequence; return the first Err encountered.
 *       c. Call `validatePayload(to, rawPayload)`.
 *       d. On success: update internal state, derive & emit the correct WorkflowEvent,
 *          return Ok(newState).
 *
 *   - `history(): ReadonlyArray<AnyWorkflowState>` — full ordered state history
 */
export class StateMachine {
  // TODO: implement
}

// ---------------------------------------------------------------------------
// 10. AGGREGATE REPORTER
// ---------------------------------------------------------------------------

/**
 * Requirement 10: Implement `aggregateRuns`.
 *
 * Given `ReadonlyArray<ReadonlyArray<AnyWorkflowState>>` (each inner array is the
 * history of one workflow run), return a `RunReport`:
 *
 * export type RunReport = {
 *   total: number;
 *   byFinalState: Record<StateKind, number>;
 *   avgDurationMs: number | null;   // average of succeeded runs; null if none
 *   failureReasons: ReadonlyArray<string>;  // all unique failure reasons, sorted
 * };
 *
 * Compute everything in a SINGLE PASS over the outer array (one reduce).
 * No `any`, no non-null assertions.
 */
export type RunReport = {
  readonly total: number;
  readonly byFinalState: Record<StateKind, number>;
  readonly avgDurationMs: number | null;
  readonly failureReasons: ReadonlyArray<string>;
};

export function aggregateRuns(
  runs: ReadonlyArray<ReadonlyArray<AnyWorkflowState>>
): RunReport {
  // TODO: implement — single reduce pass
  throw new Error('Not implemented');
}
