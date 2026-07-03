// ============================================================
// Typed Job Queue Scheduler with Priority & Retry Policies
// ============================================================
// TOPICS: discriminated unions, generics, mapped types,
//         conditional types, Result<T,E>, runtime validation,
//         Record utility type, satisfies
// ============================================================

// -------------------------------------------------------------------
// 1. DOMAIN TYPES
// -------------------------------------------------------------------

/** Priority tiers — higher number = higher urgency */
export type Priority = 1 | 2 | 3;

/** All recognized job kinds */
export type JobKind = "email" | "report" | "export" | "webhook";

/**
 * Discriminated union of typed job payloads.
 * Each variant carries ONLY the fields relevant to its kind.
 */
export type JobPayload =
  | { kind: "email";   to: string;      subject: string; body: string }
  | { kind: "report";  reportId: string; format: "pdf" | "csv"        }
  | { kind: "export";  resourceType: string; filters: Record<string, string> }
  | { kind: "webhook"; url: string;     secret: string               };

/**
 * A validated, strongly-typed Job record.
 * `id` is a branded string so raw strings cannot be accidentally used as IDs.
 */
export type JobId = string & { readonly __brand: "JobId" };

export interface Job {
  id: JobId;
  priority: Priority;
  payload: JobPayload;
  /** ISO-8601 timestamp */
  enqueuedAt: string;
  /** Max total attempts (first attempt + retries) */
  maxAttempts: number;
}

// -------------------------------------------------------------------
// 2. RETRY POLICY
// -------------------------------------------------------------------

export type BackoffStrategy = "fixed" | "exponential" | "none";

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  /** Base delay in milliseconds (ignored when strategy is "none") */
  baseDelayMs: number;
}

/**
 * Per-job-kind retry policies.
 * REQUIREMENT: must cover every JobKind — use a mapped type with `satisfies`
 * so TypeScript enforces completeness.
 */
export type RetryPolicyMap = Record<JobKind, RetryPolicy>;

// -------------------------------------------------------------------
// 3. VALIDATION — Result type
// -------------------------------------------------------------------

export type ValidationError = {
  field: string;
  message: string;
};

export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

/**
 * TODO 1 — Validate a single raw (unknown) job definition.
 *
 * Requirements:
 * - Returns Result<Job, ValidationError[]>
 * - Must validate: id (non-empty string), priority (1|2|3),
 *   enqueuedAt (non-empty string), and payload.kind (valid JobKind)
 * - Must validate payload fields per kind (see JobPayload discriminated union)
 * - Stamps maxAttempts from the provided retryPolicies map
 * - Collects ALL field errors before returning (do not short-circuit)
 * - Must NOT use `any` or type assertions (`as`)
 *
 * @param raw            - Unknown input from message broker
 * @param retryPolicies  - Lookup map for retry config per job kind
 */
export function validateJob(
  raw: unknown,
  retryPolicies: RetryPolicyMap
): Result<Job, ValidationError[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// -------------------------------------------------------------------
// 4. SCHEDULING — DispatchPlan
// -------------------------------------------------------------------

/**
 * A single entry in the dispatch plan.
 * `delayMs` is how long to wait before first attempt.
 */
export interface ScheduledEntry {
  job: Job;
  delayMs: number;
  retryPolicy: RetryPolicy;
}

/**
 * The final output of the scheduler.
 */
export interface DispatchPlan {
  /** Jobs ordered by priority DESC, then enqueuedAt ASC */
  scheduled: ScheduledEntry[];
  /** Validation failures, keyed by raw index */
  rejected: Record<number, ValidationError[]>;
  /** Total number of raw inputs processed */
  totalProcessed: number;
}

/**
 * TODO 2 — Compute the initial delay (ms) before a job's first attempt.
 *
 * Rules:
 * - Priority 3 → 0 ms   (immediate)
 * - Priority 2 → 500 ms
 * - Priority 1 → 2000 ms
 *
 * REQUIREMENT: the return type must be derived from Priority using a
 * conditional type (no hard-coded `number` return annotation allowed —
 * use the PriorityDelayMs conditional type defined below).
 */
export type PriorityDelayMs<P extends Priority> =
  P extends 3 ? 0 :
  P extends 2 ? 500 :
  /* P extends 1 */ 2000;

export function getInitialDelayMs<P extends Priority>(priority: P): PriorityDelayMs<P> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 3 — Build a DispatchPlan from an array of raw unknown inputs.
 *
 * Requirements:
 * - Validate each raw item with `validateJob`
 * - Invalid items go into `rejected` (keyed by their index in `rawJobs`)
 * - Valid jobs are scheduled: compute delayMs via `getInitialDelayMs`,
 *   attach the matching retryPolicy from the map
 * - Sort `scheduled` by priority DESC (3 first), then enqueuedAt ASC
 * - Populate totalProcessed with rawJobs.length
 *
 * @param rawJobs        - Array of unknown broker messages
 * @param retryPolicies  - Retry config map (must satisfy RetryPolicyMap)
 */
export function buildDispatchPlan(
  rawJobs: unknown[],
  retryPolicies: RetryPolicyMap
): DispatchPlan {
  // TODO: implement
  throw new Error("Not implemented");
}

// -------------------------------------------------------------------
// 5. TYPED HELPERS (implement these too)
// -------------------------------------------------------------------

/**
 * TODO 4 — Type guard: narrows `unknown` to a `JobPayload` for the given kind.
 *
 * Hint: use a generic constrained to JobKind and return a type predicate.
 */
export function isPayloadOfKind<K extends JobKind>(
  value: unknown,
  kind: K
): value is Extract<JobPayload, { kind: K }> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO 5 — Given a DispatchPlan, return only the ScheduledEntry items
 * whose job payload matches the requested kind.
 *
 * REQUIREMENT: the return type must be narrowed so that
 * `entry.job.payload` is typed as `Extract<JobPayload, { kind: K }>`.
 */
export type NarrowedEntry<K extends JobKind> = Omit<ScheduledEntry, "job"> & {
  job: Omit<Job, "payload"> & { payload: Extract<JobPayload, { kind: K }> };
};

export function filterByKind<K extends JobKind>(
  plan: DispatchPlan,
  kind: K
): NarrowedEntry<K>[] {
  // TODO: implement
  throw new Error("Not implemented");
}
