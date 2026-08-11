// ============================================================
// Typed Async Task Scheduler with Concurrency Limits & Retry
// ============================================================
// TOPICS: Generics, discriminated unions, conditional types,
//         mapped types, Promise.allSettled, concurrency, retry
// ============================================================

// ── 1. Branded task ID ──────────────────────────────────────

/** Opaque identifier for a scheduled task. */
type TaskId = string & { readonly __brand: "TaskId" };

/** Create a branded TaskId from a plain string. */
export function makeTaskId(raw: string): TaskId {
  // TODO: return raw cast to TaskId (hint: use `as` only here — this is the
  //       one permitted escape hatch for opaque branded types)
  throw new Error("not implemented");
}

// ── 2. Retry policy ─────────────────────────────────────────

export type RetryPolicy =
  | { kind: "none" }
  | { kind: "fixed";       attempts: number; delayMs: number }
  | { kind: "exponential"; attempts: number; baseDelayMs: number; maxDelayMs: number };

// ── 3. Error classification ──────────────────────────────────

/** Domain errors the scheduler understands. */
export type TaskErrorKind =
  | "transient"   // network blip — safe to retry
  | "permanent"   // bad input — do NOT retry
  | "timeout"     // execution took too long — safe to retry
  | "unknown";    // classification failed

export interface TaskError {
  readonly kind: TaskErrorKind;
  readonly message: string;
  readonly cause?: unknown;
}

// ── 4. Task definition ───────────────────────────────────────

/**
 * A single unit of work.
 * @template I  Input type consumed by the executor.
 * @template O  Output type produced on success.
 */
export interface Task<I, O> {
  readonly id: TaskId;
  readonly input: I;
  readonly priority: "high" | "medium" | "low";
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
  /**
   * The async function that does the real work.
   * Must resolve with O on success, or throw a TaskError on failure.
   */
  readonly execute: (input: I, signal: AbortSignal) => Promise<O>;
  /**
   * Classify a raw thrown value into a TaskError.
   * Called whenever `execute` throws.
   */
  readonly classify: (thrown: unknown) => TaskError;
}

// ── 5. Settlement records ────────────────────────────────────

export type TaskSettlement<O> =
  | {
      status: "fulfilled";
      taskId: TaskId;
      output: O;
      attempts: number;
    }
  | {
      status: "rejected";
      taskId: TaskId;
      error: TaskError;
      attempts: number;
    };

// ── 6. Scheduler options ─────────────────────────────────────

export interface SchedulerOptions {
  /** Maximum number of tasks executing simultaneously. */
  concurrency: number;
}

// ── 7. Typed scheduler result ────────────────────────────────

/**
 * Maps a tuple/array of Task types to their corresponding settlement types.
 *
 * REQUIREMENT 7a — implement this conditional/mapped type:
 *   TaskSettlements<[Task<A,X>, Task<B,Y>]>
 *     => [TaskSettlement<X>, TaskSettlement<Y>]
 *
 * Hint: Use a mapped type over indices with `infer` to extract O from Task<I,O>.
 */
export type TaskSettlements<T extends readonly Task<unknown, unknown>[]> = {
  // TODO: replace `never` with the correct mapped/conditional expression
  [K in keyof T]: never;
};

// ── 8. Core scheduler function ───────────────────────────────

/**
 * Run all tasks respecting:
 *   • concurrency cap (SchedulerOptions.concurrency)
 *   • task priority order (high → medium → low)
 *   • per-task timeout (AbortController + race)
 *   • retry policy (none / fixed / exponential back-off)
 *
 * REQUIREMENTS
 * ------------
 * R1  Sort tasks by priority before execution begins:
 *       high = 0, medium = 1, low = 2
 *
 * R2  Never exceed `options.concurrency` simultaneous executions.
 *     Use a semaphore / slot-based approach (no external libraries).
 *
 * R3  For each task attempt, race `task.execute(input, signal)` against
 *     a timeout Promise that rejects with a TaskError of kind "timeout"
 *     after `task.timeoutMs` milliseconds.
 *     Use AbortController to signal cancellation to the executor.
 *
 * R4  On failure, consult `task.retryPolicy`:
 *       "none"        → settle immediately as rejected
 *       "fixed"       → retry up to `attempts` times, waiting `delayMs` ms between each
 *       "exponential" → retry up to `attempts` times, waiting
 *                       min(baseDelayMs * 2^(attempt-1), maxDelayMs) ms between each
 *     Never retry if the classified error kind is "permanent".
 *
 * R5  Return type must be `Promise<TaskSettlements<T>>` — the mapped tuple type
 *     you defined in step 7. Each element corresponds positionally to the
 *     input task (original order, NOT priority order).
 *
 * R6  No `any` anywhere in your implementation. Use generic helpers if needed.
 */
export async function runScheduler<const T extends readonly Task<unknown, unknown>[]>(
  tasks: T,
  options: SchedulerOptions
): Promise<TaskSettlements<T>> {
  // TODO: implement
  //
  // Suggested internal helpers (you may add more):
  //
  //   function delay(ms: number): Promise<void>
  //     — resolves after ms milliseconds
  //
  //   function withTimeout<O>(task: Task<unknown, O>, signal: AbortSignal): Promise<O>
  //     — races execute against a timeout rejection
  //
  //   async function runWithRetry<O>(task: Task<unknown, O>): Promise<TaskSettlement<O>>
  //     — handles the full attempt → classify → retry loop
  //
  //   async function runAll(): Promise<TaskSettlement<unknown>[]>
  //     — drains a priority-sorted queue using a slot semaphore
  //
  throw new Error("not implemented");
}

// ── 9. Exhaustive settlement handler (helper) ────────────────

/**
 * REQUIREMENT 9 — implement this generic helper.
 *
 * Given a TaskSettlement<O> and two handler callbacks, call the appropriate
 * handler and return its result. The return type must unify both handler
 * return types via a conditional/generic approach — no `any`.
 *
 * Example usage:
 *   const label = handleSettlement(settlement, {
 *     onFulfilled: (s) => `✓ ${s.output}`,
 *     onRejected:  (s) => `✗ ${s.error.message}`,
 *   });
 */
export function handleSettlement<O, R>(
  settlement: TaskSettlement<O>,
  handlers: {
    onFulfilled: (s: Extract<TaskSettlement<O>, { status: "fulfilled" }>) => R;
    onRejected:  (s: Extract<TaskSettlement<O>, { status: "rejected"  }>) => R;
  }
): R {
  // TODO: implement — use the discriminated union to narrow, then call the handler
  throw new Error("not implemented");
}
