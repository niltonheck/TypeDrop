// ============================================================
// Typed Distributed Task Scheduler with Retry Policies & Concurrency Limits
// ============================================================
// REQUIREMENTS
// 1. Define a discriminated union `RetryPolicy` with three variants:
//    - { kind: "none" }
//    - { kind: "fixed";       delayMs: number; maxAttempts: number }
//    - { kind: "exponential"; baseDelayMs: number; maxAttempts: number; factor: number }
//
// 2. Define a discriminated union `Task<TPayload>` where each variant shares
//    the fields: id (string), payload (TPayload), retryPolicy (RetryPolicy).
//    Variants must be:
//    - { type: "http";    payload: HttpPayload;    ... }
//    - { type: "compute"; payload: ComputePayload; ... }
//    - { type: "notify";  payload: NotifyPayload;  ... }
//
// 3. Define payload types (all fields required, no optionals):
//    - HttpPayload:     { url: string; method: "GET" | "POST" | "PUT" | "DELETE"; body: string }
//    - ComputePayload:  { expression: string; timeoutMs: number }
//    - NotifyPayload:   { channel: "email" | "sms" | "push"; recipient: string; message: string }
//
// 4. Define a discriminated union `TaskOutcome<TPayload>` with variants:
//    - { status: "succeeded"; task: Task<TPayload>; result: string; attempts: number }
//    - { status: "exhausted"; task: Task<TPayload>; lastError: string; attempts: number }
//    - { status: "cancelled"; task: Task<TPayload>; reason: string }
//
// 5. Define `SchedulerConfig`:
//    - concurrencyLimit: number   — max tasks running simultaneously
//    - globalTimeoutMs:  number   — wall-clock budget for the entire run
//
// 6. Define `RunReport<TPayload>`:
//    - outcomes:   TaskOutcome<TPayload>[]
//    - totalMs:    number
//    - succeeded:  number   — count of "succeeded" outcomes
//    - exhausted:  number   — count of "exhausted" outcomes
//    - cancelled:  number   — count of "cancelled" outcomes
//
// 7. Implement the type alias `TaskExecutor<TPayload>`:
//    A function type that receives a Task<TPayload> and returns Promise<string>
//    (resolves with a result string, rejects with an Error).
//
// 8. Implement `computeNextDelay`:
//    Given a RetryPolicy and the current attempt number (1-based),
//    return the delay in ms before the next attempt, or `null` if no retry
//    should be attempted (policy is "none", or attempts are exhausted).
//    Signature:
//      function computeNextDelay(policy: RetryPolicy, attempt: number): number | null
//
// 9. Implement `runScheduler`:
//    Execute all tasks respecting the concurrencyLimit and globalTimeoutMs.
//    - Use the provided executor to run each task.
//    - Retry failed tasks per their RetryPolicy (wait the computed delay between retries).
//    - If the globalTimeoutMs wall-clock budget expires before a task completes all
//      attempts, mark it as "cancelled" with reason "global timeout exceeded".
//    - Tasks that exceed their retry attempts are marked "exhausted".
//    - Tasks that succeed are marked "succeeded".
//    - Return a fully populated RunReport.
//    Signature:
//      async function runScheduler<TPayload>(
//        tasks: Task<TPayload>[],
//        executor: TaskExecutor<TPayload>,
//        config: SchedulerConfig,
//      ): Promise<RunReport<TPayload>>
//
// 10. Implement `partitionOutcomes`:
//     A generic function that takes a RunReport<TPayload> and returns an object
//     with three arrays keyed by status, each narrowed to the correct variant:
//       {
//         succeeded: Array<TaskOutcome<TPayload> & { status: "succeeded" }>;
//         exhausted:  Array<TaskOutcome<TPayload> & { status: "exhausted" }>;
//         cancelled:  Array<TaskOutcome<TPayload> & { status: "cancelled" }>;
//       }
//     Signature:
//       function partitionOutcomes<TPayload>(
//         report: RunReport<TPayload>,
//       ): {
//         succeeded: Array<TaskOutcome<TPayload> & { status: "succeeded" }>;
//         exhausted:  Array<TaskOutcome<TPayload> & { status: "exhausted" }>;
//         cancelled:  Array<TaskOutcome<TPayload> & { status: "cancelled" }>;
//       }
//
// ============================================================
// TYPE STUBS — replace `TODO` with real types
// ============================================================

export type RetryPolicy = TODO;

export type HttpPayload    = TODO;
export type ComputePayload = TODO;
export type NotifyPayload  = TODO;

// Hint: make Task a generic discriminated union over its payload variants.
export type Task<TPayload> = TODO;

export type TaskOutcome<TPayload> = TODO;

export type SchedulerConfig = TODO;

export type RunReport<TPayload> = TODO;

export type TaskExecutor<TPayload> = TODO;

// ============================================================
// FUNCTION STUBS — implement these
// ============================================================

export function computeNextDelay(policy: RetryPolicy, attempt: number): number | null {
  // TODO
  throw new Error("Not implemented");
}

export async function runScheduler<TPayload>(
  tasks: Task<TPayload>[],
  executor: TaskExecutor<TPayload>,
  config: SchedulerConfig,
): Promise<RunReport<TPayload>> {
  // TODO
  throw new Error("Not implemented");
}

export function partitionOutcomes<TPayload>(
  report: RunReport<TPayload>,
): {
  succeeded: Array<TaskOutcome<TPayload> & { status: "succeeded" }>;
  exhausted:  Array<TaskOutcome<TPayload> & { status: "exhausted" }>;
  cancelled:  Array<TaskOutcome<TPayload> & { status: "cancelled" }>;
} {
  // TODO
  throw new Error("Not implemented");
}
