// ============================================================
// Typed Contact Directory Merger
// challenge.ts
// ============================================================
// Your task: implement the four functions below.
// Rules:
//   - No `any`, no `as`, no non-null assertions (`!`)
//   - strict: true must pass
// ============================================================

// ------------------------------------------------------------------
// Domain types — do NOT modify these
// ------------------------------------------------------------------

/** Two sources a contact may come from */
export type ContactSource = "internal" | "csv";

/** A phone number that has already been normalized to "+1XXXXXXXXXX" format */
export type NormalizedPhone = `+1${string}`;

/** Possible completeness tiers for a merged contact */
export type CompletenessLevel = "full" | "partial" | "minimal";

/** A raw contact as it arrives from either source */
export interface RawContact {
  readonly source: ContactSource;
  readonly name: string;
  readonly email: string;           // assumed lowercase already
  /** Raw phone string — may be "(555) 123-4567", "555-123-4567", "5551234567", or absent */
  readonly phone?: string;
  /** Only present on internal contacts */
  readonly accountId?: number;
  /** Only present on csv contacts */
  readonly company?: string;
}

/** A fully merged contact stored in the directory */
export interface MergedContact {
  readonly name: string;
  readonly email: string;
  readonly phone: NormalizedPhone | null;
  readonly accountId: number | null;
  readonly company: string | null;
  /** Which sources contributed to this record */
  readonly sources: ReadonlyArray<ContactSource>;
  readonly completeness: CompletenessLevel;
}

/** Summary produced by the directory builder */
export interface DirectorySummary {
  readonly totalContacts: number;
  readonly bySource: Record<ContactSource, number>;
  readonly byCompleteness: Record<CompletenessLevel, number>;
  /** Emails of contacts that appeared in BOTH sources */
  readonly mergedEmails: ReadonlyArray<string>;
}

// ------------------------------------------------------------------
// TASK 1 — Phone normalizer
// ------------------------------------------------------------------
/**
 * Normalize a raw phone string to NormalizedPhone ("+1XXXXXXXXXX").
 *
 * Requirements:
 *   1. Strip all non-digit characters from `raw`.
 *   2. If the result is exactly 10 digits, prepend "+1".
 *   3. If the result is 11 digits and starts with "1", prepend "+".
 *   4. Return `null` for any other length (unrecognizable format).
 *
 * The return type must be `NormalizedPhone | null` — use a type guard
 * or a helper that convinces the compiler the template-literal is satisfied.
 */
export function normalizePhone(raw: string): NormalizedPhone | null {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// TASK 2 — Single-contact merger
// ------------------------------------------------------------------
/**
 * Merge two RawContacts that share the same email into one MergedContact.
 *
 * Requirements:
 *   1. Prefer the `name` from the "internal" source; fall back to the other.
 *   2. Normalize the phone from whichever source provides one
 *      (prefer "internal" if both have one).
 *   3. Carry over `accountId` (internal) and `company` (csv) — null if absent.
 *   4. `sources` must contain both source values (no duplicates, order: internal first).
 *   5. Compute `completeness`:
 *        - "full"    → phone, accountId, AND company are all non-null
 *        - "partial" → at least one of the three is non-null
 *        - "minimal" → all three are null
 *
 * Note: this function is also used internally by `buildDirectory`.
 */
export function mergeContacts(a: RawContact, b: RawContact): MergedContact {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// TASK 3 — Single RawContact → MergedContact (no duplicate)
// ------------------------------------------------------------------
/**
 * Lift a single RawContact into a MergedContact (no merge partner).
 *
 * Requirements:
 *   1. Normalize phone if present; null otherwise.
 *   2. `sources` contains only the contact's own source.
 *   3. Apply the same completeness rules as `mergeContacts`.
 */
export function liftContact(raw: RawContact): MergedContact {
  // TODO: implement
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// TASK 4 — Directory builder
// ------------------------------------------------------------------
/**
 * Build a deduplicated directory from a mixed list of RawContacts.
 *
 * Requirements:
 *   1. Group contacts by email.
 *   2. If an email appears once → use `liftContact`.
 *      If an email appears twice (one per source) → use `mergeContacts`.
 *      If an email appears more than twice → throw an Error with the message
 *      `"Duplicate email within same source: <email>"`.
 *   3. Return both the directory (a Map keyed by email) and the summary.
 *   4. `bySource` counts how many final MergedContacts were contributed
 *      by each source (a merged record counts for BOTH sources).
 *   5. `mergedEmails` lists emails where both sources contributed, sorted A→Z.
 */
export function buildDirectory(contacts: ReadonlyArray<RawContact>): {
  directory: Map<string, MergedContact>;
  summary: DirectorySummary;
} {
  // TODO: implement
  throw new Error("Not implemented");
}
