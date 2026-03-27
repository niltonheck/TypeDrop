// =============================================================
// Typed Student Grade Book Aggregator
// =============================================================
// SCENARIO:
// You're building the reporting module for an online learning
// platform. Teachers submit raw grade entries for students across
// multiple subjects. Your aggregator must:
//   1. Validate raw grade entries (score must be 0–100)
//   2. Compute a per-student summary (average score, letter grade,
//      list of subjects taken)
//   3. Return a typed result separating valid summaries from
//      validation errors
//
// Complete every TODO below. Do NOT use `any` or type assertions.
// =============================================================

// ── Domain types ─────────────────────────────────────────────

/** Raw input as received from the teacher's form submission. */
export interface RawGradeEntry {
  studentId: string;
  studentName: string;
  subject: string;
  score: number; // expected range: 0–100 (inclusive)
}

/** A score that has been confirmed to be in the range [0, 100]. */
// TODO 1: Define a branded type `ValidScore` that is a `number`
//         branded with `{ readonly __brand: "ValidScore" }`.
export type ValidScore = // TODO 1

/** A validated grade entry — same shape as RawGradeEntry but
 *  with `score` replaced by `ValidScore`. */
// TODO 2: Define `ValidatedEntry` by using a mapped/utility type
//         on `RawGradeEntry` so that the `score` field becomes
//         `ValidScore`. Do NOT manually re-list every field.
export type ValidatedEntry = // TODO 2

/** Letter grade bands. */
export type LetterGrade = "A" | "B" | "C" | "D" | "F";

/** The final per-student report card. */
export interface StudentSummary {
  studentId: string;
  studentName: string;
  /** Unique subjects the student was graded in, sorted A→Z. */
  subjects: string[];
  /** Mean score across all validated entries, rounded to 2 dp. */
  averageScore: number;
  letterGrade: LetterGrade;
}

/** Describes a single failed validation. */
export interface ValidationError {
  studentId: string;
  subject: string;
  /** The offending raw score value. */
  invalidScore: number;
  reason: string;
}

/** Aggregate result returned by `aggregateGrades`. */
export interface GradeBookResult {
  summaries: StudentSummary[];
  errors: ValidationError[];
}

// ── Helper stubs ──────────────────────────────────────────────

/**
 * TODO 3: Implement `toValidScore`.
 *
 * Returns a `ValidScore` if `n` is an integer or decimal in [0, 100],
 * otherwise returns `null`.
 *
 * Requirements:
 *  - Use a type predicate / type guard pattern so callers get a
 *    narrowed `ValidScore` on success.
 *  - No `any`, no type assertions.
 */
export function toValidScore(n: number): ValidScore | null {
  // TODO 3
}

/**
 * TODO 4: Implement `toLetterGrade`.
 *
 * Grading scale:
 *  90–100 → "A"
 *  80–89  → "B"
 *  70–79  → "C"
 *  60–69  → "D"
 *  0–59   → "F"
 *
 * The parameter type must be `ValidScore` (not plain `number`),
 * enforcing that only validated scores reach this function.
 */
export function toLetterGrade(score: ValidScore): LetterGrade {
  // TODO 4
}

// ── Main function ─────────────────────────────────────────────

/**
 * TODO 5: Implement `aggregateGrades`.
 *
 * Requirements (numbered for self-checking):
 *  5a. Validate every entry with `toValidScore`; invalid entries
 *      produce a `ValidationError` and are excluded from summaries.
 *  5b. Group validated entries by `studentId`.
 *  5c. For each student, compute:
 *        - `subjects`: unique subject names, sorted A→Z
 *        - `averageScore`: mean of all valid scores, rounded to
 *          2 decimal places (use Math.round or toFixed)
 *        - `letterGrade`: derived from `averageScore` via
 *          `toLetterGrade` — note that `averageScore` is a plain
 *          `number`; you must convert it back through `toValidScore`
 *          (or handle the edge case) before calling `toLetterGrade`.
 *  5d. `summaries` must be sorted by `studentId` ascending.
 *  5e. Return a `GradeBookResult` with both `summaries` and `errors`.
 */
export function aggregateGrades(entries: RawGradeEntry[]): GradeBookResult {
  // TODO 5
}
