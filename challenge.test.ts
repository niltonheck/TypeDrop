// challenge.test.ts
import { validateContact, searchContacts, groupByCategory, summarizeGroup } from "./challenge";

// ── Helpers ──────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

// ── Mock Raw Data ─────────────────────────────────────────────

const rawAlice = {
  id: "c-001",
  firstName: "  Alice  ",
  lastName: "Smith",
  email: "  Alice.Smith@Example.COM  ",
  phones: [
    { type: "mobile", digits: "+1 (415) 555-2671" },
    { type: "work",   digits: "650-555-0199" },
  ],
  group: "colleague",
  country: "US",
};

const rawBob = {
  id: "c-002",
  firstName: "Bob",
  lastName: "Jones",
  email: "bob@example.com",
  phones: [{ type: "home", digits: "2025550142" }],
  group: "friend",
  country: "GB",
};

const rawInvalid = {
  id: "",                  // bad: empty
  firstName: 42,           // bad: not a string
  lastName: "  ",          // bad: whitespace-only → empty after trim
  email: "not-an-email",   // bad: no "@"
  phones: [{ type: "fax", digits: "555" }], // bad: invalid type
  group: "enemy",          // bad: not a valid group
  country: "USA",          // bad: not 2 letters
};

// ── Test Suite ────────────────────────────────────────────────

console.log("\n── validateContact ──");

const resultAlice = validateContact(rawAlice);
assert(resultAlice.ok === true, "rawAlice should pass validation");
if (resultAlice.ok) {
  assert(
    resultAlice.contact.email === "alice.smith@example.com",
    "email is lowercased and trimmed"
  );
  assert(
    resultAlice.contact.fullName === "Alice Smith",
    "fullName is derived and trimmed"
  );
  assert(
    resultAlice.contact.phones.every(p => /^\d+$/.test(p.digits)),
    "phone digits contain only digits after normalization"
  );
  assert(
    resultAlice.contact.phones[0].digits === "14155552671",
    "first phone digits stripped correctly"
  );
}

const resultInvalid = validateContact(rawInvalid);
assert(resultInvalid.ok === false, "rawInvalid should fail validation");
if (!resultInvalid.ok) {
  assert(
    resultInvalid.errors.length >= 5,
    `collected all errors (got ${resultInvalid.errors.length}, expected ≥ 5)`
  );
}

console.log("\n── searchContacts ──");

const resultBob = validateContact(rawBob);
const contacts = [
  ...(resultAlice.ok ? [resultAlice.contact] : []),
  ...(resultBob.ok   ? [resultBob.contact]   : []),
];

const found = searchContacts(contacts, { field: "email", term: "example" });
assert(found.length === 2, "both contacts match 'example' in email");

const foundAlice = searchContacts(contacts, { field: "fullName", term: "alice" });
assert(foundAlice.length === 1 && foundAlice[0].id === "c-001", "case-insensitive fullName search finds Alice");

const foundNone = searchContacts(contacts, { field: "group", term: "family" });
assert(foundNone.length === 0, "no contacts in family group");

console.log("\n── groupByCategory ──");

const grouped = groupByCategory(contacts);
assert(Array.isArray(grouped.colleague) && grouped.colleague.length === 1, "colleague group has Alice");
assert(Array.isArray(grouped.friend)    && grouped.friend.length === 1,    "friend group has Bob");
assert(Array.isArray(grouped.family)    && grouped.family.length === 0,    "family group is empty array");
assert(Array.isArray(grouped.acquaintance) && grouped.acquaintance.length === 0, "acquaintance group is empty array");

console.log("\n── summarizeGroup ──");

const summary = summarizeGroup("colleague", grouped.colleague);
assert(summary === "Colleague (1): Alice Smith", `colleague summary correct (got: "${summary}")`);

const emptySummary = summarizeGroup("family", grouped.family);
assert(emptySummary === "Family (0): (none)", `empty group summary correct (got: "${emptySummary}")`);

console.log("\nDone.\n");
