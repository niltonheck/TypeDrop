// ============================================================
// challenge.ts — Typed User Session Aggregator
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every section marked TODO.
// ============================================================

// ------------------------------------------------------------------
// 1. CORE DOMAIN TYPES
// ------------------------------------------------------------------

/** Pages a user can visit inside the app. */
export type PageName = "home" | "dashboard" | "settings" | "billing" | "logout";

/** A single validated session event from the tracking SDK. */
export interface SessionEvent {
  userId: string;
  page: PageName;
  durationSeconds: number; // must be >= 0
  timestamp: string;       // ISO-8601 date string
}

// ------------------------------------------------------------------
// 2. RESULT / ERROR TYPES
// ------------------------------------------------------------------

/** Wraps a successfully parsed value. */
export interface Ok<T> {
  ok: true;
  value: T;
}

/** Wraps a parse / validation failure. */
export interface Err {
  ok: false;
  error: string;
}

/** Discriminated-union result type. */
export type Result<T> = Ok<T> | Err;

// ------------------------------------------------------------------
// 3. AGGREGATION OUTPUT TYPES
// ------------------------------------------------------------------

/** Per-page breakdown stored inside a UserSessionSummary. */
export type PageVisitMap = Record<PageName, number>; // visit counts per page

/** Per-user aggregated summary produced by the engine. */
export interface UserSessionSummary {
  userId: string;
  totalSessions: number;       // total number of valid events for this user
  totalDurationSeconds: number; // sum of all durationSeconds
  avgDurationSeconds: number;  // mean duration, rounded to 2 decimal places
  pageVisits: PageVisitMap;    // how many times each page was visited
  mostVisitedPage: PageName;   // page with the highest visit count (ties: pick first alphabetically)
}

/** Final report returned by `aggregateSessions`. */
export interface SessionReport {
  validCount: number;           // total number of valid events processed
  invalidCount: number;         // total number of invalid/rejected events
  summaries: UserSessionSummary[]; // one entry per unique userId, sorted A→Z by userId
  errors: string[];             // all error messages collected during validation
}

// ------------------------------------------------------------------
// 4. VALIDATION
// ------------------------------------------------------------------

/** All valid page names, useful for runtime membership checks. */
const VALID_PAGES: readonly PageName[] = [
  "home",
  "dashboard",
  "settings",
  "billing",
  "logout",
];

/**
 * TODO — Implement this function.
 *
 * Requirements:
 * 1. Return Err if `raw` is not a plain object (null counts as not-an-object).
 * 2. Return Err if `userId` is missing or not a non-empty string.
 * 3. Return Err if `page` is missing or not one of the PageName literals.
 * 4. Return Err if `durationSeconds` is missing, not a number, or < 0.
 * 5. Return Err if `timestamp` is missing or not a string.
 * 6. Otherwise return Ok<SessionEvent> with the validated object.
 *
 * Error messages should be human-readable (content is up to you).
 */
export function validateSessionEvent(raw: unknown): Result<SessionEvent> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 5. AGGREGATION
// ------------------------------------------------------------------

/**
 * TODO — Implement this function.
 *
 * Requirements:
 * 1. Call `validateSessionEvent` on every element of `rawEvents`.
 * 2. Collect all Err messages into `SessionReport.errors`.
 * 3. Group valid events by `userId`.
 * 4. For each user, compute:
 *    a. `totalSessions`  — count of their valid events.
 *    b. `totalDurationSeconds` — sum of durationSeconds.
 *    c. `avgDurationSeconds`  — mean, rounded to 2 decimal places
 *                               (use Math.round(x * 100) / 100).
 *    d. `pageVisits` — a PageVisitMap initialised to 0 for all pages,
 *                      then incremented for each event.
 *    e. `mostVisitedPage` — page with the highest count; break ties by
 *                           choosing the page that comes first alphabetically
 *                           among the tied pages.
 * 5. Sort `summaries` alphabetically (A→Z) by `userId`.
 * 6. Return the completed `SessionReport`.
 */
export function aggregateSessions(rawEvents: unknown[]): SessionReport {
  // TODO
  throw new Error("Not implemented");
}
