// ============================================================
// challenge.ts — Typed Contact Book Grouper
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`)
// ============================================================

// ── 1. Domain types ─────────────────────────────────────────

/** The two supported contact categories. */
export type ContactCategory = "personal" | "work";

/** A validated, normalized contact entry. */
export interface Contact {
  id: string;
  fullName: string;         // trimmed, non-empty
  email: string;            // must contain "@"
  phone: string | null;     // null when absent or blank
  category: ContactCategory;
}

/**
 * The alphabetical index: keys are uppercase single letters (A–Z)
 * or the special bucket "#" for contacts whose name starts with a
 * non-letter character.
 */
export type AlphaKey = Uppercase<
  | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j"
  | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t"
  | "u" | "v" | "w" | "x" | "y" | "z"
> | "#";

/** Only buckets that contain at least one contact appear in the index. */
export type ContactIndex = Partial<Record<AlphaKey, Contact[]>>;

// ── 2. Result type ───────────────────────────────────────────

export type ValidationError = {
  index: number;   // position in the original raw array
  reason: string;
};

export type GroupResult = {
  index: ContactIndex;
  errors: ValidationError[];
};

// ── 3. Validation helpers ────────────────────────────────────

/**
 * TODO — Requirement 1
 * Return true if `value` is a non-null plain object (not an array).
 * Use this as your first guard before accessing any properties.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * TODO — Requirement 2
 * Validate and normalize one raw entry into a `Contact`.
 * Rules:
 *   - `id`       : must be a non-empty string
 *   - `fullName` : must be a non-empty string after trimming
 *   - `email`    : must be a string containing "@"
 *   - `phone`    : string → trimmed (null if blank); missing/null → null
 *   - `category` : must be exactly "personal" or "work"
 * Return `null` if any required field fails validation.
 */
export function validateContact(raw: Record<string, unknown>): Contact | null {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 4. Alpha-key resolution ──────────────────────────────────

/**
 * TODO — Requirement 3
 * Derive the `AlphaKey` for a contact from the first character of
 * its `fullName` (case-insensitive). Non-letter first characters → "#".
 */
export function resolveAlphaKey(contact: Contact): AlphaKey {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 5. Main grouping function ────────────────────────────────

/**
 * TODO — Requirement 4
 * Process an array of `unknown` raw entries:
 *   a. Skip (record error) entries that are not plain objects.
 *   b. Skip (record error) entries that fail `validateContact`.
 *   c. Insert valid contacts into the correct `AlphaKey` bucket,
 *      keeping each bucket sorted A→Z by `fullName`.
 *   d. Return a `GroupResult` with the populated index and all errors.
 *
 * Contacts within each bucket must be sorted ascending by `fullName`
 * (case-insensitive).
 */
export function groupContacts(rawEntries: unknown[]): GroupResult {
  // TODO: implement
  throw new Error("Not implemented");
}
