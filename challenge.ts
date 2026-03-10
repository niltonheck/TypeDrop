// ============================================================
// Typed Contact Book Merger
// ============================================================
// GOAL: validate raw unknown records, merge duplicates by email,
// and return a typed result — no `any`, no type assertions.
// ============================================================

// ── 1. Core domain types ────────────────────────────────────

export type ContactSource = "phone" | "email" | "linkedin";

export interface Contact {
  email: string;           // lowercase, trimmed — the unique key
  name: string;            // non-empty
  phone: string | null;    // optional — null when absent
  sources: ContactSource[]; // deduplicated list of sources this contact came from
}

// ── 2. Result type (discriminated union) ─────────────────────

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

// ── 3. Raw input shape (what arrives from external sources) ──

// Raw records come in as `unknown` — you must validate each field.
// A raw record is valid when:
//   • `email`  — non-empty string (normalise: lowercase + trim)
//   • `name`   — non-empty string (trim)
//   • `phone`  — string | null | undefined  (normalise absent/undefined → null)
//   • `source` — one of the ContactSource literals

// ── 4. Requirement 1 ─────────────────────────────────────────
// Implement a type-guard that narrows `ContactSource`.
//
// export function isContactSource(value: unknown): value is ContactSource { … }

export function isContactSource(value: unknown): value is ContactSource {
  // TODO: return true only when value is "phone", "email", or "linkedin"
  throw new Error("Not implemented");
}

// ── 5. Requirement 2 ─────────────────────────────────────────
// Implement a validator that parses a single unknown record.
//
// Returns ParseResult<Contact> — ok:true with a normalised Contact,
// or ok:false with a human-readable error string describing the
// FIRST validation failure found (check in order: email, name, source, phone).
//
// export function parseRawContact(raw: unknown): ParseResult<Contact> { … }

export function parseRawContact(raw: unknown): ParseResult<Contact> {
  // TODO:
  // 1. Confirm `raw` is a non-null object (not an array).
  // 2. Validate & normalise `email` (non-empty string, lowercase + trim).
  // 3. Validate & normalise `name`  (non-empty string, trim).
  // 4. Validate `source` via isContactSource().
  // 5. Normalise `phone`: string → trimmed string, null/undefined → null.
  //    Reject any other type.
  // 6. Return { ok: true, value: Contact } on success.
  throw new Error("Not implemented");
}

// ── 6. Requirement 3 ─────────────────────────────────────────
// Implement the merger.
//
// Takes an array of unknown raw records and returns:
//   • `contacts`  — deduplicated Contact[], merged by normalised email.
//                   When the same email appears more than once:
//                     - keep the FIRST non-null phone encountered
//                     - union & deduplicate the `sources` arrays
//                     - keep the name from the FIRST valid record for that email
//   • `failures`  — ParseResult<never>[] (ok: false entries) for every
//                   raw record that failed validation, preserving order.
//
// export function mergeContacts(
//   rawRecords: unknown[]
// ): { contacts: Contact[]; failures: Array<{ ok: false; error: string }> } { … }

export function mergeContacts(
  rawRecords: unknown[]
): { contacts: Contact[]; failures: Array<{ ok: false; error: string }> } {
  // TODO:
  // 1. Run parseRawContact() on every element.
  // 2. Collect failures (ok: false results) into `failures`.
  // 3. For successful records, merge by email using a Map<string, Contact>:
  //      - On first encounter: insert the contact as-is.
  //      - On duplicate email:
  //          • phone  → keep existing if non-null, else take new value
  //          • sources → union (deduplicate with a Set)
  //          • name   → keep existing (first-seen wins)
  // 4. Return { contacts: [...map.values()], failures }.
  throw new Error("Not implemented");
}
