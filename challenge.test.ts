// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  toPositiveNumber,
  parseRecipe,
  scaleRecipe,
  parseAndScale,
  type Unit,
  type Recipe,
  type ScaledRecipe,
  type ValidationError,
  type Result,
  type PositiveNumber,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function assertOk<T, E>(
  result: Result<T, E>,
  label: string
): asserts result is { ok: true; value: T } {
  console.assert(result.ok === true, `[FAIL] ${label}: expected ok=true, got ok=false`);
}

function assertFail<T, E>(
  result: Result<T, E>,
  label: string
): asserts result is { ok: false; error: E } {
  console.assert(result.ok === false, `[FAIL] ${label}: expected ok=false, got ok=true`);
}

// ── Mock data ────────────────────────────────────────────────
const validRaw: unknown = {
  id: "recipe-001",
  title: "Pancakes",
  servings: 4,
  ingredients: [
    { name: "Flour",  quantity: 200, unit: "g"    },
    { name: "Milk",   quantity: 300, unit: "ml"   },
    { name: "Eggs",   quantity: 2,   unit: "piece"},
    { name: "Butter", quantity: 2,   unit: "tbsp" },
  ],
};

const missingTitleRaw: unknown = {
  id: "recipe-002",
  servings: 2,
  ingredients: [{ name: "Salt", quantity: 1, unit: "tsp" }],
};

const badUnitRaw: unknown = {
  id: "recipe-003",
  title: "Mystery Dish",
  servings: 1,
  ingredients: [{ name: "Unobtainium", quantity: 5, unit: "lightyear" }],
};

const emptyIngredientsRaw: unknown = {
  id: "recipe-004",
  title: "Empty Bowl",
  servings: 1,
  ingredients: [],
};

// ── Test 1: valid recipe parses successfully ─────────────────
const r1 = parseRecipe(validRaw);
assertOk(r1, "Test 1 – valid recipe parses");
if (r1.ok) {
  console.assert(r1.value.title === "Pancakes", "[FAIL] Test 1 – title should be 'Pancakes'");
  console.assert(r1.value.ingredients.length === 4, "[FAIL] Test 1 – should have 4 ingredients");
  console.log("[PASS] Test 1 – valid recipe parses successfully");
}

// ── Test 2: missing field returns MissingField error ─────────
const r2 = parseRecipe(missingTitleRaw);
assertFail(r2, "Test 2 – missing title");
if (!r2.ok) {
  console.assert(
    r2.error.kind === "MissingField" && r2.error.field === "title",
    `[FAIL] Test 2 – expected MissingField for 'title', got: ${JSON.stringify(r2.error)}`
  );
  console.log("[PASS] Test 2 – missing title returns MissingField error");
}

// ── Test 3: invalid unit returns InvalidValue error ──────────
const r3 = parseRecipe(badUnitRaw);
assertFail(r3, "Test 3 – invalid unit");
if (!r3.ok) {
  console.assert(
    r3.error.kind === "InvalidValue",
    `[FAIL] Test 3 – expected InvalidValue, got: ${JSON.stringify(r3.error)}`
  );
  console.log("[PASS] Test 3 – bad unit returns InvalidValue error");
}

// ── Test 4: scaleRecipe doubles quantities correctly ─────────
if (r1.ok) {
  const targetServings = toPositiveNumber(8);
  console.assert(targetServings !== null, "[FAIL] Test 4 – toPositiveNumber(8) should not be null");
  if (targetServings !== null) {
    const scaled: ScaledRecipe = scaleRecipe(r1.value, targetServings);
    console.assert(scaled.scaleFactor === 2, `[FAIL] Test 4 – scaleFactor should be 2, got ${scaled.scaleFactor}`);
    console.assert(
      scaled.scaledIngredients[0].scaledQuantity === 400,
      `[FAIL] Test 4 – flour scaledQuantity should be 400g, got ${scaled.scaledIngredients[0].scaledQuantity}`
    );
    console.assert(scaled.targetServings === 8, "[FAIL] Test 4 – targetServings should be 8");
    console.log("[PASS] Test 4 – scaleRecipe doubles quantities correctly");
  }
}

// ── Test 5: parseAndScale with non-positive targetServings fails
const r5 = parseAndScale(validRaw, 0);
assertFail(r5, "Test 5 – zero targetServings");
if (!r5.ok) {
  console.assert(
    r5.error.kind === "InvalidValue" && r5.error.field === "targetServings",
    `[FAIL] Test 5 – expected InvalidValue for targetServings, got: ${JSON.stringify(r5.error)}`
  );
  console.log("[PASS] Test 5 – zero targetServings returns InvalidValue error");
}

// ── Test 6: empty ingredients array fails validation ─────────
const r6 = parseRecipe(emptyIngredientsRaw);
assertFail(r6, "Test 6 – empty ingredients");
if (!r6.ok) {
  console.assert(
    r6.error.kind === "InvalidValue" && r6.error.field === "ingredients",
    `[FAIL] Test 6 – expected InvalidValue for ingredients, got: ${JSON.stringify(r6.error)}`
  );
  console.log("[PASS] Test 6 – empty ingredients array returns InvalidValue error");
}

console.log("\nAll tests complete.");
