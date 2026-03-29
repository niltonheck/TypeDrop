// ============================================================
// challenge.test.ts
// ============================================================
import {
  parseIngredient,
  scaleIngredient,
  scaleRecipe,
  makeMultiplier,
  type RawIngredient,
  type UnitGroup,
} from "./challenge";

// ---- helpers ------------------------------------------------

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// ---- mock data ----------------------------------------------

const validFlour: RawIngredient = { name: "flour", quantity: 2, unit: "cup" };
const validSalt: RawIngredient  = { name: "  salt  ", quantity: 5, unit: "g" };
const badName: RawIngredient    = { name: "   ", quantity: 1, unit: "tsp" };
const badQty: RawIngredient     = { name: "sugar", quantity: -3, unit: "tbsp" };
const badUnit: RawIngredient    = { name: "butter", quantity: 100, unit: "stones" };

// ---- TEST 1: parseIngredient — valid volume ingredient ------
{
  const result = parseIngredient(validFlour);
  assert(result.ok === true, "parseIngredient: valid flour returns ok:true");
  if (result.ok) {
    assert(
      result.value.name === "flour",
      "parseIngredient: flour name is 'flour'"
    );
    assert(
      result.value.quantity === 2,
      "parseIngredient: flour quantity is 2"
    );
    assert(
      result.value.unitGroup.kind === "volume",
      "parseIngredient: flour unit group is 'volume'"
    );
  }
}

// ---- TEST 2: parseIngredient — valid weight ingredient with trimming ------
{
  const result = parseIngredient(validSalt);
  assert(result.ok === true, "parseIngredient: valid salt returns ok:true");
  if (result.ok) {
    assert(
      result.value.name === "salt",
      "parseIngredient: salt name is trimmed to 'salt'"
    );
    assert(
      result.value.unitGroup.kind === "weight",
      "parseIngredient: salt unit group is 'weight'"
    );
  }
}

// ---- TEST 3: parseIngredient — validation errors in order --
{
  const r1 = parseIngredient(badName);
  assert(!r1.ok && r1.error.kind === "EMPTY_NAME", "parseIngredient: blank name → EMPTY_NAME");

  const r2 = parseIngredient(badQty);
  assert(!r2.ok && r2.error.kind === "INVALID_QUANTITY", "parseIngredient: negative qty → INVALID_QUANTITY");

  const r3 = parseIngredient(badUnit);
  assert(!r3.ok && r3.error.kind === "UNKNOWN_UNIT", "parseIngredient: unknown unit → UNKNOWN_UNIT");
}

// ---- TEST 4: scaleIngredient --------------------------------
{
  const parsed = parseIngredient(validFlour);
  if (parsed.ok) {
    const multiplier = makeMultiplier(3)!;
    const scaled = scaleIngredient(parsed.value, multiplier);
    assert(scaled.quantity === 6, "scaleIngredient: 2 cups × 3 = 6");
    assert(scaled.scaledBy === 3, "scaleIngredient: scaledBy is recorded as 3");
    assert(
      (scaled.unitGroup as UnitGroup).kind === "volume",
      "scaleIngredient: unitGroup is preserved"
    );
  }
}

// ---- TEST 5: scaleRecipe — mixed valid/invalid inputs -------
{
  const raws: RawIngredient[] = [validFlour, badName, validSalt, badUnit];
  const result = scaleRecipe(raws, 2);

  assert(result.scaled.length === 2, "scaleRecipe: 2 valid ingredients scaled");
  assert(result.failures.length === 2, "scaleRecipe: 2 failures recorded");
  assert(
    result.scaled.every((s) => s.scaledBy === 2),
    "scaleRecipe: all scaled ingredients have scaledBy === 2"
  );
  assert(
    result.failures.some((f) => f.index === 1 && f.error.kind === "EMPTY_NAME"),
    "scaleRecipe: failure at index 1 is EMPTY_NAME"
  );
  assert(
    result.failures.some((f) => f.index === 3 && f.error.kind === "UNKNOWN_UNIT"),
    "scaleRecipe: failure at index 3 is UNKNOWN_UNIT"
  );
}

// ---- TEST 6: scaleRecipe — invalid multiplier ---------------
{
  const raws: RawIngredient[] = [validFlour, validSalt];
  const result = scaleRecipe(raws, -1);

  assert(result.scaled.length === 0, "scaleRecipe: invalid multiplier → no scaled ingredients");
  assert(result.failures.length === 2, "scaleRecipe: invalid multiplier → all ingredients are failures");
  assert(
    result.failures.every((f) => f.error.kind === "INVALID_QUANTITY"),
    "scaleRecipe: invalid multiplier failures use INVALID_QUANTITY"
  );
}
