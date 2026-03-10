// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  isContactSource,
  parseRawContact,
  mergeContacts,
  Contact,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ── isContactSource ──────────────────────────────────────────
assert(isContactSource("phone"),    'isContactSource("phone") → true');
assert(isContactSource("email"),    'isContactSource("email") → true');
assert(isContactSource("linkedin"), 'isContactSource("linkedin") → true');
assert(!isContactSource("twitter"), 'isContactSource("twitter") → false');
assert(!isContactSource(42),        'isContactSource(42) → false');
assert(!isContactSource(null),      'isContactSource(null) → false');

// ── parseRawContact — happy path ─────────────────────────────
const validRaw = {
  email: "  Alice@Example.COM  ",
  name: "  Alice Smith  ",
  phone: "  555-1234  ",
  source: "email",
};
const parsed = parseRawContact(validRaw);
assert(parsed.ok === true, "parseRawContact: valid record → ok:true");
if (parsed.ok) {
  assert(parsed.value.email === "alice@example.com", "email is lowercased + trimmed");
  assert(parsed.value.name === "Alice Smith",        "name is trimmed");
  assert(parsed.value.phone === "555-1234",          "phone is trimmed");
  assert(
    JSON.stringify(parsed.value.sources) === JSON.stringify(["email"]),
    "sources contains the single source"
  );
}

// ── parseRawContact — null phone ─────────────────────────────
const nullPhoneRaw = { email: "bob@example.com", name: "Bob", phone: null, source: "phone" };
const parsedNull = parseRawContact(nullPhoneRaw);
assert(parsedNull.ok === true && parsedNull.value.phone === null, "null phone is preserved");

// ── parseRawContact — failures ───────────────────────────────
const missingEmail = parseRawContact({ name: "No Email", source: "phone" });
assert(missingEmail.ok === false, "missing email → ok:false");

const badSource = parseRawContact({ email: "x@x.com", name: "X", source: "fax", phone: null });
assert(badSource.ok === false, "invalid source → ok:false");

const badPhone = parseRawContact({ email: "y@y.com", name: "Y", source: "phone", phone: 12345 });
assert(badPhone.ok === false, "numeric phone → ok:false");

// ── mergeContacts ─────────────────────────────────────────────
const rawRecords: unknown[] = [
  // First occurrence of alice — has phone
  { email: "alice@example.com", name: "Alice",   phone: "555-0001", source: "phone"    },
  // Duplicate alice — different source, no phone (should keep first phone)
  { email: "alice@example.com", name: "Alice A", phone: null,       source: "linkedin" },
  // Bob — only occurrence
  { email: "bob@example.com",   name: "Bob",     phone: null,       source: "email"    },
  // Duplicate bob — provides a phone (first was null, so take this one)
  { email: "bob@example.com",   name: "Bob B",   phone: "555-0002", source: "phone"    },
  // Invalid record
  { email: "",                  name: "Bad",      phone: null,       source: "email"    },
];

const { contacts, failures } = mergeContacts(rawRecords);

assert(contacts.length === 2, "mergeContacts: 2 unique contacts");
assert(failures.length === 1, "mergeContacts: 1 failure");

const alice = contacts.find((c: Contact) => c.email === "alice@example.com");
assert(alice !== undefined,                         "alice is in merged contacts");
assert(alice?.phone === "555-0001",                 "alice keeps first non-null phone");
assert(alice?.name === "Alice",                     "alice keeps first-seen name");
assert(alice?.sources.includes("phone"),            "alice sources includes phone");
assert(alice?.sources.includes("linkedin"),         "alice sources includes linkedin");
assert(alice?.sources.length === 2,                 "alice has exactly 2 sources");

const bob = contacts.find((c: Contact) => c.email === "bob@example.com");
assert(bob !== undefined,            "bob is in merged contacts");
assert(bob?.phone === "555-0002",    "bob picks up phone from second record (first was null)");
assert(bob?.name === "Bob",          "bob keeps first-seen name");
assert(bob?.sources.length === 2,    "bob has exactly 2 sources");

assert(failures[0]?.ok === false, "failure entry has ok:false");
