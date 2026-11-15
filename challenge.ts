// ============================================================
// challenge.ts — Typed Contact Book: Group, Search & Export
// ============================================================
// Implement the four functions below.
// Rules:
//   • strict: true — no `any`, no type assertions (`as`), no `!`
//   • Do not change the provided type definitions
//   • All requirements are numbered in the comments below
// ============================================================

// ── Domain Types ─────────────────────────────────────────────

/** Allowed contact group labels */
export type GroupLabel = "family" | "work" | "friend" | "other";

/** A single phone number entry */
export interface PhoneEntry {
  readonly type: "mobile" | "home" | "work";
  readonly number: string;
}

/** A fully-typed contact record */
export interface Contact {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phones: ReadonlyArray<PhoneEntry>;
  readonly groups: ReadonlyArray<GroupLabel>;
  /** ISO-8601 date string, e.g. "1990-04-23" — may be absent */
  readonly birthday?: string;
}

// ── Result Types ─────────────────────────────────────────────

/**
 * A lightweight view of a contact returned from search.
 * Uses Pick so it stays in sync with Contact automatically.
 */
export type ContactSummary = Pick<
  Contact,
  "id" | "firstName" | "lastName" | "email"
>;

/**
 * The shape returned by groupContacts().
 * Every possible GroupLabel must be present as a key.
 */
export type GroupedContacts = Record<GroupLabel, Contact[]>;

// ── 1. groupContacts ──────────────────────────────────────────
/**
 * Partition an array of contacts into groups.
 *
 * Requirements:
 *  1a. The returned object MUST contain every GroupLabel as a key,
 *      even if the corresponding array is empty.
 *  1b. A contact that belongs to multiple groups appears in EACH
 *      of those group arrays.
 *  1c. A contact with an empty `groups` array is placed under "other".
 */
export function groupContacts(contacts: Contact[]): GroupedContacts {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 2. searchContacts ─────────────────────────────────────────
/**
 * Case-insensitive substring search over firstName, lastName, and email.
 *
 * Requirements:
 *  2a. The `query` string is matched against firstName, lastName, AND email.
 *  2b. Matching is case-insensitive and substring-based (not exact).
 *  2c. Return ContactSummary objects (not full Contact records).
 *  2d. Return an empty array when no contacts match.
 *  2e. If `query` is an empty string, return summaries for ALL contacts.
 */
export function searchContacts(
  contacts: Contact[],
  query: string
): ContactSummary[] {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 3. exportVCard ────────────────────────────────────────────
/**
 * Serialize a single Contact to a minimal vCard 3.0 string.
 *
 * Requirements:
 *  3a. Output must start with "BEGIN:VCARD\nVERSION:3.0\n"
 *      and end with "END:VCARD".
 *  3b. Include "FN:<firstName> <lastName>"
 *  3c. Include "EMAIL:<email>"
 *  3d. Include one "TEL;TYPE=<type>:<number>" line per PhoneEntry,
 *      with the type uppercased (e.g. TYPE=MOBILE).
 *  3e. If `birthday` is present, include "BDAY:<birthday>".
 *  3f. Lines must be joined with "\n" (Unix newline).
 */
export function exportVCard(contact: Contact): string {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 4. mergeContacts ──────────────────────────────────────────
/**
 * Merge two Contact records into one, keeping the `base` contact's id.
 *
 * Requirements:
 *  4a. The returned contact keeps `base.id`.
 *  4b. For scalar fields (firstName, lastName, email, birthday),
 *      prefer the `override` value when it is a non-empty string;
 *      otherwise fall back to the `base` value.
 *  4c. `phones` is the union of both arrays (no deduplication needed).
 *  4d. `groups` is the de-duplicated union of both arrays,
 *      preserving order (base groups first).
 *  4e. The return type must be Contact (not a wider type).
 */
export function mergeContacts(base: Contact, override: Contact): Contact {
  // TODO: implement
  throw new Error("Not implemented");
}
