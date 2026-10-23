// challenge.test.ts
import {
  Contact,
  ContactSortField,
  ContactSummary,
  GroupedContacts,
  toSummary,
  sortContacts,
  groupBySource,
  searchContacts,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

const contacts: Contact[] = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Zhao",
    email: "alice@example.com",
    phone: "+1-555-0101",
    source: "manual",
    tags: ["friend", "work"],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    firstName: "Bob",
    lastName: "Anderson",
    email: "bob@example.com",
    phone: null,
    source: "email",
    tags: ["work"],
    createdAt: new Date("2024-03-10"),
  },
  {
    id: "3",
    firstName: "Carol",
    lastName: "Anderson",
    email: "carol@phone.com",
    phone: "+1-555-0303",
    source: "phone",
    tags: [],
    createdAt: new Date("2023-11-01"),
  },
  {
    id: "4",
    firstName: "Dave",
    lastName: "Zhao",
    email: "dave@example.com",
    phone: null,
    source: "manual",
    tags: ["family"],
    createdAt: new Date("2024-06-20"),
  },
  {
    id: "5",
    firstName: "Eve",
    lastName: "Miller",
    email: "eve@email.com",
    phone: "+1-555-0505",
    source: "email",
    tags: ["friend"],
    createdAt: new Date("2024-02-28"),
  },
];

// ── Test 1: toSummary ─────────────────────────────────────────
const summary: ContactSummary = toSummary(contacts[0]);
console.assert(
  summary.displayName === "Alice Zhao",
  `[toSummary] displayName should be "Alice Zhao", got "${summary.displayName}"`
);
console.assert(
  !("tags" in summary),
  "[toSummary] ContactSummary must NOT contain 'tags'"
);
console.assert(
  !("phone" in summary),
  "[toSummary] ContactSummary must NOT contain 'phone'"
);
console.assert(
  summary.source === "manual",
  "[toSummary] source should be preserved"
);

// ── Test 2: sortContacts ──────────────────────────────────────
const sortedByLastName = sortContacts(contacts, "lastName");
console.assert(
  sortedByLastName[0].lastName === "Anderson" &&
    sortedByLastName[1].lastName === "Anderson",
  "[sortContacts] First two contacts should have lastName 'Anderson'"
);
// Ensure original array is not mutated
console.assert(
  contacts[0].firstName === "Alice",
  "[sortContacts] Original array must not be mutated"
);

const sortedByDate = sortContacts(contacts, "createdAt");
console.assert(
  sortedByDate[0].id === "3",
  `[sortContacts] Oldest contact (id=3) should be first, got id=${sortedByDate[0].id}`
);

// ── Test 3: groupBySource ─────────────────────────────────────
const grouped: GroupedContacts = groupBySource(contacts);
console.assert(
  grouped.manual.length === 2,
  `[groupBySource] 'manual' group should have 2 contacts, got ${grouped.manual.length}`
);
console.assert(
  grouped.email.length === 2,
  `[groupBySource] 'email' group should have 2 contacts, got ${grouped.email.length}`
);
console.assert(
  grouped.phone.length === 1,
  `[groupBySource] 'phone' group should have 1 contact, got ${grouped.phone.length}`
);
console.assert(
  "displayName" in grouped.manual[0],
  "[groupBySource] Items in grouped result must be ContactSummary (have displayName)"
);

// ── Test 4: searchContacts ────────────────────────────────────
const byEmail = searchContacts(contacts, "example.com", ["email"]);
console.assert(
  byEmail.length === 3,
  `[searchContacts] Should find 3 contacts with 'example.com' in email, got ${byEmail.length}`
);

const byName = searchContacts(contacts, "anderson", ["firstName", "lastName"]);
console.assert(
  byName.length === 2,
  `[searchContacts] Should find 2 contacts with 'anderson' in name fields, got ${byName.length}`
);

const emptyQuery = searchContacts(contacts, "", ["email"]);
console.assert(
  emptyQuery.length === contacts.length,
  "[searchContacts] Empty query should return all contacts"
);

console.log("All tests passed! ✅");
