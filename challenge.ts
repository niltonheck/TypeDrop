// ============================================================
// Typed Concurrent Task Scheduler with Priority & Retry
// ============================================================
// Your job: implement the scheduler described below.
// Rules:
//   - strict: true, no `any`, no type assertions (`as`)
//   - All generics must flow through — callers see typed results
//   - Do NOT change the exported type signatures
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque identifier for a registered task. */
export type TaskId = string & { readonly __brand: "TaskId" };

/** Create a TaskId from a plain string. */
export function makeTaskId(raw: string): TaskId {
  // TODO: implement
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 2. PRIORITY
// ------------------------------------------------------------------

/** Higher number = higher priority. Range: 1–10. */
export type Priority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

// ------------------------------------------------------------------
// 3. RETRY POLICY
// ------------------------------------------------------------------

export type RetryPolicy =
  | { kind: "none" }
  | { kind: "fixed"; maxAttempts: number; delayMs: number }
  | { kind: "exponential"; maxAttempts: number; baseDelayMs: number; maxDelayMs: number };

// ------------------------------------------------------------------
// 4. TASK DEFINITION
// ------------------------------------------------------------------

/**
 * A Task<T> wraps an async work function that resolves to T.
 * `work` receives the current attempt number (1-based).
 */
export interface Task<T> {
  readonly id: TaskId;
  readonly priority: Priority;
  readonly retry: RetryPolicy;
  readonly work: (attempt: number) => Promise<T>;
}

// ------------------------------------------------------------------
// 5. TASK RESULT — discriminated union
// ------------------------------------------------------------------

export type TaskResult<T> =
  | {
      status: "fulfilled";
      id: TaskId;
      value: T;
      attempts: number;
    }
  | {
      status: "rejected";
      id: TaskId;
      reason: unknown;
      attempts: number;
    };

// ------------------------------------------------------------------
// 6. SCHEDULER CONFIGURATION
// ------------------------------------------------------------------

export interface SchedulerConfig {
  /** Maximum number of tasks running simultaneously. */
  concurrency: number;
  /**
   * Optional wall-clock timeout (ms) for the *entire* scheduler run.
   * If provided, tasks still in-flight when the timeout fires should
   * be settled as rejected with a TimeoutError.
   */
  globalTimeoutMs?: number;
}

// ------------------------------------------------------------------
// 7. ERRORS
// ------------------------------------------------------------------

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export class RetryExhaustedError extends Error {
  readonly attempts: number;
  readonly lastError: unknown;
  constructor(attempts: number, lastError: unknown) {
    super(`Exhausted ${attempts} attempt(s)`);
    this.name = "RetryExhaustedError";
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

// ------------------------------------------------------------------
// 8. SCHEDULER — the main type you must implement
// ------------------------------------------------------------------

/**
 * A heterogeneous bag of tasks (each may return a different type T).
 * We need a wrapper that erases the inner type for storage but
 * preserves it for the result.
 */
// Internal opaque task wrapper — do not export
type AnyTask = Task<unknown>;
type AnyResult = TaskResult<unknown>;

export interface Scheduler {
  /**
   * Register a task with the scheduler.
   * Returns the same TaskId for chaining convenience.
   *
   * Requirement R1: Tasks must be stored ordered by priority (desc).
   *   Ties broken by insertion order (FIFO).
   */
  register<T>(task: Task<T>): TaskId;

  /**
   * Run all registered tasks respecting concurrency limits and retry
   * policies. Returns a Promise that resolves once every task has
   * settled (fulfilled or rejected after exhausting retries).
   *
   * Requirement R2: At most `config.concurrency` tasks run at once.
   * Requirement R3: Retry logic per RetryPolicy:
   *   - "none"        → no retries; one attempt only.
   *   - "fixed"       → retry up to maxAttempts total, waiting
   *                     delayMs between each.
   *   - "exponential" → retry up to maxAttempts total, waiting
   *                     min(baseDelayMs * 2^(attempt-1), maxDelayMs).
   * Requirement R4: If globalTimeoutMs is set and expires, all
   *   pending/in-flight tasks settle as rejected(TimeoutError).
   * Requirement R5: Results are returned in task completion order
   *   (not insertion order).
   */
  run(): Promise<AnyResult[]>;
}

// ------------------------------------------------------------------
// 9. FACTORY FUNCTION — implement this
// ------------------------------------------------------------------

/**
 * Create a new Scheduler with the given configuration.
 *
 * @example
 * const scheduler = createScheduler({ concurrency: 3 });
 * scheduler.register({ id: makeTaskId("t1"), priority: 8, retry: { kind: "none" }, work: async () => 42 });
 * const results = await scheduler.run();
 */
export function createScheduler(config: SchedulerConfig): Scheduler {
  // TODO: implement
  // Hints:
  //   - Keep an internal queue sorted by priority desc, then insertion order.
  //   - Use a "slots" counter to track how many tasks are currently running.
  //   - Implement a `runWithRetry` helper that handles all three RetryPolicy kinds.
  //   - For globalTimeoutMs, race a setTimeout-based Promise against the work loop.
  //   - Never use `any`; use `unknown` where the inner type is erased.
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 10. TYPED RESULT EXTRACTOR — implement this utility
// ------------------------------------------------------------------

/**
 * Given the raw AnyResult[] from scheduler.run(), extract only the
 * fulfilled values whose `value` satisfies a user-supplied type guard.
 *
 * Requirement R6: The return type must be T[] (not unknown[]).
 *
 * @example
 * const numbers = extractFulfilled(results, (v): v is number => typeof v === "number");
 */
export function extractFulfilled<T>(
  results: AnyResult[],
  guard: (value: unknown) => value is T
): T[] {
  // TODO: implement
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 11. TYPED TASK BUILDER — implement this generic builder
// ------------------------------------------------------------------

/**
 * Fluent builder for Task<T>.
 *
 * Requirement R7: `build()` must be a compile-time error unless
 *   BOTH `priority` AND `work` have been set (use a phantom-type
 *   or overload trick so the method only exists on the right state).
 *
 * Hint: Use a generic state parameter (e.g. `HasPriority`, `HasWork`)
 *   and conditional method availability via intersection/mapped types.
 */
export type BuilderState = {
  hasPriority: boolean;
  hasWork: boolean;
};

// Conditional type: build() only available when both flags are true
export type TaskBuilderMethods<T, S extends BuilderState> = {
  withId(id: TaskId): TaskBuilder<T, S>;
  withPriority(p: Priority): TaskBuilder<T, S & { hasPriority: true }>;
  withRetry(policy: RetryPolicy): TaskBuilder<T, S>;
  withWork(fn: (attempt: number) => Promise<T>): TaskBuilder<T, S & { hasWork: true }>;
} & (S extends { hasPriority: true; hasWork: true }
  ? { build(): Task<T> }
  : // eslint-disable-next-line @typescript-eslint/ban-types
    {});

export type TaskBuilder<T, S extends BuilderState> = TaskBuilderMethods<T, S>;

/**
 * Create a fresh TaskBuilder<T> with no state set yet.
 * Default id: makeTaskId("task-" + Date.now())
 * Default retry: { kind: "none" }
 */
export function taskBuilder<T>(): TaskBuilder<T, { hasPriority: false; hasWork: false }> {
  // TODO: implement
  // The returned object must satisfy TaskBuilder at each state transition.
  // Remember: no `any`, no `as`.
  throw new Error("not implemented");
}
