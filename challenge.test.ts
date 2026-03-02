// challenge.test.ts
import {
  parseContact,
  buildIndex,
  findById,
  filterByTags,
  searchByName,
  type Contact,
  type Result,
  type ParseError,
} from "./challenge";

// ── Mock Data ────────────────────────────────────────────────

const rawValid = {
  id: "c1",
  firstName: "Ada",
  lastName: "Lovelace",
  email: "ada@example.com",
  phones: [{ type: "mobile", number: "+1-555-0101" }],
  tags: ["vip", "engineering"],
};

const rawValid2 = {
  id: "c2",
  firstName: "Grace",
  lastName: "Hopper",
  email: "grace@example.com",
  phones: [{ type: "work", number: "+1-555-0202" }],
  tags: ["engineering"],
};

const rawValid3 = {
  id: "c3",
  firstName: "Alan",
  lastName: "Turing",
  email: "alan@example.com",
  phones: [{ type: "home", number: "+1-555-0303" }],
  tags: ["vip"],
};

// ── parseContact tests ───────────────────────────────────────

// [R1] non-object inputs
const r1a = parseContact(null);
console.assert(r1a.ok === false, "FAIL [R1a]: null should not parse");
if (!r1a.ok) {
  console.assert(r1a.error.kind === "not_object", "FAIL [R1a-kind]: expected not_object");
}

const r1b = parseContact([rawValid]);
console.assert(r1b.ok === false, "FAIL [R1b]: array should not parse");

// [R2] missing field
const r2 = parseContact({ id: "c1", firstName: "Ada" });
console.assert(r2.ok === false, "FAIL [R2]: missing fields should fail");
if (!r2.ok) {
  console.assert(r2.error.kind === "missing_field", "FAIL [R2-kind]: expected missing_field");
}

// [R3] empty id
const r3 = parseContact({ ...rawValid, id: "" });
console.assert(r3.ok === false, "FAIL [R3]: empty id should fail");
if (!r3.ok) {
  console.assert(r3.error.kind === "invalid_field", "FAIL [R3-kind]: expected invalid_field");
  if (r3.error.kind === "invalid_field") {
    console.assert(r3.error.field === "id", "FAIL [R3-field]: expected field=id");
  }
}

// [R4] bad email
const r4 = parseContact({ ...rawValid, email: "not-an-email" });
console.assert(r4.ok === false, "FAIL [R4]: bad email should fail");
if (!r4.ok && r4.error.kind === "invalid_field") {
  console.assert(r4.error.field === "email", "FAIL [R4-field]: expected field=email");
}

// [R5] empty phones array
const r5 = parseContact({ ...rawValid, phones: [] });
console.assert(r5.ok === false, "FAIL [R5]: empty phones should fail");

// [R5] bad phone type
const r5b = parseContact({ ...rawValid, phones: [{ type: "fax", number: "123" }] });
console.assert(r5b.ok === false, "FAIL [R5b]: bad phone type should fail");

// [R6] valid contact
const r6 = parseContact(rawValid);
console.assert(r6.ok === true, "FAIL [R6]: valid contact should parse");
if (r6.ok) {
  console.assert(r6.value.firstName === "Ada", "FAIL [R6-name]: firstName mismatch");
}

// ── buildIndex / findById tests ──────────────────────────────

// Extract parsed contacts (we know they're valid)
function mustParse(raw: unknown): Contact {
  const result = parseContact(raw);
  if (!result.ok) throw new Error("Unexpected parse failure");
  return result.value;
}

const c1 = mustParse(rawValid);
const c2 = mustParse(rawValid2);
const c3 = mustParse(rawValid3);

const index = buildIndex([c1, c2, c3]);

const found = findById(index, "c2");
console.assert(found !== undefined, "FAIL: c2 should be found");
console.assert(found?.lastName === "Hopper", "FAIL: c2 lastName mismatch");

const notFound = findById(index, "c999");
console.assert(notFound === undefined, "FAIL: c999 should be undefined");

// ── filterByTags tests ───────────────────────────────────────

const vipContacts = filterByTags(index, ["vip"]);
console.assert(vipContacts.length === 2, `FAIL: expected 2 vip contacts, got ${vipContacts.length}`);

const vipEngineering = filterByTags(index, ["vip", "engineering"]);
console.assert(vipEngineering.length === 1, `FAIL: expected 1 vip+engineering contact, got ${vipEngineering.length}`);
console.assert(vipEngineering[0]?.id === "c1", "FAIL: vip+engineering should be Ada");

const allContacts = filterByTags(index, []);
console.assert(allContacts.length === 3, `FAIL: empty tags should return all 3, got ${allContacts.length}`);

// ── searchByName tests ───────────────────────────────────────

const byPrefix = searchByName(index, "a"); // matches "Ada" and "Alan"
console.assert(byPrefix.length === 2, `FAIL: prefix 'a' should match 2, got ${byPrefix.length}`);
// sorted by lastName: Lovelace < Turing
console.assert(byPrefix[0]?.lastName === "Lovelace", "FAIL: first result should be Lovelace");
console.assert(byPrefix[1]?.lastName === "Turing", "FAIL: second result should be Turing");

const noMatch = searchByName(index, "zzz");
console.assert(noMatch.length === 0, "FAIL: 'zzz' should match nobody");

console.log("All assertions passed (or logged above).");
