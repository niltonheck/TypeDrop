// ============================================================
// challenge.test.ts — Typed Contact Book Grouper
// ============================================================
import {
  isPlainObject,
  validateContact,
  resolveAlphaKey,
  groupContacts,
  type Contact,
  type GroupResult,
} from "./challenge";

// ── Mock data ────────────────────────────────────────────────

const rawContacts: unknown[] = [
  // valid — "W" bucket
  { id: "1", fullName: "  Wendy Appleton  ", email: "wendy@example.com", phone: "555-0101", category: "personal" },
  // valid — "W" bucket (sorts before Wendy)
  { id: "2", fullName: "Walter Bishop", email: "walter@work.io", phone: null, category: "work" },
  // valid — "A" bucket
  { id: "3", fullName: "Alice Zhao", email: "alice@example.com", phone: "  ", category: "personal" },
  // valid — "#" bucket (starts with digit)
  { id: "4", fullName: "007 Bond", email: "bond@mi6.gov", phone: "555-0007", category: "work" },
  // invalid — missing email "@"
  { id: "5", fullName: "Bob Noemail", email: "bobatnoemail.com", phone: null, category: "personal" },
  // invalid — empty fullName
  { id: "6", fullName: "   ", email: "ghost@example.com", phone: null, category: "personal" },
  // invalid — wrong category
  { id: "7", fullName: "Carol Typo", email: "carol@example.com", phone: null, category: "colleague" },
  // invalid — not a plain object
  "just a string",
  // invalid — array (not a plain object)
  ["id", "name"],
];

// ── Test 1: isPlainObject ────────────────────────────────────
console.assert(isPlainObject({ a: 1 }) === true,  "FAIL T1a: plain object should return true");
console.assert(isPlainObject([])       === false, "FAIL T1b: array should return false");
console.assert(isPlainObject(null)     === false, "FAIL T1c: null should return false");
console.assert(isPlainObject("hello")  === false, "FAIL T1d: string should return false");
console.log("T1 isPlainObject — passed");

// ── Test 2: validateContact normalisation ───────────────────
const validRaw = { id: "99", fullName: "  Jane Doe  ", email: "jane@example.com", phone: "  ", category: "work" };
const validated = validateContact(validRaw);
console.assert(validated !== null,                          "FAIL T2a: valid entry should not return null");
console.assert(validated?.fullName === "Jane Doe",          "FAIL T2b: fullName should be trimmed");
console.assert(validated?.phone === null,                   "FAIL T2c: blank phone should become null");
console.assert(validated?.category === "work",              "FAIL T2d: category should be 'work'");
console.log("T2 validateContact — passed");

// ── Test 3: resolveAlphaKey ──────────────────────────────────
const makeContact = (fullName: string): Contact => ({
  id: "x", fullName, email: "x@x.com", phone: null, category: "personal",
});
console.assert(resolveAlphaKey(makeContact("Alice"))  === "A", "FAIL T3a: 'Alice' → 'A'");
console.assert(resolveAlphaKey(makeContact("wendy"))  === "W", "FAIL T3b: 'wendy' → 'W'");
console.assert(resolveAlphaKey(makeContact("007 Bond")) === "#", "FAIL T3c: '007 Bond' → '#'");
console.log("T3 resolveAlphaKey — passed");

// ── Test 4: groupContacts — errors ──────────────────────────
const result: GroupResult = groupContacts(rawContacts);

// 5 invalid entries (indices 4,5,6,7,8)
console.assert(result.errors.length === 5, `FAIL T4a: expected 5 errors, got ${result.errors.length}`);
console.log("T4a groupContacts errors count — passed");

// ── Test 5: groupContacts — index structure & sorting ───────
const wBucket = result.index["W"];
console.assert(Array.isArray(wBucket) && wBucket.length === 2,       "FAIL T5a: W bucket should have 2 contacts");
console.assert(wBucket?.[0].fullName === "Walter Bishop",            "FAIL T5b: Walter should sort before Wendy");
console.assert(wBucket?.[1].fullName === "Wendy Appleton",           "FAIL T5c: Wendy should be second in W bucket");

const aBucket = result.index["A"];
console.assert(Array.isArray(aBucket) && aBucket.length === 1,       "FAIL T5d: A bucket should have 1 contact");
console.assert(aBucket?.[0].phone === null,                          "FAIL T5e: blank phone string should be null");

const hashBucket = result.index["#"];
console.assert(Array.isArray(hashBucket) && hashBucket.length === 1, "FAIL T5f: # bucket should have 1 contact");
console.log("T5 groupContacts index — passed");

console.log("\n✅ All tests passed!");
