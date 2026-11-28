// ============================================================
// Typed Contact Book: Search, Tag Filtering & vCard Export
// ============================================================
// REQUIREMENTS (implement every numbered item):
//
// 1. Define a `PhoneType` union: "mobile" | "home" | "work"
// 2. Define a `PhoneEntry` type with fields: number (string) and type (PhoneType)
// 3. Define a `ContactTag` union: "family" | "friend" | "colleague" | "vip" | "other"
// 4. Define a `Contact` interface with the following fields:
//      - id:        string
//      - firstName: string
//      - lastName:  string
//      - email:     string
//      - phones:    readonly PhoneEntry[]
//      - tags:      readonly ContactTag[]
//      - birthday?: string   (ISO date, e.g. "1990-04-22")
//      - company?:  string
// 5. Define a `SearchQuery` type with ALL fields optional:
//      - nameQuery?:  string  (case-insensitive match against firstName OR lastName)
//      - emailQuery?: string  (case-insensitive substring match)
//      - tags?:       readonly ContactTag[]  (contact must have ALL listed tags)
// 6. Implement `searchContacts`:
//      - Accepts a readonly array of Contact and a SearchQuery
//      - Returns Contact[] matching ALL provided criteria (ignore undefined criteria)
//      - Name match: either firstName or lastName contains nameQuery (case-insensitive)
//      - Email match: email contains emailQuery (case-insensitive)
//      - Tag match: contact's tags include every tag in the query's tags array
// 7. Define a `VCardField` mapped type that maps each key of Contact to string
//      (i.e. Record<keyof Contact, string>) — use a mapped type, not Record directly
// 8. Implement `formatVCard`:
//      - Accepts a single Contact
//      - Returns a formatted vCard 3.0 string with the following lines (in order):
//          BEGIN:VCARD
//          VERSION:3.0
//          N:<lastName>;<firstName>
//          FN:<firstName> <lastName>
//          EMAIL:<email>
//          TEL;TYPE=<phoneType>:<phoneNumber>   ← one line per phone entry
//          ORG:<company>                         ← only if company is defined
//          BDAY:<birthday>                       ← only if birthday is defined
//          END:VCARD
//      - Each line must be separated by "\n"
// 9. Implement `groupByTag`:
//      - Accepts a readonly array of Contact
//      - Returns a Record<ContactTag, Contact[]> where each key holds contacts
//        that include that tag (a contact appears under every tag it has)
//      - Every ContactTag key must be present in the result (empty array if none)

// ----- Type Definitions -----

export type PhoneType = TODO; // requirement 1

export type PhoneEntry = TODO; // requirement 2

export type ContactTag = TODO; // requirement 3

export interface Contact {
  // requirement 4 — fill in all fields
}

export type SearchQuery = TODO; // requirement 5

// Requirement 7: mapped type over Contact keys → string
export type VCardField = TODO;

// ----- Functions -----

// Requirement 6
export function searchContacts(
  contacts: readonly Contact[],
  query: SearchQuery
): Contact[] {
  // TODO
  throw new Error("Not implemented");
}

// Requirement 8
export function formatVCard(contact: Contact): string {
  // TODO
  throw new Error("Not implemented");
}

// Requirement 9
export function groupByTag(
  contacts: readonly Contact[]
): Record<ContactTag, Contact[]> {
  // TODO
  throw new Error("Not implemented");
}
