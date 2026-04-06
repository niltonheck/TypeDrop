// ============================================================
// Typed Contact Book Grouper
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------------

/** The raw shape coming out of storage — fields may be missing/wrong. */
export type RawContact = unknown;

/** A validated, fully-typed contact record. */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Optional phone number, E.164 format preferred but not enforced. */
  phone?: string;
  /** ISO 8601 date string, e.g. "1990-03-15" */
  birthday?: string;
  tags: string[]; // e.g. ["friend", "colleague"]
}

// ------------------------------------------------------------------
// 2. RESULT TYPE
// ------------------------------------------------------------------

export type ValidationError =
  | { kind: "missing_field"; field: string }
  | { kind: "wrong_type"; field: string; expected: string }
  | { kind: "invalid_email"; value: string };

export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ------------------------------------------------------------------
// 3. ALPHABETICAL INDEX TYPE
// ------------------------------------------------------------------

/**
 * Maps an uppercase letter (A–Z) or "#" (for non-alpha last names)
 * to the contacts whose last name starts with that letter.
 *
 * TODO: Define `AlphaKey` as a union of the 26 uppercase letter
 *       strings plus "#", using a template literal or explicit union.
 *
 * TODO: Define `ContactIndex` as a Record mapping AlphaKey → Contact[].
 *       Use the utility type that best expresses "a record with these
 *       exact keys".
 */

// 🔴 TODO: define AlphaKey here
export type AlphaKey = TODO;

// 🔴 TODO: define ContactIndex here
export type ContactIndex = TODO;

// ------------------------------------------------------------------
// 4. VALIDATION
// ------------------------------------------------------------------

/**
 * Validates a single raw contact blob.
 *
 * Requirements (numbered for reference in tests):
 * [V1] `id` must be a non-empty string.
 * [V2] `firstName` must be a non-empty string.
 * [V3] `lastName` must be a non-empty string.
 * [V4] `email` must be a string containing exactly one "@" character.
 * [V5] If present, `phone` must be a string.
 * [V6] If present, `birthday` must be a string.
 * [V7] If present, `tags` must be an array where every element is a string;
 *      if absent, default to an empty array [].
 *
 * Return Result<Contact, ValidationError> — the FIRST error encountered wins.
 *
 * TODO: implement this function.
 */
export function validateContact(raw: RawContact): Result<Contact, ValidationError> {
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 5. GROUPING
// ------------------------------------------------------------------

/**
 * Given a validated Contact, return the AlphaKey for its last name.
 *
 * Requirements:
 * [G1] Take the first character of `lastName`, uppercase it.
 * [G2] If it is a letter A–Z, return it as AlphaKey.
 * [G3] Otherwise return "#".
 *
 * TODO: implement this function.
 */
export function getAlphaKey(contact: Contact): AlphaKey {
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. INDEX BUILDER
// ------------------------------------------------------------------

/**
 * Builds a complete ContactIndex from an array of raw blobs.
 *
 * Requirements:
 * [I1] Validate every raw blob with `validateContact`.
 * [I2] Silently skip entries that fail validation (do not throw).
 * [I3] The returned index must contain ALL 27 keys (A–Z plus "#"),
 *      even if a bucket is empty (value = []).
 * [I4] Within each bucket, contacts must be sorted ascending by
 *      `lastName`, then by `firstName` as a tiebreaker.
 * [I5] Return type must be ContactIndex — no extra keys, no missing keys.
 *
 * TODO: implement this function.
 */
export function buildContactIndex(raws: RawContact[]): ContactIndex {
  throw new Error("Not implemented");
}
