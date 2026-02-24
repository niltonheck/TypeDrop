// challenge.test.ts
import { buildIndex, summarise, filterContacts } from "./challenge";
import type { Contact, ContactIndex, ContactSummary, SearchFilters } from "./challenge";

// ── Mock data ──────────────────────────────────────────────────────────────

const contacts: Contact[] = [
  {
    id: "c1",
    name: "Alice Nguyen",
    email: "alice@corp.com",
    department: "engineering",
    seniority: "senior",
    phone: "555-0101",
    tags: ["remote", "typescript"],
  },
  {
    id: "c2",
    name: "Bob Marsh",
    email: "bob@corp.com",
    department: "design",
    seniority: "mid",
    tags: ["remote"],
  },
  {
    id: "c3",
    name: "Carol Lin",
    email: "carol@corp.com",
    department: "engineering",
    seniority: "lead",
    phone: "555-0303",
    tags: ["typescript", "on-site"],
  },
  {
    id: "c4",
    name: "Dave Kim",
    email: "dave@corp.com",
    department: "hr",
    seniority: "manager",
  },
];

// ── Test 1: buildIndex keys by id ─────────────────────────────────────────

const index: ContactIndex = buildIndex(contacts);

console.assert(
  index["c1"] !== undefined && index["c1"].name === "Alice Nguyen",
  '❌ Test 1a failed: index["c1"] should be Alice Nguyen'
);
console.assert(
  index["c4"] !== undefined && index["c4"].department === "hr",
  '❌ Test 1b failed: index["c4"] should have department "hr"'
);
console.assert(
  Object.keys(index).length === 4,
  "❌ Test 1c failed: index should have exactly 4 entries"
);
console.log("✅ Test 1 passed: buildIndex");

// ── Test 2: summarise returns ContactSummary[] ────────────────────────────

const summaries: ContactSummary[] = summarise(index);

console.assert(
  summaries.length === 4,
  "❌ Test 2a failed: summarise should return 4 summaries"
);

const aliceSummary = summaries.find((s) => s.id === "c1");
console.assert(
  aliceSummary !== undefined &&
    aliceSummary.name === "Alice Nguyen" &&
    aliceSummary.email === "alice@corp.com" &&
    aliceSummary.department === "engineering" &&
    // TypeScript compile-time check: 'seniority' must NOT exist on ContactSummary
    !("seniority" in aliceSummary),
  "❌ Test 2b failed: Alice's summary is incorrect or contains extra fields"
);
console.log("✅ Test 2 passed: summarise");

// ── Test 3: filterContacts — single field ─────────────────────────────────

const engineers = filterContacts(contacts, { department: "engineering" });
console.assert(
  engineers.length === 2 &&
    engineers.every((c) => c.department === "engineering"),
  "❌ Test 3 failed: should return 2 engineering contacts"
);
console.log("✅ Test 3 passed: filterContacts (single field)");

// ── Test 4: filterContacts — multiple fields ──────────────────────────────

const filters: SearchFilters = { department: "engineering", seniority: "senior" };
const seniorEngineers = filterContacts(contacts, filters);
console.assert(
  seniorEngineers.length === 1 && seniorEngineers[0].id === "c1",
  "❌ Test 4 failed: should return only Alice (senior engineer)"
);
console.log("✅ Test 4 passed: filterContacts (multiple fields)");

// ── Test 5: filterContacts — tags subset matching ─────────────────────────

const tsDevs = filterContacts(contacts, { tags: ["typescript"] });
console.assert(
  tsDevs.length === 2 &&
    tsDevs.some((c) => c.id === "c1") &&
    tsDevs.some((c) => c.id === "c3"),
  "❌ Test 5 failed: should return Alice and Carol (both have 'typescript' tag)"
);
console.log("✅ Test 5 passed: filterContacts (tags subset matching)");

console.log("\n🎉 All tests passed!");
