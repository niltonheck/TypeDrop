// ============================================================
// challenge.test.ts
// ============================================================
import {
  validateContact,
  getAlphaKey,
  buildContactIndex,
  type Contact,
  type ContactIndex,
  type AlphaKey,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const validRaw = {
  id: "c1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phone: "+14155550100",
  tags: ["pioneer", "mathematician"],
};

const validRaw2 = {
  id: "c2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
  tags: ["admiral", "pioneer"],
};

const validRaw3 = {
  id: "c3",
  firstName: "Alan",
  lastName: "Turing",
  email: "alan@example.com",
};

const validRaw4 = {
  id: "c4",
  firstName: "Zara",
  lastName: "Ahmed",
  email: "zara@example.com",
  tags: [],
};

const rawMissingEmail = {
  id: "c5",
  firstName: "Bob",
  lastName: "Smith",
};

const rawBadEmail = {
  id: "c6",
  firstName: "Carol",
  lastName: "Jones",
  email: "notanemail",
};

const rawMissingId = {
  firstName: "Dave",
  lastName: "Brown",
  email: "dave@example.com",
};

// ------------------------------------------------------------------
// Test 1 — validateContact: valid input produces a Contact [V1–V7]
// ------------------------------------------------------------------
const r1 = validateContact(validRaw);
console.assert(r1.ok === true, "T1: valid raw should pass validation");
if (r1.ok) {
  console.assert(r1.value.id === "c1", "T1a: id should be 'c1'");
  console.assert(r1.value.lastName === "Lovelace", "T1b: lastName should be 'Lovelace'");
  console.assert(
    Array.isArray(r1.value.tags) && r1.value.tags.includes("pioneer"),
    "T1c: tags should include 'pioneer'"
  );
}

// ------------------------------------------------------------------
// Test 2 — validateContact: missing email field returns error [V4]
// ------------------------------------------------------------------
const r2 = validateContact(rawMissingEmail);
console.assert(r2.ok === false, "T2: missing email should fail validation");
if (!r2.ok) {
  console.assert(
    r2.error.kind === "missing_field" || r2.error.kind === "wrong_type" || r2.error.kind === "invalid_email",
    "T2a: error kind should be a known ValidationError kind"
  );
}

// ------------------------------------------------------------------
// Test 3 — validateContact: bad email (no "@") returns invalid_email [V4]
// ------------------------------------------------------------------
const r3 = validateContact(rawBadEmail);
console.assert(r3.ok === false, "T3: bad email should fail validation");
if (!r3.ok) {
  console.assert(r3.error.kind === "invalid_email", "T3a: error kind should be 'invalid_email'");
}

// ------------------------------------------------------------------
// Test 4 — getAlphaKey: correct bucket keys [G1–G3]
// ------------------------------------------------------------------
const contactL: Contact = {
  id: "x1", firstName: "Ada", lastName: "Lovelace",
  email: "a@b.com", tags: [],
};
const contactH: Contact = {
  id: "x2", firstName: "Grace", lastName: "Hopper",
  email: "g@b.com", tags: [],
};
const contactHash: Contact = {
  id: "x3", firstName: "123", lastName: "9Lives",
  email: "n@b.com", tags: [],
};

console.assert(getAlphaKey(contactL) === "L", "T4a: 'Lovelace' → 'L'");
console.assert(getAlphaKey(contactH) === "H", "T4b: 'Hopper' → 'H'");
console.assert(getAlphaKey(contactHash) === "#", "T4c: '9Lives' → '#'");

// ------------------------------------------------------------------
// Test 5 — buildContactIndex: full index structure & sorting [I1–I5]
// ------------------------------------------------------------------
const index: ContactIndex = buildContactIndex([
  validRaw,        // Lovelace → L
  validRaw2,       // Hopper   → H
  validRaw3,       // Turing   → T
  validRaw4,       // Ahmed    → A
  rawMissingId,    // invalid  → skipped
  rawBadEmail,     // invalid  → skipped
  null,            // invalid  → skipped
]);

// All 27 keys must be present
const expectedKeys: AlphaKey[] = [
  "A","B","C","D","E","F","G","H","I","J","K","L","M",
  "N","O","P","Q","R","S","T","U","V","W","X","Y","Z","#",
];
const indexKeys = Object.keys(index) as AlphaKey[];
console.assert(
  expectedKeys.every((k) => indexKeys.includes(k)) && indexKeys.length === 27,
  "T5a: index must contain exactly 27 keys"
);

// Valid contacts land in the right buckets
console.assert(index["A"].length === 1 && index["A"][0].lastName === "Ahmed", "T5b: A bucket = Ahmed");
console.assert(index["H"].length === 1 && index["H"][0].lastName === "Hopper", "T5c: H bucket = Hopper");
console.assert(index["L"].length === 1 && index["L"][0].lastName === "Lovelace", "T5d: L bucket = Lovelace");
console.assert(index["T"].length === 1 && index["T"][0].lastName === "Turing", "T5e: T bucket = Turing");
console.assert(index["B"].length === 0, "T5f: B bucket should be empty []");

// Sorting: add two contacts in the same bucket, check order
const twoHopper = buildContactIndex([
  { id: "h1", firstName: "Grace", lastName: "Hopper", email: "g@b.com" },
  { id: "h2", firstName: "Alice", lastName: "Hopper", email: "a@b.com" },
]);
console.assert(
  twoHopper["H"][0].firstName === "Alice" && twoHopper["H"][1].firstName === "Grace",
  "T5g: within same lastName, sort by firstName ascending"
);

console.log("All assertions passed ✅");
