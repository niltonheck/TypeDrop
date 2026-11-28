// challenge.test.ts
import {
  Contact,
  ContactTag,
  searchContacts,
  formatVCard,
  groupByTag,
} from "./challenge";

// ── Mock Data ──────────────────────────────────────────────
const contacts: Contact[] = [
  {
    id: "1",
    firstName: "Alice",
    lastName: "Martin",
    email: "alice@example.com",
    phones: [{ number: "+1-555-0101", type: "mobile" }],
    tags: ["friend", "vip"],
    birthday: "1990-04-22",
    company: "Acme Corp",
  },
  {
    id: "2",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@work.org",
    phones: [
      { number: "+1-555-0202", type: "work" },
      { number: "+1-555-0303", type: "mobile" },
    ],
    tags: ["colleague", "friend"],
  },
  {
    id: "3",
    firstName: "Carol",
    lastName: "Jones",
    email: "carol@family.net",
    phones: [{ number: "+1-555-0404", type: "home" }],
    tags: ["family", "vip"],
    birthday: "1985-12-01",
  },
  {
    id: "4",
    firstName: "Dan",
    lastName: "Brown",
    email: "dan@example.com",
    phones: [],
    tags: ["other"],
  },
];

// ── Test 1: searchContacts — nameQuery ─────────────────────
const nameResults = searchContacts(contacts, { nameQuery: "ali" });
console.assert(
  nameResults.length === 1 && nameResults[0].id === "1",
  `FAIL Test 1: expected [Alice], got ${nameResults.map((c) => c.firstName)}`
);
console.log("Test 1 passed: nameQuery search");

// ── Test 2: searchContacts — emailQuery ────────────────────
const emailResults = searchContacts(contacts, { emailQuery: "example" });
console.assert(
  emailResults.length === 2 &&
    emailResults.every((c) => c.email.includes("example")),
  `FAIL Test 2: expected Alice & Dan, got ${emailResults.map((c) => c.firstName)}`
);
console.log("Test 2 passed: emailQuery search");

// ── Test 3: searchContacts — tag filter (ALL tags required) ─
const tagResults = searchContacts(contacts, { tags: ["friend", "vip"] });
console.assert(
  tagResults.length === 1 && tagResults[0].id === "1",
  `FAIL Test 3: expected [Alice], got ${tagResults.map((c) => c.firstName)}`
);
console.log("Test 3 passed: tag filter (all-must-match)");

// ── Test 4: formatVCard — full contact ─────────────────────
const vcard = formatVCard(contacts[0]); // Alice
const vcardLines = vcard.split("\n");
console.assert(
  vcardLines[0] === "BEGIN:VCARD" &&
    vcardLines[1] === "VERSION:3.0" &&
    vcardLines.includes("N:Martin;Alice") &&
    vcardLines.includes("FN:Alice Martin") &&
    vcardLines.includes("EMAIL:alice@example.com") &&
    vcardLines.includes("TEL;TYPE=mobile:+1-555-0101") &&
    vcardLines.includes("ORG:Acme Corp") &&
    vcardLines.includes("BDAY:1990-04-22") &&
    vcardLines[vcardLines.length - 1] === "END:VCARD",
  `FAIL Test 4: vCard output incorrect:\n${vcard}`
);
console.log("Test 4 passed: formatVCard output");

// ── Test 5: groupByTag — all keys present, correct buckets ─
const grouped = groupByTag(contacts);
const allTags: ContactTag[] = ["family", "friend", "colleague", "vip", "other"];
const allKeysPresent = allTags.every((t) => Array.isArray(grouped[t]));
console.assert(allKeysPresent, "FAIL Test 5a: not all ContactTag keys present");
console.assert(
  grouped["vip"].length === 2 &&
    grouped["vip"].map((c) => c.id).sort().join(",") === "1,3",
  `FAIL Test 5b: expected Alice & Carol under 'vip', got ${grouped["vip"].map((c) => c.firstName)}`
);
console.assert(
  grouped["colleague"].length === 1 && grouped["colleague"][0].id === "2",
  `FAIL Test 5c: expected Bob under 'colleague'`
);
console.log("Test 5 passed: groupByTag structure and buckets");
