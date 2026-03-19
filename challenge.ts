
// ============================================================
// Typed Task Priority Queue
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// ============================================================

// ── 1. Core domain types ────────────────────────────────────

/** The three raw priority labels a user may submit. */
export type RawPriority = "low" | "medium" | "high";

/** Numeric urgency tier derived from priority + days until due. */
export type UrgencyTier = 1 | 2 | 3 | 4 | 5;

/** Status a task may carry after validation. */
export type TaskStatus = "pending" | "in-progress" | "done";

// ── 2. Result type ──────────────────────────────────────────

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

// ── 3. Raw input (arrives as unknown from a form / API) ─────

/**
 * Shape we EXPECT from raw input — used only for internal
 * narrowing. Do NOT export this as the public validated type.
 */
export interface RawTaskInput {
  id: unknown;
  title: unknown;
  priority: unknown;
  dueDate: unknown;   // ISO-8601 date string e.g. "2026-03-25"
  status: unknown;
  tags: unknown;      // expected: string[]
}

// ── 4. Validated & enriched task ────────────────────────────

export interface Task {
  id: string;
  title: string;
  priority: RawPriority;
  dueDate: Date;
  status: TaskStatus;
  tags: string[];
  /** Computed field — see computeUrgency() requirements below. */
  urgencyTier: UrgencyTier;
}

// ── 5. Validation error ─────────────────────────────────────

export type ValidationErrorKind =
  | "MISSING_ID"
  | "MISSING_TITLE"
  | "INVALID_PRIORITY"
  | "INVALID_DUE_DATE"
  | "INVALID_STATUS"
  | "INVALID_TAGS";

export interface ValidationError {
  kind: ValidationErrorKind;
  message: string;
}

// ── 6. Helper — compute urgency tier ────────────────────────
//
// Requirements:
//   Given a validated `priority` and `dueDate`, return a UrgencyTier
//   according to this matrix:
//
//   daysUntilDue = Math.ceil((dueDate - today) / ms_per_day)
//   (use today = new Date() truncated to midnight UTC)
//
//   priority \ daysUntilDue  |  ≤ 2   |  3-7   |  > 7
//   ─────────────────────────┼────────┼────────┼──────
//   "high"                   |   5    |   4    |   3
//   "medium"                 |   4    |   3    |   2
//   "low"                    |   3    |   2    |   1
//
// TODO: implement this function.
export function computeUrgency(priority: RawPriority, dueDate: Date): UrgencyTier {
  throw new Error("Not implemented");
}

// ── 7. Core — validate a single raw unknown input ───────────
//
// Requirements:
//   • `input` is typed as `unknown`; narrow it yourself — no `as`.
//   • Return Err<ValidationError> for the FIRST validation failure
//     found, checking fields in this order:
//       id → title → priority → dueDate → status → tags
//   • id    : must be a non-empty string
//   • title : must be a non-empty string
//   • priority : must be "low" | "medium" | "high"
//   • dueDate  : must be a valid ISO date string (new Date(str) must
//                not produce Invalid Date)
//   • status   : must be "pending" | "in-progress" | "done"
//   • tags     : must be an array where every element is a string
//                (empty array is valid)
//   • On success return Ok<Task> with urgencyTier filled in.
//
// TODO: implement this function.
export function validateTask(input: unknown): Result<Task, ValidationError> {
  throw new Error("Not implemented");
}

// ── 8. Core — build a sorted priority queue ─────────────────
//
// Requirements:
//   • Accept an array of `unknown` raw inputs.
//   • Run each through `validateTask`.
//   • Collect ALL validation errors (do not stop at first bad item).
//   • Return an object with:
//       tasks  : Task[]  — only the valid tasks, sorted by
//                          urgencyTier DESC (5 first), then
//                          dueDate ASC as a tie-breaker.
//       errors : Array<{ index: number; error: ValidationError }>
//
// TODO: implement this function.
export function buildPriorityQueue(rawInputs: unknown[]): {
  tasks: Task[];
  errors: Array<{ index: number; error: ValidationError }>;
} {
  throw new Error("Not implemented");
}

// ── 9. Utility — filter queue by status ─────────────────────
//
// Requirements:
//   • Accept the full Task[] and a TaskStatus.
//   • Return only tasks matching that status, preserving order.
//   • The return type must be typed as Task[] (not a wider type).
//
// TODO: implement this function.
export function filterByStatus(tasks: Task[], status: TaskStatus): Task[] {
  throw new Error("Not implemented");
}

// ── 10. Utility — group tasks by urgency tier ───────────────
//
// Requirements:
//   • Accept Task[].
//   • Return a Record<UrgencyTier, Task[]> where every tier key
//     is always present (empty array if no tasks for that tier).
//   • Use Record<UrgencyTier, Task[]> as the explicit return type.
//
// TODO: implement this function.
export function groupByUrgency(tasks: Task[]): Record<UrgencyTier, Task[]> {
  throw new Error("Not implemented");
}
