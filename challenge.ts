// ============================================================
// Typed Concurrent Task Scheduler with Retry & Cancellation
// ============================================================
// RULES
//  • No `any`, no `as`, no non-null assertions (!).
//  • All code must compile under strict: true.
//  • Implement every function marked TODO.
// ============================================================

// ------------------------------------------------------------------
// 1. BRANDED TYPES
// ------------------------------------------------------------------

/** Opaque identifier for a task. */
type TaskId = string & { readonly __brand: "TaskId" };

/** Milliseconds duration (must be positive). */
type Ms = number & { readonly __brand: "Ms" };

// TODO (1): Implement the two brand-constructor helpers below.
//           They must return the branded type — no `as` allowed.
//           Hint: use a generic identity trick or function overload.

export function toTaskId(raw: string): TaskId {
  // TODO (1a): validate non-empty, then return branded value
  throw new Error("not implemented");
}

export function toMs(raw: number): Ms {
  // TODO (1b): validate > 0, then return branded value
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 2. CORE DOMAIN TYPES
// ------------------------------------------------------------------

export type RetryPolicy =
  | { readonly kind: "none" }
  | { readonly kind: "fixed"; readonly attempts: number; readonly delayMs: Ms }
  | { readonly kind: "exponential"; readonly attempts: number; readonly baseDelayMs: Ms; readonly maxDelayMs: Ms };

export type TaskPriority = "critical" | "high" | "normal" | "low";

/**
 * A task definition.
 * `work` receives an AbortSignal and returns a Promise of its output.
 */
export interface TaskDefinition<TOutput> {
  readonly id: TaskId;
  readonly priority: TaskPriority;
  readonly dependsOn: ReadonlyArray<TaskId>;
  readonly retry: RetryPolicy;
  readonly timeoutMs: Ms;
  readonly work: (signal: AbortSignal) => Promise<TOutput>;
}

// ------------------------------------------------------------------
// 3. RESULT TYPES  (discriminated union — no `any`)
// ------------------------------------------------------------------

export type TaskSuccess<TOutput> = {
  readonly status: "success";
  readonly id: TaskId;
  readonly output: TOutput;
  readonly attempts: number;
  readonly durationMs: number;
};

export type TaskFailure = {
  readonly status: "failure";
  readonly id: TaskId;
  readonly error: unknown;
  readonly attempts: number;
  readonly durationMs: number;
};

export type TaskCancelled = {
  readonly status: "cancelled";
  readonly id: TaskId;
  readonly reason: "timeout" | "dependency-failed" | "aborted";
};

export type TaskResult<TOutput> = TaskSuccess<TOutput> | TaskFailure | TaskCancelled;

// ------------------------------------------------------------------
// 4. SCHEDULER CONFIG & OUTPUT
// ------------------------------------------------------------------

export interface SchedulerConfig {
  /** Maximum number of tasks running simultaneously. */
  readonly concurrency: number;
  /**
   * If true, the scheduler cancels all pending tasks
   * as soon as any task fails (even after retries).
   */
  readonly failFast: boolean;
}

/**
 * The manifest returned after all tasks have settled.
 * `results` is a mapped type: for each key K in the registry,
 * the value is TaskResult<OutputOf<K>>.
 */
export type ScheduleManifest<TRegistry extends TaskRegistry> = {
  readonly [K in keyof TRegistry]: TaskResult<OutputTypeOf<TRegistry[K]>>;
};

// ------------------------------------------------------------------
// 5. REGISTRY HELPERS  (conditional + mapped types)
// ------------------------------------------------------------------

/**
 * A registry maps a TaskId (string literal) to a TaskDefinition<TOutput>.
 * Example:
 *   { "fetch-users": TaskDefinition<User[]>, "send-email": TaskDefinition<void> }
 */
export type TaskRegistry = Record<string, TaskDefinition<unknown>>;

/**
 * TODO (2): Implement `OutputTypeOf<T>` — a conditional type that,
 * given a `TaskDefinition<TOutput>`, extracts `TOutput`.
 * It should return `never` for non-TaskDefinition inputs.
 */
export type OutputTypeOf<T> = never; // TODO (2): replace with conditional type using `infer`

// ------------------------------------------------------------------
// 6. PRIORITY QUEUE HELPER
// ------------------------------------------------------------------

/**
 * A minimal generic max-priority queue.
 * TODO (3): Implement all three methods.
 * The comparator returns > 0 when `a` has higher priority than `b`.
 */
export class PriorityQueue<T> {
  private readonly _heap: T[] = [];
  constructor(private readonly _comparator: (a: T, b: T) => number) {}

  /** Insert an item. O(log n). */
  push(item: T): void {
    // TODO (3a)
    throw new Error("not implemented");
  }

  /** Remove and return the highest-priority item. O(log n). */
  pop(): T | undefined {
    // TODO (3b)
    throw new Error("not implemented");
  }

  get size(): number {
    return this._heap.length;
  }
}

// ------------------------------------------------------------------
// 7. RETRY DELAY HELPER
// ------------------------------------------------------------------

/**
 * TODO (4): Given a RetryPolicy and the 1-based attempt number (1 = first retry),
 * return the delay in milliseconds before the next attempt.
 * • "none"        → always 0 (should never be called, but handle gracefully)
 * • "fixed"       → always `delayMs`
 * • "exponential" → baseDelayMs * 2^(attempt-1), capped at maxDelayMs
 *
 * The return type must be `number` (not Ms — delay is computed, not branded).
 */
export function retryDelay(policy: RetryPolicy, attempt: number): number {
  // TODO (4)
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 8. TOPOLOGICAL SORT
// ------------------------------------------------------------------

/**
 * TODO (5): Given a registry, return task IDs in a valid execution order
 * (all dependencies of a task appear before it).
 * Throw a TypeError with a descriptive message if a cycle is detected.
 * Throw a TypeError if a dependency references an unknown task ID.
 *
 * Requirements:
 * • Use Kahn's algorithm (BFS-based).
 * • Return type: ReadonlyArray<TaskId>
 */
export function topologicalSort(registry: TaskRegistry): ReadonlyArray<TaskId> {
  // TODO (5)
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 9. CORE SCHEDULER
// ------------------------------------------------------------------

/**
 * TODO (6): Run all tasks in `registry` according to `config`,
 * honouring priorities, dependencies, concurrency cap, retry policies,
 * per-task timeouts, and the optional external `signal`.
 *
 * Detailed requirements:
 *
 * (6a) Dependency ordering — a task may only START once all tasks it
 *      `dependsOn` have settled.  If any dependency ended with status
 *      "failure" or "cancelled", cancel the dependent task with
 *      reason "dependency-failed".
 *
 * (6b) Priority — among tasks whose dependencies are satisfied and
 *      that are waiting for a concurrency slot, always start the one
 *      with the highest priority first:
 *        critical > high > normal > low
 *
 * (6c) Concurrency cap — at most `config.concurrency` tasks run at once.
 *
 * (6d) Per-task timeout — if `task.work` does not resolve within
 *      `task.timeoutMs`, abort it (via AbortController) and record
 *      the result as cancelled with reason "timeout".
 *      Count the timed-out attempt toward the retry budget.
 *
 * (6e) Retry — after a failure/timeout, consult the task's RetryPolicy:
 *      • "none"        → do not retry.
 *      • "fixed"       → retry up to `attempts` more times with `delayMs` wait.
 *      • "exponential" → retry up to `attempts` more times with exponential back-off.
 *      A task that exhausts all retries records a TaskFailure.
 *
 * (6f) failFast — if `config.failFast` is true and any task produces a
 *      final TaskFailure (after exhausting retries), immediately cancel
 *      all tasks that have not yet started with reason "aborted".
 *
 * (6g) External cancellation — if the provided `signal` fires, cancel
 *      all pending (not-yet-started) tasks with reason "aborted" and
 *      abort any in-flight tasks.
 *
 * (6h) Return value — resolve with a ScheduleManifest whose keys exactly
 *      match the keys of `registry`.
 *
 * NOTE: You do NOT need to handle dynamic task registration after
 *       `schedule()` is called — the registry is fixed at call time.
 */
export async function schedule<TRegistry extends TaskRegistry>(
  registry: TRegistry,
  config: SchedulerConfig,
  signal?: AbortSignal
): Promise<ScheduleManifest<TRegistry>> {
  // TODO (6)
  throw new Error("not implemented");
}

// ------------------------------------------------------------------
// 10. QUERY HELPERS ON THE MANIFEST  (mapped + conditional types)
// ------------------------------------------------------------------

/**
 * TODO (7): Implement `collectSuccesses`.
 * Given a ScheduleManifest, return a new object containing ONLY the
 * entries whose status is "success", with values narrowed to
 * TaskSuccess<OutputTypeOf<...>>.
 *
 * The return type must be derived — do NOT widen to Record<string, unknown>.
 *
 * Hint: use a mapped type with `Extract` to narrow the value type.
 */
export type SuccessesOnly<TRegistry extends TaskRegistry> = {
  [K in keyof TRegistry as ScheduleManifest<TRegistry>[K] extends TaskSuccess<unknown>
    ? K
    : never]: Extract<ScheduleManifest<TRegistry>[K], { status: "success" }>;
};

export function collectSuccesses<TRegistry extends TaskRegistry>(
  manifest: ScheduleManifest<TRegistry>
): Partial<{ [K in keyof TRegistry]: Extract<TaskResult<OutputTypeOf<TRegistry[K]>>, { status: "success" }> }> {
  // TODO (7): iterate manifest entries, filter by status === "success",
  //           return a new object with only those entries, correctly typed.
  throw new Error("not implemented");
}

/**
 * TODO (8): Implement `manifestSummary`.
 * Returns a plain counts object — no generics needed here.
 */
export interface ManifestSummary {
  total: number;
  succeeded: number;
  failed: number;
  cancelled: number;
}

export function manifestSummary(manifest: ScheduleManifest<TaskRegistry>): ManifestSummary {
  // TODO (8)
  throw new Error("not implemented");
}
