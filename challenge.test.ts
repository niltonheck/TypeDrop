// challenge.test.ts
import {
  safeParseJSON,
  validateShape,
  parseAndValidate,
  type InferSchema,
  type ParseError,
  type Result,
} from "./challenge";

// ------------------------------------------------------------------
// Shared schema & derived type
// ------------------------------------------------------------------
const userSchema = {
  id: "number",
  name: "string",
  active: "boolean",
  tags: "string[]",
} as const;

type User = InferSchema<typeof userSchema>;
//   ^ should resolve to: { id: number; name: string; active: boolean; tags: string[] }

// ------------------------------------------------------------------
// Test 1: safeParseJSON — valid JSON returns ok: true
// ------------------------------------------------------------------
const parsed = safeParseJSON('{"id":1,"name":"Alice"}');
console.assert(parsed.ok === true, "Test 1 FAILED: valid JSON should parse successfully");

// ------------------------------------------------------------------
// Test 2: safeParseJSON — invalid JSON returns ok: false with SyntaxError kind
// ------------------------------------------------------------------
const badParsed = safeParseJSON("{not valid json}");
console.assert(badParsed.ok === false, "Test 2 FAILED: invalid JSON should return ok: false");
if (!badParsed.ok) {
  console.assert(
    badParsed.error.kind === "SyntaxError",
    "Test 2 FAILED: error kind should be 'SyntaxError'"
  );
}

// ------------------------------------------------------------------
// Test 3: validateShape — correct shape returns ok: true with typed value
// ------------------------------------------------------------------
const validRaw = { id: 42, name: "Bob", active: true, tags: ["admin", "user"] };
const validated = validateShape(validRaw, userSchema);
console.assert(validated.ok === true, "Test 3 FAILED: valid shape should pass validation");
if (validated.ok) {
  const user: User = validated.value; // must type-check without assertion
  console.assert(user.id === 42, "Test 3 FAILED: id should be 42");
  console.assert(user.name === "Bob", "Test 3 FAILED: name should be 'Bob'");
}

// ------------------------------------------------------------------
// Test 4: validateShape — wrong field type returns ValidationError
// ------------------------------------------------------------------
const badShape = { id: "not-a-number", name: "Carol", active: false, tags: [] };
const badValidated = validateShape(badShape, userSchema);
console.assert(badValidated.ok === false, "Test 4 FAILED: wrong type should fail validation");
if (!badValidated.ok) {
  console.assert(
    badValidated.error.kind === "ValidationError",
    "Test 4 FAILED: error kind should be 'ValidationError'"
  );
  console.assert(
    badValidated.error.field === "id",
    `Test 4 FAILED: failing field should be 'id', got '${badValidated.error.field}'`
  );
}

// ------------------------------------------------------------------
// Test 5: parseAndValidate — end-to-end happy path
// ------------------------------------------------------------------
const goodJson = JSON.stringify({ id: 7, name: "Dave", active: true, tags: ["beta"] });
const result: Result<User, ParseError> = parseAndValidate(goodJson, userSchema);
console.assert(result.ok === true, "Test 5 FAILED: full pipeline should succeed on valid input");
if (result.ok) {
  console.assert(result.value.name === "Dave", "Test 5 FAILED: name should be 'Dave'");
  console.assert(
    Array.isArray(result.value.tags),
    "Test 5 FAILED: tags should be an array"
  );
}

// ------------------------------------------------------------------
// Test 6: parseAndValidate — syntax error propagated
// ------------------------------------------------------------------
const syntaxResult = parseAndValidate("<<<bad>>>", userSchema);
console.assert(syntaxResult.ok === false, "Test 6 FAILED: bad JSON should return ok: false");
if (!syntaxResult.ok) {
  console.assert(
    syntaxResult.error.kind === "SyntaxError",
    "Test 6 FAILED: should surface SyntaxError kind"
  );
}

// ------------------------------------------------------------------
// Test 7: parseAndValidate — missing field triggers ValidationError
// ------------------------------------------------------------------
const missingField = JSON.stringify({ id: 3, name: "Eve" }); // missing active & tags
const missingResult = parseAndValidate(missingField, userSchema);
console.assert(missingResult.ok === false, "Test 7 FAILED: missing fields should fail");
if (!missingResult.ok) {
  console.assert(
    missingResult.error.kind === "ValidationError",
    "Test 7 FAILED: should surface ValidationError kind"
  );
}

console.log("All tests passed! ✅");
