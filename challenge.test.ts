// ============================================================
// challenge.test.ts  —  run with: npx ts-node challenge.test.ts
// ============================================================
import {
  parseIngredient,
  parseRecipe,
  scaleRecipe,
  formatIngredient,
  VALID_UNITS,
} from "./challenge";

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean): void {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

// ── Mock data ────────────────────────────────────────────────

const validIngredientRaw: unknown = { name: "flour", quantity: 200, unit: "g" };
const invalidIngredientRaw: unknown = { name: "", quantity: 200, unit: "g" }; // empty name
const badUnitRaw: unknown = { name: "sugar", quantity: 100, unit: "oz" };     // invalid unit

const validRecipeRaw: unknown = {
  title: "Pancakes",
  defaultServings: 4,
  ingredients: [
    { name: "flour",  quantity: 200, unit: "g"   },
    { name: "milk",   quantity: 300, unit: "ml"  },
    { name: "egg",    quantity: 2,   unit: "piece"},
    { name: "butter", quantity: 30,  unit: "g"   },
  ],
};

const recipeWithBadIngredient: unknown = {
  title: "Bad Recipe",
  defaultServings: 2,
  ingredients: [
    { name: "salt", quantity: 5, unit: "g" },
    { name: "",     quantity: 1, unit: "tsp" }, // invalid — should cause null
  ],
};

// ── Tests ────────────────────────────────────────────────────

console.log("\n── parseIngredient ──");
assert(
  "valid ingredient parses correctly",
  (() => {
    const ing = parseIngredient(validIngredientRaw);
    return ing !== null && ing.name === "flour" && ing.quantity === 200 && ing.unit === "g";
  })()
);
assert("empty name returns null",  parseIngredient(invalidIngredientRaw) === null);
assert("invalid unit returns null", parseIngredient(badUnitRaw) === null);
assert("null input returns null",   parseIngredient(null) === null);

console.log("\n── parseRecipe ──");
assert(
  "valid recipe parses with all 4 ingredients",
  (() => {
    const r = parseRecipe(validRecipeRaw);
    return r !== null && r.title === "Pancakes" && r.ingredients.length === 4;
  })()
);
assert(
  "recipe with one invalid ingredient returns null",
  parseRecipe(recipeWithBadIngredient) === null
);
assert("null input returns null", parseRecipe(null) === null);

console.log("\n── scaleRecipe ──");
assert(
  "scale 4-serving recipe to 2 servings halves quantities",
  (() => {
    const recipe = parseRecipe(validRecipeRaw);
    if (!recipe) return false;
    const scaled = scaleRecipe(recipe, 2);
    if (!scaled) return false;
    const flour = scaled.ingredients.find((i) => i.name === "flour");
    const egg   = scaled.ingredients.find((i) => i.name === "egg");
    return flour?.quantity === 100 && egg?.quantity === 1;
  })()
);
assert(
  "scale 4-serving recipe to 6 servings — rounding to 2dp",
  (() => {
    const recipe = parseRecipe(validRecipeRaw);
    if (!recipe) return false;
    const scaled = scaleRecipe(recipe, 6);
    if (!scaled) return false;
    // milk: 300 * 6 / 4 = 450, butter: 30 * 6 / 4 = 45
    const milk   = scaled.ingredients.find((i) => i.name === "milk");
    const butter = scaled.ingredients.find((i) => i.name === "butter");
    return milk?.quantity === 450 && butter?.quantity === 45;
  })()
);
assert(
  "targetServings = 0 returns null",
  (() => {
    const recipe = parseRecipe(validRecipeRaw);
    return recipe !== null && scaleRecipe(recipe, 0) === null;
  })()
);
assert(
  "targetServings preserved in ScaledRecipe",
  (() => {
    const recipe = parseRecipe(validRecipeRaw);
    if (!recipe) return false;
    const scaled = scaleRecipe(recipe, 8);
    return scaled?.targetServings === 8;
  })()
);

console.log("\n── formatIngredient ──");
assert(
  "format produces correct string",
  (() => {
    const ing = parseIngredient(validIngredientRaw);
    if (!ing) return false;
    return formatIngredient(ing) === "flour: 200 g";
  })()
);

// ── Summary ──────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
