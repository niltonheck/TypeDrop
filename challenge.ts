// ============================================================
// Typed Task Queue Scheduler
// ============================================================
// SCENARIO:
//   You're building the background job runner for a productivity app.
//   Raw task definitions arrive from a local database as unknown blobs;
//   your scheduler must validate them, sort them by priority and
//   deadline, and return a fully typed execution plan — with zero `any`.
//
// YOUR MISSION:
//   Implement all functions marked with TODO below.
//   Do NOT use `any`, `as`, or non-trivial type assertions.
// ============================================================

// -----------------------------------------------------------
// 1. DOMAIN TYPES
// -----------------------------------------------------------

/** The three urgency levels a task can carry. */
export type Priority = "low" | "medium" | "high";

/** A validated, ready-to-schedule task. */
export interface Task {
  id: string;
  title: string;
  priority: Priority;
  /** ISO-8601 date string, e.g. "2026-04-15" */
  deadline: string;
  /** Estimated duration in minutes (positive integer). */
  estimatedMinutes: number;
}

// -----------------------------------------------------------
// 2. RESULT TYPE  (no throwing — callers get typed outcomes)
// -----------------------------------------------------------

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// -----------------------------------------------------------
// 3. VALIDATION ERRORS  (discriminated union)
// -----------------------------------------------------------

export type ValidationError =
  | { kind: "missing_field";  field: string }
  | { kind: "invalid_type";   field: string; expected: string }
  | { kind: "invalid_value";  field: string; message: string };

// -----------------------------------------------------------
// 4. SCHEDULED TASK  (output shape)
// -----------------------------------------------------------

/** Numeric rank used for ordering: lower = run sooner. */
export type ScheduleRank = number & { readonly __brand: "ScheduleRank" };

export interface ScheduledTask {
  task: Task;
  rank: ScheduleRank;
}

/** The final execution plan returned to callers. */
export interface ExecutionPlan {
  /** Tasks in ascending rank order (rank 1 runs first). */
  scheduled: ScheduledTask[];
  /** Total estimated minutes across all scheduled tasks. */
  totalEstimatedMinutes: number;
  /** ISO timestamp when this plan was generated. */
  generatedAt: string;
}

// -----------------------------------------------------------
// 5. PRIORITY WEIGHTS  (use `satisfies` to lock the shape)
// -----------------------------------------------------------

// TODO: Define `PRIORITY_WEIGHTS` — a mapping from every Priority
//       to a numeric weight used in ranking.
//       • "high"   → 1
//       • "medium" → 2
//       • "low"    → 3
//       Use the `satisfies` operator to ensure every Priority key
//       is present and all values are numbers.
//
// REQUIREMENT 1: PRIORITY_WEIGHTS satisfies Record<Priority, number>
export const PRIORITY_WEIGHTS = {
  // TODO
} satisfies Record<Priority, number>;

// -----------------------------------------------------------
// 6. VALIDATION
// -----------------------------------------------------------

// TODO: Implement `validateTask`
//
// REQUIREMENT 2: Accept `unknown` input, return Result<Task, ValidationError>.
//   Rules (validate in this order, return the FIRST error found):
//   a) Input must be a non-null object → ValidationError { kind: "missing_field", field: "root" }
//      if it is not.
//   b) `id`               — must be a non-empty string.
//   c) `title`            — must be a non-empty string.
//   d) `priority`         — must be one of "low" | "medium" | "high".
//                           Use kind "invalid_value" with a descriptive message if wrong.
//   e) `deadline`         — must be a string that parses to a valid Date
//                           (use `!isNaN(new Date(value).getTime())`).
//                           Use kind "invalid_value" if the date is invalid.
//   f) `estimatedMinutes` — must be a number > 0.
//                           Use kind "invalid_value" if <= 0.
export function validateTask(raw: unknown): Result<Task, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. RANKING
// -----------------------------------------------------------

// TODO: Implement `computeRank`
//
// REQUIREMENT 3: Compute a ScheduleRank (branded number) for a validated Task.
//   Formula:
//     rank = PRIORITY_WEIGHTS[task.priority] * 1_000_000
//           + daysUntilDeadline(task.deadline) * 100
//           + task.estimatedMinutes
//
//   Where daysUntilDeadline = Math.ceil(
//     (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
//   )
//
//   Lower rank = higher urgency = scheduled first.
//   Cast the final number to ScheduleRank using a type-safe branded cast
//   (you MAY use `as ScheduleRank` only here — it is the intended branding site).
export function computeRank(task: Task): ScheduleRank {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 8. SCHEDULER  (the main entry point)
// -----------------------------------------------------------

// TODO: Implement `scheduleTasks`
//
// REQUIREMENT 4: Accept an array of unknown blobs and an optional
//   `now` string (ISO timestamp; defaults to new Date().toISOString()).
//   Steps:
//   a) Validate each blob with `validateTask`.
//      • Silently SKIP blobs that fail validation (do not throw).
//   b) Compute a ScheduleRank for each valid Task via `computeRank`.
//   c) Sort the ScheduledTask array by rank ascending (lowest first).
//   d) Assign final integer ranks 1, 2, 3, … (re-number after sorting)
//      so `scheduled[0].rank === 1`, `scheduled[1].rank === 2`, etc.
//      Cast each integer to ScheduleRank.
//   e) Sum `totalEstimatedMinutes` across all scheduled tasks.
//   f) Return a fully typed ExecutionPlan.
export function scheduleTasks(
  rawTasks: unknown[],
  now?: string
): ExecutionPlan {
  // TODO
  throw new Error("Not implemented");
}
