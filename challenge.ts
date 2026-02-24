// challenge.ts
//
// 🗂️ Typed Contact Book Lookup
//
// SCENARIO: You're building a contact book utility for an internal HR tool.
// Given a list of contacts with optional fields, build a typed lookup index
// and implement search/filter helpers.
//
// ─────────────────────────────────────────────
// TYPES — fill in / complete the stubs below
// ─────────────────────────────────────────────

/** The department a contact belongs to. */
export type Department = "engineering" | "design" | "marketing" | "hr" | "finance";

/** A contact's role seniority. */
export type Seniority = "junior" | "mid" | "senior" | "lead" | "manager";

/** Core contact record — some fields are optional. */
export interface Contact {
  id: string;
  name: string;
  email: string;
  department: Department;
  seniority: Seniority;
  /** Direct phone number — not all contacts have one. */
  phone?: string;
  /** Tags for free-form categorisation (e.g. "remote", "part-time"). */
  tags?: string[];
}

// REQUIREMENT 1:
// Define a `ContactIndex` type that maps each contact's `id` (string)
// to the full `Contact` object.
// Use the built-in `Record` utility type.
export type ContactIndex = Record<string, Contact>;

// REQUIREMENT 2:
// Define a `ContactSummary` type that includes ONLY the fields:
//   id, name, email, department
// Use the built-in `Pick` utility type.
export type ContactSummary = Pick<Contact, "id" | "name" | "email" | "department">;

// REQUIREMENT 3:
// Define a `SearchFilters` type that makes EVERY field of `Contact`
// optional (so callers can filter by any subset of fields).
// Use the built-in `Partial` utility type.
// Note: `id` and `email` should also be optional here.
export type SearchFilters = Partial<Contact>;

// ─────────────────────────────────────────────
// FUNCTIONS — implement the three functions below
// ─────────────────────────────────────────────

// REQUIREMENT 4:
// `buildIndex(contacts: Contact[]): ContactIndex`
//
// Given an array of Contact objects, return a ContactIndex
// (an object keyed by each contact's `id`).
// TODO: implement this function
export function buildIndex(contacts: Contact[]): ContactIndex {
  throw new Error("Not implemented");
}

// REQUIREMENT 5:
// `summarise(index: ContactIndex): ContactSummary[]`
//
// Given a ContactIndex, return an array of ContactSummary objects
// (one per contact), containing only id, name, email, and department.
// The order of entries in the result does not matter.
// TODO: implement this function
export function summarise(index: ContactIndex): ContactSummary[] {
  throw new Error("Not implemented");
}

// REQUIREMENT 6:
// `filterContacts(contacts: Contact[], filters: SearchFilters): Contact[]`
//
// Return only the contacts that match ALL provided filter fields.
// - Primitive fields (string) must match exactly.
// - `tags`: if the filter specifies tags, every tag in the filter array
//   must be present in the contact's tags array.
// - Fields not present in `filters` (i.e. `undefined`) are ignored.
// TODO: implement this function
export function filterContacts(contacts: Contact[], filters: SearchFilters): Contact[] {
  throw new Error("Not implemented");
}
