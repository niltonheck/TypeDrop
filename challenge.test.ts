// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  safeParseJSON,
  validateString,
  validateNumber,
  validateBoolean,
  validateObject,
  parseTo,
  mapResult,
  type Result,
  type ParseError,
} from "./challenge";

// ── helpers ──────────────────────────────────────────────────
function assertOk<T>(result: Result<T, ParseError>, label: string): T {
  console.assert(result.ok === true, `[FAIL] ${label} — expected ok, got error`);
  if (!result.ok) {
    console.error("  error:", result.error);
    process.exit(1);
  }
  return result.value;
}

function assertErr(
  result: Result<unknown, ParseError>,
  kind: ParseError["kind"],
  label: string
): void {
  console.assert(result.ok === false, `[FAIL] ${label} — expected error, got ok`);
  if (!result.ok) {
    console.assert(
      result.error.kind === kind,
      `[FAIL] ${label} — expected kind "${kind}", got "${result.error.kind}"`
    );
  }
}

// ── Test 1: safeParseJSON — empty input ──────────────────────
assertErr(safeParseJSON(""), "EmptyInput", "Test 1a: empty string");
assertErr(safeParseJSON("   "), "EmptyInput", "Test 1b: whitespace-only");
console.log("✓ Test 1 passed — EmptyInput detection");

// ── Test 2: safeParseJSON — malformed JSON ───────────────────
assertErr(safeParseJSON("{bad json}"), "SyntaxError", "Test 2: bad JSON");
console.log("✓ Test 2 passed — SyntaxError detection");

// ── Test 3: safeParseJSON — valid JSON ───────────────────────
const parsed = assertOk(safeParseJSON('{"name":"Ada","age":36}'), "Test 3");
console.assert(
  typeof parsed === "object" && parsed !== null,
  "[FAIL] Test 3 — parsed value should be an object"
);
console.log("✓ Test 3 passed — valid JSON parsed");

// ── Test 4: primitive validators ─────────────────────────────
assertOk(validateString("hello"), "Test 4a: validateString ok");
assertErr(validateString(42), "ValidationError", "Test 4b: validateString fail");
assertOk(validateNumber(3.14), "Test 4c: validateNumber ok");
assertErr(validateNumber("oops"), "ValidationError", "Test 4d: validateNumber fail");
assertOk(validateBoolean(false), "Test 4e: validateBoolean ok");
assertErr(validateBoolean(null), "ValidationError", "Test 4f: validateBoolean fail");
console.log("✓ Test 4 passed — primitive validators");

// ── Test 5: validateObject ───────────────────────────────────
type AppConfig = { host: string; port: number; debug: boolean };

const configValidator = validateObject<AppConfig>({
  host: validateString,
  port: validateNumber,
  debug: validateBoolean,
});

const validConfig = assertOk(
  configValidator({ host: "localhost", port: 8080, debug: false }),
  "Test 5a: valid config"
);
console.assert(validConfig.host === "localhost", "[FAIL] Test 5a — host mismatch");
console.assert(validConfig.port === 8080, "[FAIL] Test 5a — port mismatch");

assertErr(
  configValidator({ host: "localhost", port: "oops", debug: false }),
  "ValidationError",
  "Test 5b: invalid port type"
);
assertErr(configValidator(null), "ValidationError", "Test 5c: null input");
assertErr(configValidator([1, 2, 3]), "ValidationError", "Test 5d: array input");
console.log("✓ Test 5 passed — validateObject");

// ── Test 6: parseTo end-to-end ────────────────────────────────
const raw = JSON.stringify({ host: "0.0.0.0", port: 3000, debug: true });
const e2e = assertOk(parseTo(raw, configValidator), "Test 6: parseTo ok");
console.assert(e2e.port === 3000, "[FAIL] Test 6 — port mismatch");

assertErr(parseTo("", configValidator), "EmptyInput", "Test 6b: parseTo empty");
assertErr(parseTo("{bad}", configValidator), "SyntaxError", "Test 6c: parseTo syntax");
console.log("✓ Test 6 passed — parseTo end-to-end");

// ── Test 7: mapResult ─────────────────────────────────────────
const portResult = parseTo(raw, configValidator);
const portOnly = mapResult(portResult, (cfg) => cfg.port);
const portValue = assertOk(portOnly, "Test 7a: mapResult ok");
console.assert(portValue === 3000, "[FAIL] Test 7a — mapped port mismatch");

const failResult = parseTo("{bad}", configValidator);
const mappedFail = mapResult(failResult, (cfg) => cfg.port);
assertErr(mappedFail, "SyntaxError", "Test 7b: mapResult preserves error");
console.log("✓ Test 7 passed — mapResult");

console.log("\n🎉 All tests passed!");
