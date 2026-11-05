// ============================================================
// Typed Contact Address Book with Search & Grouping
// ============================================================
// Your task: implement the four functions below.
// Rules:
//   - No `any`, no `as` type assertions, no non-null assertions (!)
//   - All code must compile under strict: true
// ============================================================

// ── Domain Types ────────────────────────────────────────────

/** Two-letter ISO 3166-1 alpha-2 country code, e.g. "US" | "GB" | "DE" */
type CountryCode = string & { readonly __brand: "CountryCode" };

type PhoneType = "mobile" | "home" | "work";

interface PhoneNumber {
  readonly type: PhoneType;
  /** Digits only, no spaces or dashes — e.g. "14155552671" */
  readonly digits: string;
}

type ContactGroup = "family" | "friend" | "colleague" | "acquaintance";

/** The raw shape that arrives from the form — all fields are unknown */
interface RawContact {
  readonly id: unknown;
  readonly firstName: unknown;
  readonly lastName: unknown;
  readonly email: unknown;
  readonly phones: unknown;
  readonly group: unknown;
  readonly country: unknown;
}

/** A fully validated, normalized contact */
interface Contact {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  /** Lower-cased and trimmed */
  readonly email: string;
  readonly phones: readonly PhoneNumber[];
  readonly group: ContactGroup;
  readonly country: CountryCode;
  /** Derived: "<firstName> <lastName>" */
  readonly fullName: string;
}

/** Returned when validation fails */
interface ValidationError {
  readonly field: keyof RawContact;
  readonly message: string;
}

/** Discriminated union result type */
type ValidationResult =
  | { readonly ok: true; readonly contact: Contact }
  | { readonly ok: false; readonly errors: readonly ValidationError[] };

// ── Search ──────────────────────────────────────────────────

/** Fields of Contact that hold a plain string value (searchable) */
type StringContactField = {
  [K in keyof Contact]: Contact[K] extends string ? K : never;
}[keyof Contact];

interface SearchQuery {
  /** Which string field to search in */
  readonly field: StringContactField;
  /** Case-insensitive substring match */
  readonly term: string;
}

// ── Task 1 ───────────────────────────────────────────────────
/**
 * Validate and normalize a RawContact into a Contact.
 *
 * Requirements (numbered so you can tick them off):
 * 1. `id`       — must be a non-empty string.
 * 2. `firstName`— must be a non-empty string (trimmed).
 * 3. `lastName` — must be a non-empty string (trimmed).
 * 4. `email`    — must be a string containing "@"; normalize to lowercase + trim.
 * 5. `phones`   — must be an array; each element must have a valid `type`
 *                 ("mobile" | "home" | "work") and a `digits` string containing
 *                 only digits (0-9). Strip non-digit characters from `digits`
 *                 automatically before validating.
 * 6. `group`    — must be one of: "family" | "friend" | "colleague" | "acquaintance".
 * 7. `country`  — must be a 2-letter uppercase string (e.g. "US"); brand it as CountryCode.
 * 8. `fullName` — derive as "<trimmed firstName> <trimmed lastName>".
 * 9. Collect ALL validation errors before returning; never return on the first error.
 * 10. Return `{ ok: true, contact }` if valid, `{ ok: false, errors }` otherwise.
 */
export function validateContact(raw: RawContact): ValidationResult {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Task 2 ───────────────────────────────────────────────────
/**
 * Search an array of contacts.
 *
 * Requirements:
 * 1. Filter contacts where `contact[query.field]` contains `query.term`
 *    as a case-insensitive substring.
 * 2. Return a new readonly array of matching contacts (preserve order).
 * 3. `StringContactField` must constrain `query.field` at compile time —
 *    non-string fields (phones, etc.) must be excluded by the type, not by you.
 */
export function searchContacts(
  contacts: readonly Contact[],
  query: SearchQuery
): readonly Contact[] {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Task 3 ───────────────────────────────────────────────────
/**
 * Group an array of contacts by their `group` field.
 *
 * Requirements:
 * 1. Return a `Record<ContactGroup, readonly Contact[]>`.
 * 2. Every ContactGroup key must be present in the result, even if the
 *    array for that group is empty.
 * 3. Use `Record<ContactGroup, readonly Contact[]>` as the return type —
 *    the compiler must enforce all four keys exist.
 */
export function groupByCategory(
  contacts: readonly Contact[]
): Record<ContactGroup, readonly Contact[]> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── Task 4 ───────────────────────────────────────────────────
/**
 * Produce a summary string for a contact group bucket.
 *
 * Requirements:
 * 1. Accept a `ContactGroup` label and the contacts in that group.
 * 2. Return a string in exactly this format (no trailing newline):
 *    "<Group> (<count>): Alice Smith, Bob Jones"
 *    where <Group> is the label with its first letter capitalized,
 *    and names are fullName values joined by ", ".
 * 3. If the group is empty, the names portion should be "(none)".
 *    Example: "Friend (0): (none)"
 */
export function summarizeGroup(
  group: ContactGroup,
  contacts: readonly Contact[]
): string {
  // TODO: implement
  throw new Error("Not implemented");
}
