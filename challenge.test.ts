// ============================================================
// challenge.test.ts  — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  Contact,
  ContactGroup,
  ContactId,
  toContactId,
  searchContacts,
  getContactById,
  groupContacts,
  pickContactFields,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

const contacts: Contact[] = [
  {
    id: toContactId("c1"),
    fullName: "Alice Nguyen",
    group: "work",
    email: "alice@corp.com",
    phones: [{ label: "mobile", number: "555-0101" }],
    tags: ["vip", "newsletter"],
  },
  {
    id: toContactId("c2"),
    fullName: "Bob Martínez",
    group: "friend",
    email: null,
    phones: [{ label: "home", number: "555-0102" }],
    tags: ["newsletter"],
  },
  {
    id: toContactId("c3"),
    fullName: "Carol Smith",
    group: "family",
    email: "carol@home.net",
    phones: [],
    tags: ["vip"],
  },
  {
    id: toContactId("c4"),
    fullName: "David Lee",
    group: "work",
    email: "david@corp.com",
    phones: [{ label: "work", number: "555-0104" }],
    tags: [],
  },
  {
    id: toContactId("c5"),
    fullName: "Eva Kowalski",
    group: "acquaintance",
    email: null,
    phones: [{ label: "mobile", number: "555-0105" }],
    tags: ["newsletter", "vip"],
  },
];

// ── Test 1: searchContacts — filter by group ──────────────────
const workContacts = searchContacts(contacts, { group: "work" });
console.assert(
  workContacts.length === 2,
  `Test 1 FAILED: expected 2 work contacts, got ${workContacts.length}`
);
console.assert(
  workContacts.every((c) => c.group === "work"),
  "Test 1 FAILED: non-work contact slipped through"
);
console.log("Test 1 passed — filter by group");

// ── Test 2: searchContacts — filter by tag ────────────────────
const vipContacts = searchContacts(contacts, { tag: "vip" });
console.assert(
  vipContacts.length === 3,
  `Test 2 FAILED: expected 3 vip contacts, got ${vipContacts.length}`
);
console.log("Test 2 passed — filter by tag");

// ── Test 3: searchContacts — combined filters ─────────────────
const workVip = searchContacts(contacts, { group: "work", tag: "vip" });
console.assert(
  workVip.length === 1 && workVip[0].fullName === "Alice Nguyen",
  `Test 3 FAILED: expected only Alice, got ${workVip.map((c) => c.fullName).join(", ")}`
);
console.log("Test 3 passed — combined group + tag filter");

// ── Test 4: searchContacts — hasEmail filter ──────────────────
const noEmail = searchContacts(contacts, { hasEmail: false });
console.assert(
  noEmail.length === 2,
  `Test 4 FAILED: expected 2 contacts without email, got ${noEmail.length}`
);
const withEmail = searchContacts(contacts, { hasEmail: true });
console.assert(
  withEmail.length === 3,
  `Test 4b FAILED: expected 3 contacts with email, got ${withEmail.length}`
);
console.log("Test 4 passed — hasEmail filter");

// ── Test 5: getContactById ────────────────────────────────────
const found = getContactById(contacts, toContactId("c3"));
console.assert(
  found !== null && found.fullName === "Carol Smith",
  `Test 5 FAILED: expected Carol Smith, got ${found?.fullName ?? "null"}`
);
const notFound = getContactById(contacts, toContactId("c99"));
console.assert(
  notFound === null,
  "Test 5b FAILED: expected null for unknown id"
);
console.log("Test 5 passed — getContactById");

// ── Test 6: groupContacts ─────────────────────────────────────
const grouped = groupContacts(contacts);
const allGroups: ContactGroup[] = ["family", "work", "friend", "acquaintance"];
console.assert(
  allGroups.every((g) => Array.isArray(grouped[g])),
  "Test 6 FAILED: not all groups present in result"
);
console.assert(
  grouped.work.length === 2,
  `Test 6 FAILED: expected 2 work contacts, got ${grouped.work.length}`
);
console.assert(
  grouped.acquaintance.length === 1,
  `Test 6 FAILED: expected 1 acquaintance, got ${grouped.acquaintance.length}`
);
console.log("Test 6 passed — groupContacts");

// ── Test 7: pickContactFields (bonus) ─────────────────────────
const slim = pickContactFields(contacts, ["fullName", "email"] as const);
console.assert(
  slim.length === contacts.length,
  "Test 7 FAILED: result length mismatch"
);
console.assert(
  slim[0].fullName === "Alice Nguyen" && "id" in slim[0] === false,
  "Test 7 FAILED: unexpected keys in picked result"
);
console.log("Test 7 passed — pickContactFields");

console.log("\n✅ All tests passed!");
