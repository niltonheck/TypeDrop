// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  Contact,
  GroupLabel,
  groupContacts,
  searchContacts,
  exportVCard,
  mergeContacts,
} from "./challenge";

// ── Mock Data ─────────────────────────────────────────────────

const alice: Contact = {
  id: "c1",
  firstName: "Alice",
  lastName: "Anderson",
  email: "alice@example.com",
  phones: [
    { type: "mobile", number: "+1-555-0101" },
    { type: "work",   number: "+1-555-0102" },
  ],
  groups: ["work", "friend"],
  birthday: "1990-04-23",
};

const bob: Contact = {
  id: "c2",
  firstName: "Bob",
  lastName: "Baker",
  email: "bob@work.org",
  phones: [{ type: "home", number: "+1-555-0200" }],
  groups: ["family"],
};

const carol: Contact = {
  id: "c3",
  firstName: "Carol",
  lastName: "Chen",
  email: "carol@friend.net",
  phones: [],
  groups: [], // should land in "other"
};

const dave: Contact = {
  id: "c4",
  firstName: "Dave",
  lastName: "Davidson",
  email: "dave@work.org",
  phones: [{ type: "mobile", number: "+1-555-0400" }],
  groups: ["work"],
};

const contacts: Contact[] = [alice, bob, carol, dave];

// ── Test 1: groupContacts ─────────────────────────────────────

const grouped = groupContacts(contacts);

// 1a — all four keys present
const allLabels: GroupLabel[] = ["family", "work", "friend", "other"];
console.assert(
  allLabels.every((label) => label in grouped),
  "FAIL 1a: all GroupLabel keys must be present"
);

// 1b — alice appears in both "work" AND "friend"
console.assert(
  grouped.work.some((c) => c.id === "c1") &&
    grouped.friend.some((c) => c.id === "c1"),
  "FAIL 1b: alice should appear in both 'work' and 'friend'"
);

// 1c — carol (empty groups) lands in "other"
console.assert(
  grouped.other.some((c) => c.id === "c3"),
  "FAIL 1c: carol (empty groups) should be in 'other'"
);

// ── Test 2: searchContacts ────────────────────────────────────

// 2a/2b — case-insensitive substring on name
const resultAlice = searchContacts(contacts, "alice");
console.assert(
  resultAlice.length === 1 && resultAlice[0].id === "c1",
  "FAIL 2a/2b: searching 'alice' should return only Alice"
);

// 2a — match on email domain
const workResults = searchContacts(contacts, "work.org");
console.assert(
  workResults.length === 2 &&
    workResults.every((c) => c.email.includes("work.org")),
  "FAIL 2a: searching 'work.org' should return Bob and Dave"
);

// 2e — empty query returns all
const allResults = searchContacts(contacts, "");
console.assert(
  allResults.length === contacts.length,
  "FAIL 2e: empty query should return all contacts"
);

// 2c — result contains only ContactSummary fields
const summaryKeys = new Set(Object.keys(resultAlice[0]));
console.assert(
  summaryKeys.has("id") &&
    summaryKeys.has("firstName") &&
    summaryKeys.has("lastName") &&
    summaryKeys.has("email") &&
    !summaryKeys.has("phones") &&
    !summaryKeys.has("groups"),
  "FAIL 2c: search result must be ContactSummary (no phones/groups)"
);

// ── Test 3: exportVCard ───────────────────────────────────────

const vcard = exportVCard(alice);

console.assert(
  vcard.startsWith("BEGIN:VCARD\nVERSION:3.0\n"),
  "FAIL 3a: vCard must start with BEGIN:VCARD\\nVERSION:3.0\\n"
);
console.assert(vcard.endsWith("END:VCARD"), "FAIL 3a: vCard must end with END:VCARD");
console.assert(vcard.includes("FN:Alice Anderson"), "FAIL 3b: FN line missing or wrong");
console.assert(vcard.includes("EMAIL:alice@example.com"), "FAIL 3c: EMAIL line missing");
console.assert(
  vcard.includes("TEL;TYPE=MOBILE:+1-555-0101"),
  "FAIL 3d: TEL MOBILE line missing or not uppercased"
);
console.assert(
  vcard.includes("TEL;TYPE=WORK:+1-555-0102"),
  "FAIL 3d: TEL WORK line missing"
);
console.assert(vcard.includes("BDAY:1990-04-23"), "FAIL 3e: BDAY line missing");

// ── Test 4: mergeContacts ─────────────────────────────────────

const overrideAlice: Contact = {
  id: "c99",                       // should be ignored (keep c1)
  firstName: "",                   // empty → fall back to "Alice"
  lastName: "Anderson-Smith",      // non-empty → use this
  email: "alice@newdomain.com",    // non-empty → use this
  phones: [{ type: "home", number: "+1-555-9999" }],
  groups: ["family", "friend"],    // "friend" already in base → deduplicated
};

const merged = mergeContacts(alice, overrideAlice);

console.assert(merged.id === "c1", "FAIL 4a: merged id must be base id");
console.assert(merged.firstName === "Alice", "FAIL 4b: empty override firstName should fall back");
console.assert(merged.lastName === "Anderson-Smith", "FAIL 4b: non-empty override lastName should win");
console.assert(merged.email === "alice@newdomain.com", "FAIL 4b: non-empty override email should win");
console.assert(merged.phones.length === 3, "FAIL 4c: phones should be union of both arrays");
console.assert(
  merged.groups.length === 3 &&
    merged.groups.includes("work") &&
    merged.groups.includes("friend") &&
    merged.groups.includes("family"),
  "FAIL 4d: groups should be de-duplicated union"
);

console.log("All tests passed! ✅");
