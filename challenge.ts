// challenge.ts
// ─────────────────────────────────────────────────────────────────────────────
// Typed Job Queue with Priority Scheduling & Status Tracking
// ─────────────────────────────────────────────────────────────────────────────
//
// CONTEXT
// -------
// You are building a background job processor for a SaaS platform.
// Three job types exist: "email", "report", and "export".
// Each has its own payload shape. Jobs flow through a lifecycle:
//
//   pending → running → succeeded
//                    ↘ failed
//
// You must implement a generic, priority-aware job queue whose types
// ensure every handler receives the correct payload and every status
// transition is tracked without unsafe casts.
//
// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — Core domain types
// ─────────────────────────────────────────────────────────────────────────────

/** All supported job kinds. */
export type JobKind = "email" | "report" | "export";

/** Payload shapes keyed by job kind. */
export type JobPayloadMap = {
  email: { to: string; subject: string; body: string };
  report: { reportId: string; format: "pdf" | "csv" | "xlsx" };
  export: { datasetId: string; destination: string; compress: boolean };
};

/** Priority levels — higher number = higher priority. */
export type Priority = 1 | 2 | 3;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — Job lifecycle (discriminated union)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO 1 — Define `Job<K extends JobKind>`.
 *
 * A Job must carry:
 *   - id        : string
 *   - kind      : K
 *   - payload   : the correct entry from JobPayloadMap[K]
 *   - priority  : Priority
 *   - createdAt : number  (Date.now() timestamp)
 *
 * Requirements:
 *   - The type must be generic over K so that `job.payload` is always
 *     narrowed to the exact payload for that kind — no union bleed-through.
 */
export type Job<K extends JobKind> = never; // TODO 1 — replace with your definition

// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO 2 — Define `JobStatus<K extends JobKind>` as a discriminated union
 * with three variants:
 *
 *   • { status: "pending";   job: Job<K> }
 *   • { status: "running";   job: Job<K>; startedAt: number }
 *   • { status: "succeeded"; job: Job<K>; startedAt: number; finishedAt: number; result: string }
 *   • { status: "failed";    job: Job<K>; startedAt: number; finishedAt: number; error: string }
 *
 * The discriminant must be the `status` field.
 */
export type JobStatus<K extends JobKind> = never; // TODO 2 — replace with your definition

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — Handler registry
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO 3 — Define `HandlerFn<K extends JobKind>`.
 *
 * A handler is an async function that receives a `Job<K>` and returns a
 * `string` result on success (or throws on failure).
 */
export type HandlerFn<K extends JobKind> = never; // TODO 3 — replace with your definition

/**
 * TODO 4 — Define `HandlerRegistry` as a mapped type over `JobKind` so that
 * every kind maps to its correctly-typed `HandlerFn`.
 *
 * Hint: Use a mapped type over JobKind (not a plain object literal).
 */
export type HandlerRegistry = never; // TODO 4 — replace with your definition

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — JobQueue class
// ─────────────────────────────────────────────────────────────────────────────

export class JobQueue {
  // TODO 5 — Declare private fields:
  //   - `handlers`  : HandlerRegistry
  //   - `ledger`    : a Map that stores JobStatus for *any* JobKind.
  //                   Hint: Use Map<string, JobStatus<JobKind>> — the id is the key.
  //   - `queue`     : an array that holds pending jobs of *any* JobKind.
  //                   Hint: Use Array<Job<JobKind>>.

  constructor(handlers: HandlerRegistry) {
    // TODO 6 — Initialise all private fields.
    void handlers;
  }

  /**
   * TODO 7 — `enqueue<K extends JobKind>`
   *
   * Creates a new Job<K> from the supplied kind, payload, and priority,
   * assigns it a unique string id (you may use Math.random().toString(36).slice(2)),
   * records its initial JobStatus as "pending" in the ledger,
   * pushes it onto the queue,
   * and returns the job's id.
   *
   * Requirements:
   *   - The `payload` parameter must be inferred as `JobPayloadMap[K]` — no
   *     manual annotation needed at the call site.
   *   - The compiler must reject a mismatched payload (e.g. passing an email
   *     payload when kind is "report").
   */
  enqueue<K extends JobKind>(
    kind: K,
    payload: JobPayloadMap[K],
    priority: Priority
  ): string {
    // TODO 7
    void kind; void payload; void priority;
    return "";
  }

  /**
   * TODO 8 — `processNext(): Promise<string | null>`
   *
   * Picks the highest-priority pending job from the queue (ties broken by
   * earliest createdAt). If the queue is empty, resolves to null.
   *
   * For the chosen job:
   *   1. Update its ledger entry to "running" (record startedAt = Date.now()).
   *   2. Call the appropriate handler from `this.handlers[job.kind]`.
   *   3a. On success: update ledger to "succeeded" with finishedAt + result string.
   *   3b. On failure: update ledger to "failed"   with finishedAt + error message.
   *   4. Return the job id.
   *
   * Requirements:
   *   - You must narrow `job.kind` so TypeScript knows which handler to call
   *     and which payload to pass — without any unsafe casts.
   *   - The ledger must always reflect the latest status.
   */
  async processNext(): Promise<string | null> {
    // TODO 8
    return null;
  }

  /**
   * TODO 9 — `getStatus<K extends JobKind>(id: string): JobStatus<K> | undefined`
   *
   * Returns the current JobStatus for the given id, or undefined if unknown.
   *
   * Requirements:
   *   - The return type must be `JobStatus<K> | undefined` — callers can
   *     supply the kind as a type argument to get a narrowed payload type.
   */
  getStatus<K extends JobKind>(id: string): JobStatus<K> | undefined {
    // TODO 9
    void id;
    return undefined;
  }

  /**
   * TODO 10 — `drain(): Promise<void>`
   *
   * Processes all jobs currently in the queue sequentially (one at a time),
   * calling `processNext` until the queue is empty.
   */
  async drain(): Promise<void> {
    // TODO 10
  }

  /**
   * TODO 11 — `summary(): Record<JobStatus<JobKind>["status"], number>`
   *
   * Returns a count of ledger entries grouped by status.
   * All four status keys must be present even if their count is 0.
   */
  summary(): Record<JobStatus<JobKind>["status"], number> {
    // TODO 11
    return { pending: 0, running: 0, succeeded: 0, failed: 0 };
  }
}
