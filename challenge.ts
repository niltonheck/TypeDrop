// ============================================================
// Typed Task Queue Prioritizer
// challenge.ts
// ============================================================
// RULES: strict: true — no `any`, no `as`, no type assertions.
// ============================================================

// ── 1. Domain types ─────────────────────────────────────────

/** The three supported priority tiers (highest → lowest). */
export type Priority = "critical" | "normal" | "low";

/** A validated, strongly-typed task record. */
export interface Task {
  id: string;
  name: string;
  priority: Priority;
  /** ISO-8601 timestamp string, e.g. "2026-07-09T10:00:00Z" */
  submittedAt: string;
  /** Maximum execution time in milliseconds (must be > 0). */
  timeoutMs: number;
  /** Arbitrary key→value metadata supplied by the caller. */
  metadata: Record<string, string>;
}

// ── 2. Result types ──────────────────────────────────────────

/** Returned when a raw input cannot be validated into a Task. */
export interface ValidationError {
  /** Zero-based index of the failing raw input. */
  index: number;
  reason: string;
}

/** The final output of `buildSchedule`. */
export interface ScheduleResult {
  /** Tasks ordered by priority tier then by submittedAt (oldest first). */
  queue: Task[];
  /** One entry per invalid raw input. */
  errors: ValidationError[];
  /** Total number of raw inputs received. */
  totalReceived: number;
  /** Breakdown: how many valid tasks exist per priority tier. */
  countByPriority: Record<Priority, number>;
}

// ── 3. Constants ─────────────────────────────────────────────

/** Priority order used for sorting (index = sort weight, lower = higher priority). */
export const PRIORITY_ORDER = ["critical", "normal", "low"] as const;

// ── 4. Helper — implement this ───────────────────────────────

/**
 * Validate a single raw (unknown) value into a Task.
 *
 * Requirements:
 * // TODO-1: Return a Task if all fields are present and valid.
 * // TODO-2: Return a string describing the FIRST validation failure found, in this order:
 * //   a. `id`       — must be a non-empty string
 * //   b. `name`     — must be a non-empty string
 * //   c. `priority` — must be one of "critical" | "normal" | "low"
 * //   d. `submittedAt` — must be a string that produces a valid Date (not NaN)
 * //   e. `timeoutMs`   — must be a number > 0
 * //   f. `metadata`    — must be a plain object whose every value is a string
 *                         (missing key is fine — treat absent metadata as {})
 */
export function validateTask(raw: unknown): Task | string {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 5. Main function — implement this ────────────────────────

/**
 * Process an array of raw inputs into a fully-typed ScheduleResult.
 *
 * Requirements:
 * // TODO-3: Validate every element of `raws` using `validateTask`.
 * // TODO-4: Collect validation errors (with their original index) for failed inputs.
 * // TODO-5: Sort valid tasks first by priority tier (critical → normal → low),
 * //          then by submittedAt ascending (oldest first) within the same tier.
 * // TODO-6: Populate `countByPriority` by counting valid tasks per tier.
 * // TODO-7: Return a ScheduleResult with all four fields correctly filled.
 */
export function buildSchedule(raws: unknown[]): ScheduleResult {
  // TODO: implement
  throw new Error("Not implemented");
}
