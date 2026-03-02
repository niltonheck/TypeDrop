// ============================================================
// Typed Contact Book with Safe Parsing & Lookup
// ============================================================
// GOAL: Validate raw unknown JSON into typed Contact records,
//       build a lookup index, and expose typed query helpers.
// ============================================================

// ── 1. Domain Types ─────────────────────────────────────────

export type PhoneType = "mobile" | "home" | "work";

export interface PhoneNumber {
  type: PhoneType;
  number: string; // e.g. "+1-555-0100"
}

export interface Contact {
  id: string;           // non-empty string
  firstName: string;    // non-empty string
  lastName: string;     // non-empty string
  email: string;        // must contain "@"
  phones: PhoneNumber[]; // at least one entry
  tags: string[];       // may be empty
}

// ── 2. Result Type ───────────────────────────────────────────

// TODO: Define a generic Result<T, E> discriminated union with
//       two variants: { ok: true; value: T } and { ok: false; error: E }
export type Result<T, E> = never; // replace `never` with your definition

// ── 3. Validation Error ──────────────────────────────────────

// TODO: Define a ParseError type that is a discriminated union of
//       at least the following variants (use a "kind" discriminant):
//   - { kind: "not_object" }
//   - { kind: "missing_field"; field: string }
//   - { kind: "invalid_field"; field: string; reason: string }
export type ParseError = never; // replace `never` with your definition

// ── 4. Runtime Validator ─────────────────────────────────────

/**
 * Parses an unknown value into a Contact.
 *
 * Requirements (numbered for reference in tests):
 * [R1] Returns { ok: false, error: { kind: "not_object" } }
 *      if the input is null, an array, or not an object.
 * [R2] Returns { ok: false, error: { kind: "missing_field", field } }
 *      for the first field that is absent or not a string / array
 *      (check: id, firstName, lastName, email, phones, tags — in that order).
 * [R3] Returns { ok: false, error: { kind: "invalid_field", field, reason } }
 *      if "id", "firstName", or "lastName" is an empty string.
 * [R4] Returns { ok: false, error: { kind: "invalid_field", field: "email", reason } }
 *      if email does not contain "@".
 * [R5] Returns { ok: false, error: { kind: "invalid_field", field: "phones", reason } }
 *      if phones is an empty array OR if any entry is missing/invalid
 *      "type" (must be "mobile"|"home"|"work") or "number" (non-empty string).
 * [R6] Returns { ok: true, value: contact } on success.
 */
export function parseContact(raw: unknown): Result<Contact, ParseError> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 5. Contact Book ──────────────────────────────────────────

// TODO: Define ContactIndex as a Record mapping each Contact's id
//       to the Contact itself (use the Record utility type).
export type ContactIndex = never; // replace `never` with your definition

/**
 * Builds a ContactIndex from an array of valid Contact objects.
 * Duplicate ids: last one wins.
 */
export function buildIndex(contacts: Contact[]): ContactIndex {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * Looks up a contact by id.
 * Returns the Contact if found, or undefined if not.
 *
 * TYPING CHALLENGE: express the return type as `Contact | undefined`
 * without using a type assertion.
 */
export function findById(
  index: ContactIndex,
  id: string
): Contact | undefined {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * Returns all contacts whose tags array includes ALL of the given tags.
 * If requiredTags is empty, returns all contacts in the index.
 *
 * [R7] The return type must be Contact[] (not ContactIndex).
 */
export function filterByTags(
  index: ContactIndex,
  requiredTags: string[]
): Contact[] {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * Searches contacts by a case-insensitive prefix match on firstName OR lastName.
 * Returns contacts sorted alphabetically by lastName, then firstName.
 *
 * [R8] The return type must be Contact[].
 */
export function searchByName(index: ContactIndex, prefix: string): Contact[] {
  // TODO: implement
  throw new Error("Not implemented");
}
