// challenge.ts
// ============================================================
// Typed Contact Book Aggregator
// ============================================================
// A contact book that groups, searches, and summarizes contacts.
// The compiler must enforce field names, group keys, and result shapes.
// ============================================================

// ── Core domain types ────────────────────────────────────────

export type ContactSource = "manual" | "email" | "phone";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  source: ContactSource;
  tags: string[];
  createdAt: Date;
}

// ── Utility types you must define ────────────────────────────

/**
 * REQUIREMENT 1
 * Define `ContactSortField` as a union of only the keys of Contact
 * whose value type is a string or Date (i.e. sortable scalar fields).
 * Hint: use a mapped + conditional type to extract the right keys.
 *
 * Expected members: "id" | "firstName" | "lastName" | "email" | "createdAt"
 * (phone is `string | null` so it must be EXCLUDED)
 */
export type ContactSortField = {
  [K in keyof Contact]: Contact[K] extends string | Date ? K : never;
}[keyof Contact];

/**
 * REQUIREMENT 2
 * Define `ContactSummary` using only utility types (no manual re-listing
 * of property names). It must contain:
 *   - Everything in Contact EXCEPT "tags" and "phone"
 *   - Plus a new field: `displayName: string`
 *
 * Use Pick or Omit as appropriate.
 */
export type ContactSummary = Omit<Contact, "tags" | "phone"> & {
  displayName: string;
};

/**
 * REQUIREMENT 3
 * Define `GroupedContacts` as a Record mapping each ContactSource
 * to an array of ContactSummary.
 */
export type GroupedContacts = Record<ContactSource, ContactSummary[]>;

// ── Function stubs — implement all four ──────────────────────

/**
 * REQUIREMENT 4 — toSummary
 * Convert a full Contact into a ContactSummary.
 * `displayName` should be `"${firstName} ${lastName}"`.
 */
export function toSummary(contact: Contact): ContactSummary {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 5 — sortContacts
 * Return a NEW array of contacts sorted ascending by the given field.
 * - The `field` parameter must be typed as ContactSortField (no raw string).
 * - Do NOT mutate the input array.
 * - Compare values with localeCompare for strings, numeric diff for Dates.
 */
export function sortContacts(
  contacts: Contact[],
  field: ContactSortField
): Contact[] {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 6 — groupBySource
 * Group an array of contacts by their `source`, converting each to a
 * ContactSummary. Every ContactSource key must be present in the result
 * even if its array is empty.
 * Return type must be GroupedContacts.
 */
export function groupBySource(contacts: Contact[]): GroupedContacts {
  // TODO: implement
  throw new Error("Not implemented");
}

/**
 * REQUIREMENT 7 — searchContacts
 * Return contacts where `firstName`, `lastName`, OR `email` contains the
 * query string (case-insensitive). An empty query returns all contacts.
 * The `fields` parameter restricts which of the three fields are searched;
 * it must be typed as a non-empty array of those exact keys (use a union,
 * not a raw string[]).
 */
type SearchableField = "firstName" | "lastName" | "email";

export function searchContacts(
  contacts: Contact[],
  query: string,
  fields: [SearchableField, ...SearchableField[]]
): Contact[] {
  // TODO: implement
  throw new Error("Not implemented");
}
