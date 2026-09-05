// ============================================================
// Typed Contact Book with Grouped Search & Formatted Output
// ============================================================
// Requirements are marked with numbered TODO comments.
// Implement every stub so the file compiles under strict: true.
// Do NOT use `any`, `as`, or non-null assertions (!).
// ============================================================

// ---------------------------------------------------------------------------
// TODO 1 — Contact channel types
// ---------------------------------------------------------------------------
// Define a discriminated union called `ContactChannel` with two members:
//   • { kind: "phone"; number: string }
//   • { kind: "email"; address: string }

export type ContactChannel = never; // replace `never` with your union

// ---------------------------------------------------------------------------
// TODO 2 — Contact record
// ---------------------------------------------------------------------------
// Define an interface `Contact` with:
//   • id        : string
//   • firstName : string
//   • lastName  : string
//   • channels  : readonly ContactChannel[]   (at least one, enforced below)
//   • tags      : readonly string[]           (may be empty)

export interface Contact {
  // your fields here
}

// ---------------------------------------------------------------------------
// TODO 3 — NonEmptyArray helper (generic)
// ---------------------------------------------------------------------------
// Define a generic type alias `NonEmptyArray<T>` that represents an array
// guaranteed to have at least one element.
// Hint: use a tuple rest type: [T, ...T[]]

export type NonEmptyArray<T> = never; // replace `never`

// ---------------------------------------------------------------------------
// TODO 4 — ContactBook type
// ---------------------------------------------------------------------------
// Define a type alias `ContactBook` as a ReadonlyMap<string, Contact>
// where the key is the contact's `id`.

export type ContactBook = never; // replace `never`

// ---------------------------------------------------------------------------
// TODO 5 — buildContactBook
// ---------------------------------------------------------------------------
// Implement `buildContactBook(contacts: NonEmptyArray<Contact>): ContactBook`
//
// Requirements:
//   • Accept a NonEmptyArray<Contact> (your type from TODO 3).
//   • Return a ReadonlyMap keyed by contact id.
//   • Duplicate ids should keep the LAST entry in the array.

export function buildContactBook(contacts: NonEmptyArray<Contact>): ContactBook {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// TODO 6 — searchContacts
// ---------------------------------------------------------------------------
// Implement `searchContacts(book: ContactBook, query: string): Contact[]`
//
// Requirements:
//   • `query` is matched case-insensitively against the FULL name
//     (firstName + " " + lastName).
//   • Return every matching Contact sorted alphabetically by lastName,
//     then firstName (ascending).
//   • Return an empty array when nothing matches.

export function searchContacts(book: ContactBook, query: string): Contact[] {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// TODO 7 — GroupedContacts mapped type
// ---------------------------------------------------------------------------
// Define a type alias `GroupedContacts` as:
//   Record<string, Contact[]>
// where the key is a single uppercase letter (A–Z) or "#" for non-alpha.
// (The type alias itself is just Record<string, Contact[]> — the letter
//  constraint is enforced by the runtime logic below, not the type system.)

export type GroupedContacts = never; // replace `never`

// ---------------------------------------------------------------------------
// TODO 8 — groupByFirstLetter
// ---------------------------------------------------------------------------
// Implement `groupByFirstLetter(contacts: Contact[]): GroupedContacts`
//
// Requirements:
//   • Group contacts by the FIRST letter of lastName (uppercase).
//   • If the first character is not A–Z, use the key "#".
//   • Within each group, preserve the original order.
//   • Return an object whose keys are only those letters actually present
//     (no empty arrays).

export function groupByFirstLetter(contacts: Contact[]): GroupedContacts {
  // TODO: implement
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// TODO 9 — formatChannel (exhaustive discriminated-union handler)
// ---------------------------------------------------------------------------
// Implement `formatChannel(channel: ContactChannel): string`
//
// Requirements:
//   • For kind "phone"  → return "📞 <number>"
//   • For kind "email"  → return "✉️  <address>"
//   • The compiler must prove the switch is exhaustive (use a `never` check).

export function formatChannel(channel: ContactChannel): string {
  // TODO: implement (exhaustive switch)
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// TODO 10 — formatContact
// ---------------------------------------------------------------------------
// Implement `formatContact(contact: Contact): string`
//
// Requirements:
//   • First line  : "<lastName>, <firstName>"
//   • Subsequent lines: one formatted channel per line (use formatChannel).
//   • If tags is non-empty, append a final line: "  Tags: tag1, tag2, ..."
//   • Lines are joined with "\n".
//
// Example output:
//   "Smith, Jane\n📞 555-0100\n✉️  jane@example.com\n  Tags: vip, partner"

export function formatContact(contact: Contact): string {
  // TODO: implement
  throw new Error("Not implemented");
}
