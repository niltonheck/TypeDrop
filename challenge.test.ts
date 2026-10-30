// ============================================================
// challenge.test.ts
// ============================================================
import {
  normalizePhone,
  mergeContacts,
  liftContact,
  buildDirectory,
  type RawContact,
  type MergedContact,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const internalContacts: RawContact[] = [
  { source: "internal", name: "Alice Nguyen",  email: "alice@example.com", phone: "(555) 100-2000", accountId: 1 },
  { source: "internal", name: "Bob Smith",     email: "bob@example.com",   phone: "5552003000",     accountId: 2 },
  { source: "internal", name: "Carol Ray",     email: "carol@example.com",                          accountId: 3 },
];

const csvContacts: RawContact[] = [
  { source: "csv", name: "Alice N.",       email: "alice@example.com", phone: "555-100-2000", company: "Acme" },
  { source: "csv", name: "Diana Prince",   email: "diana@example.com", phone: "15559004000",  company: "Wayne Ent." },
  { source: "csv", name: "Carol Raymond",  email: "carol@example.com",                        company: "Stark Ltd." },
];

const allContacts: RawContact[] = [...internalContacts, ...csvContacts];

// ------------------------------------------------------------------
// Test 1 — normalizePhone
// ------------------------------------------------------------------
console.assert(
  normalizePhone("(555) 100-2000") === "+15551002000",
  "FAIL T1a: 10-digit with punctuation should normalize to +1XXXXXXXXXX"
);
console.assert(
  normalizePhone("15559004000") === "+15559004000",
  "FAIL T1b: 11-digit starting with 1 should normalize to +1XXXXXXXXXX"
);
console.assert(
  normalizePhone("123") === null,
  "FAIL T1c: unrecognizable length should return null"
);
console.assert(
  normalizePhone("5552003000") === "+15552003000",
  "FAIL T1d: plain 10-digit string should normalize"
);

// ------------------------------------------------------------------
// Test 2 — liftContact (no merge partner)
// ------------------------------------------------------------------
const lifted: MergedContact = liftContact(internalContacts[2]); // Carol Ray, no phone
console.assert(
  lifted.name === "Carol Ray",
  "FAIL T2a: name should be preserved"
);
console.assert(
  lifted.phone === null,
  "FAIL T2b: missing phone should be null"
);
console.assert(
  lifted.completeness === "partial",
  "FAIL T2c: accountId present but no phone/company → partial"
);
console.assert(
  lifted.sources.length === 1 && lifted.sources[0] === "internal",
  "FAIL T2d: sources should contain only 'internal'"
);

// ------------------------------------------------------------------
// Test 3 — mergeContacts
// ------------------------------------------------------------------
const merged: MergedContact = mergeContacts(internalContacts[0], csvContacts[0]); // Alice
console.assert(
  merged.name === "Alice Nguyen",
  "FAIL T3a: internal name should be preferred"
);
console.assert(
  merged.company === "Acme",
  "FAIL T3b: company should come from csv source"
);
console.assert(
  merged.accountId === 1,
  "FAIL T3c: accountId should come from internal source"
);
console.assert(
  merged.completeness === "full",
  "FAIL T3d: phone + accountId + company all present → full"
);
console.assert(
  merged.sources[0] === "internal" && merged.sources[1] === "csv",
  "FAIL T3e: sources order should be internal first"
);

// ------------------------------------------------------------------
// Test 4 — buildDirectory
// ------------------------------------------------------------------
const { directory, summary } = buildDirectory(allContacts);

console.assert(
  directory.size === 4,
  "FAIL T4a: 4 unique emails → 4 entries in directory"
);
console.assert(
  summary.totalContacts === 4,
  "FAIL T4b: totalContacts should be 4"
);
console.assert(
  summary.mergedEmails.length === 2,
  "FAIL T4c: alice and carol appear in both sources → 2 mergedEmails"
);
console.assert(
  summary.mergedEmails[0] === "alice@example.com" &&
  summary.mergedEmails[1] === "carol@example.com",
  "FAIL T4d: mergedEmails should be sorted A→Z"
);
console.assert(
  summary.bySource["internal"] === 3 && summary.bySource["csv"] === 3,
  "FAIL T4e: alice+bob+carol from internal (3), alice+diana+carol from csv (3)"
);
console.assert(
  summary.byCompleteness["full"] === 1,
  "FAIL T4f: only Alice is 'full' (phone + accountId + company)"
);

// ------------------------------------------------------------------
// Test 5 — duplicate within same source throws
// ------------------------------------------------------------------
let threw = false;
try {
  buildDirectory([
    { source: "internal", name: "Dup A", email: "dup@example.com", accountId: 10 },
    { source: "internal", name: "Dup B", email: "dup@example.com", accountId: 11 },
  ]);
} catch (e) {
  threw = true;
}
console.assert(threw, "FAIL T5: duplicate email within same source should throw");

console.log("All assertions passed ✅");
