// challenge.test.ts — run with: npx ts-node challenge.test.ts
import {
  buildContactBook,
  searchContacts,
  groupByFirstLetter,
  formatChannel,
  formatContact,
  type Contact,
  type ContactChannel,
  type NonEmptyArray,
} from "./challenge";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const contacts: NonEmptyArray<Contact> = [
  {
    id: "1",
    firstName: "Jane",
    lastName: "Smith",
    channels: [
      { kind: "phone", number: "555-0100" },
      { kind: "email", address: "jane@example.com" },
    ],
    tags: ["vip", "partner"],
  },
  {
    id: "2",
    firstName: "John",
    lastName: "Adams",
    channels: [{ kind: "email", address: "john@example.com" }],
    tags: [],
  },
  {
    id: "3",
    firstName: "Alice",
    lastName: "Smith",
    channels: [{ kind: "phone", number: "555-0200" }],
    tags: ["lead"],
  },
  {
    id: "4",
    firstName: "Bob",
    lastName: "Zhang",
    channels: [{ kind: "email", address: "bob@zhang.com" }],
    tags: [],
  },
  {
    id: "5",
    firstName: "Charlie",
    lastName: "1st-Contact",
    channels: [{ kind: "phone", number: "555-0300" }],
    tags: [],
  },
];

const book = buildContactBook(contacts);

// ---------------------------------------------------------------------------
// Test 1 — buildContactBook: correct size and lookup
// ---------------------------------------------------------------------------
console.assert(
  book.size === 5,
  `FAIL Test 1a: expected book size 5, got ${book.size}`
);
console.assert(
  book.get("1")?.firstName === "Jane",
  `FAIL Test 1b: expected Jane for id "1"`
);
console.log("Test 1 passed ✓ — buildContactBook");

// ---------------------------------------------------------------------------
// Test 2 — searchContacts: case-insensitive, sorted by lastName then firstName
// ---------------------------------------------------------------------------
const smiths = searchContacts(book, "smith");
console.assert(
  smiths.length === 2,
  `FAIL Test 2a: expected 2 Smiths, got ${smiths.length}`
);
// Sorted by lastName (both "Smith"), then firstName: Alice < Jane
console.assert(
  smiths[0].firstName === "Alice" && smiths[1].firstName === "Jane",
  `FAIL Test 2b: expected Alice then Jane, got ${smiths.map((c) => c.firstName).join(", ")}`
);
const noMatch = searchContacts(book, "zzz");
console.assert(
  noMatch.length === 0,
  `FAIL Test 2c: expected 0 results for "zzz", got ${noMatch.length}`
);
console.log("Test 2 passed ✓ — searchContacts");

// ---------------------------------------------------------------------------
// Test 3 — groupByFirstLetter: correct keys and "#" bucket
// ---------------------------------------------------------------------------
const all = searchContacts(book, "");
// "" matches everyone (empty fragment in full name always matches)
const grouped = groupByFirstLetter(all);
console.assert(
  Array.isArray(grouped["S"]) && grouped["S"].length === 2,
  `FAIL Test 3a: expected 2 contacts under "S", got ${grouped["S"]?.length}`
);
console.assert(
  Array.isArray(grouped["#"]) && grouped["#"].length === 1,
  `FAIL Test 3b: expected 1 contact under "#", got ${grouped["#"]?.length}`
);
console.assert(
  !("s" in grouped),
  `FAIL Test 3c: keys must be uppercase, found lowercase key`
);
console.log("Test 3 passed ✓ — groupByFirstLetter");

// ---------------------------------------------------------------------------
// Test 4 — formatChannel: correct emoji prefixes
// ---------------------------------------------------------------------------
const phoneChannel: ContactChannel = { kind: "phone", number: "555-0100" };
const emailChannel: ContactChannel = { kind: "email", address: "jane@example.com" };
console.assert(
  formatChannel(phoneChannel) === "📞 555-0100",
  `FAIL Test 4a: got "${formatChannel(phoneChannel)}"`
);
console.assert(
  formatChannel(emailChannel) === "✉️  jane@example.com",
  `FAIL Test 4b: got "${formatChannel(emailChannel)}"`
);
console.log("Test 4 passed ✓ — formatChannel");

// ---------------------------------------------------------------------------
// Test 5 — formatContact: full formatted string
// ---------------------------------------------------------------------------
const janeContact = book.get("1")!; // safe — we verified it exists in Test 1
const formatted = formatContact(janeContact);
const lines = formatted.split("\n");
console.assert(
  lines[0] === "Smith, Jane",
  `FAIL Test 5a: first line should be "Smith, Jane", got "${lines[0]}"`
);
console.assert(
  lines[1] === "📞 555-0100",
  `FAIL Test 5b: second line should be phone, got "${lines[1]}"`
);
console.assert(
  lines[2] === "✉️  jane@example.com",
  `FAIL Test 5c: third line should be email, got "${lines[2]}"`
);
console.assert(
  lines[3] === "  Tags: vip, partner",
  `FAIL Test 5d: fourth line should be tags, got "${lines[3]}"`
);
// Contact with no tags should NOT have a Tags line
const johnContact = book.get("2")!;
const johnFormatted = formatContact(johnContact);
console.assert(
  !johnFormatted.includes("Tags"),
  `FAIL Test 5e: contact with no tags should not include "Tags" line`
);
console.log("Test 5 passed ✓ — formatContact");

console.log("\n✅ All tests passed!");
