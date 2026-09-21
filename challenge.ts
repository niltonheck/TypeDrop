// ============================================================
// Typed Contact Book Search & Filter
// challenge.ts
// ============================================================
// Requirement 1 — No `any`, `as`, or unsafe type assertions allowed.
// Requirement 2 — All exported types/functions must compile under strict: true.
// ============================================================

// ── Domain types ─────────────────────────────────────────────

/** Every contact must belong to exactly one of these groups. */
export type ContactGroup = "family" | "work" | "friend" | "acquaintance";

/** A phone number entry — a contact may have several. */
export interface PhoneEntry {
  label: "mobile" | "home" | "work";
  number: string;
}

/** Core shape for every contact in the book. */
export interface Contact {
  id: string;
  fullName: string;
  group: ContactGroup;
  email: string | null;   // null when not provided
  phones: PhoneEntry[];
  tags: string[];         // e.g. ["vip", "newsletter"]
}

// ── Requirement 3 ────────────────────────────────────────────
// Define a `SearchQuery` type whose fields are ALL optional, but
// only the following keys are allowed:
//   • nameContains  – string  – case-insensitive substring match on fullName
//   • group         – ContactGroup  – exact match
//   • tag           – string  – contact must include this tag
//   • hasEmail      – boolean – true → must have non-null email; false → must have null email
//
// Hint: model it as an interface or object type — NOT a union.

export type SearchQuery = {
  // TODO: fill in the fields (all optional)
};

// ── Requirement 4 ────────────────────────────────────────────
// Define a branded type `ContactId` that is a `string` at runtime
// but is distinct from plain `string` at compile time.
// Use it as the return type of `getContactById`.

export type ContactId = string & { readonly __brand: "ContactId" };

/** Utility: cast a raw string into a ContactId (used only in mock data setup). */
export function toContactId(raw: string): ContactId {
  // TODO: return raw as ContactId — this is the ONE place a cast is acceptable
  //       because it is the explicit "trust boundary" for external data.
  return raw as ContactId;
}

// ── Requirement 5 ────────────────────────────────────────────
// Implement `searchContacts`.
// • Accepts the full contacts array and a `SearchQuery`.
// • Applies every provided filter field (ignore undefined fields).
// • Returns a new array containing only the matching contacts.
// • Must NOT mutate the input array.
// • Order of results should match original order in the input array.

export function searchContacts(
  contacts: Contact[],
  query: SearchQuery
): Contact[] {
  // TODO
  return [];
}

// ── Requirement 6 ────────────────────────────────────────────
// Implement `getContactById`.
// • Looks up a single contact by its `ContactId`.
// • Returns the found `Contact` or `null` — no throwing.

export function getContactById(
  contacts: Contact[],
  id: ContactId
): Contact | null {
  // TODO
  return null;
}

// ── Requirement 7 ────────────────────────────────────────────
// Implement `groupContacts`.
// • Accepts the full contacts array.
// • Returns a `Record` keyed by `ContactGroup` where each value
//   is the array of contacts belonging to that group.
// • Every ContactGroup key must be present in the result, even
//   if its array is empty.

export function groupContacts(
  contacts: Contact[]
): Record<ContactGroup, Contact[]> {
  // TODO
  return {
    family: [],
    work: [],
    friend: [],
    acquaintance: [],
  };
}

// ── Requirement 8 (Bonus) ─────────────────────────────────────
// Implement `pickContactFields`.
// • A generic function that accepts an array of contacts and a
//   readonly array of keys (constrained to keyof Contact).
// • Returns a new array where each element contains ONLY the
//   picked keys — use mapped types / Pick<> so the return type
//   is inferred precisely by the compiler.
// • The caller should never need to annotate the return type manually.

export function pickContactFields<K extends keyof Contact>(
  contacts: Contact[],
  keys: readonly K[]
): Pick<Contact, K>[] {
  // TODO
  return [];
}
