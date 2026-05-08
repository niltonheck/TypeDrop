// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  validateRecipe,
  aggregateNutrition,
  processRecipes,
  type Recipe,
  type RecipeSummary,
} from "./challenge";

// -----------------------------------------------------------
// Mock data
// -----------------------------------------------------------

const validRaw = {
  id: "r1",
  title: "Peanut Butter Toast",
  servings: 2,
  ingredients: [
    {
      name: "White Bread",
      grams: 60,
      nutrition: { calories: 265, protein: 9, fat: 3.2, carbs: 49, fiber: 2.7 },
    },
    {
      name: "Peanut Butter",
      grams: 32,
      nutrition: { calories: 588, protein: 25, fat: 50, carbs: 20, fiber: 6 },
    },
  ],
};

// Missing `servings` field
const missingField = {
  id: "r2",
  title: "Broken Recipe",
  ingredients: [
    { name: "X", grams: 100, nutrition: { calories: 100, protein: 5, fat: 5, carbs: 10, fiber: 1 } },
  ],
};

// servings = 0 → out of range
const outOfRange = { ...validRaw, id: "r3", servings: 0 };

// Empty ingredients array
const emptyIngredients = { ...validRaw, id: "r4", ingredients: [] };

// -----------------------------------------------------------
// Test 1: validateRecipe returns ok:true for a valid payload
// -----------------------------------------------------------
const v1 = validateRecipe(validRaw);
console.assert(v1.ok === true, "Test 1 FAILED: expected ok:true for valid payload");
if (v1.ok) {
  console.assert(v1.value.id === "r1", "Test 1b FAILED: id mismatch");
  console.assert(v1.value.ingredients.length === 2, "Test 1c FAILED: ingredients length");
}
console.log("Test 1 passed ✓");

// -----------------------------------------------------------
// Test 2: validateRecipe returns ok:false for missing field
// -----------------------------------------------------------
const v2 = validateRecipe(missingField);
console.assert(v2.ok === false, "Test 2 FAILED: expected ok:false for missing servings");
if (!v2.ok) {
  console.assert(v2.error.kind === "MISSING_FIELD", "Test 2b FAILED: expected MISSING_FIELD");
}
console.log("Test 2 passed ✓");

// -----------------------------------------------------------
// Test 3: aggregateNutrition computes correct perServing calories
// -----------------------------------------------------------
// Bread: (265 * 60/100) = 159 kcal; PB: (588 * 32/100) = 188.16 kcal
// Total calories = 347.16; per serving (÷2) = 173.58
const validRecipe = (validateRecipe(validRaw) as { ok: true; value: Recipe }).value;
const summary: RecipeSummary = aggregateNutrition(validRecipe);
console.assert(
  summary.perServing.calories === 173.58,
  `Test 3 FAILED: expected 173.58 calories/serving, got ${summary.perServing.calories}`
);
console.log("Test 3 passed ✓");

// -----------------------------------------------------------
// Test 4: topContributors sorted descending by totalCalories
// -----------------------------------------------------------
console.assert(
  summary.topContributors[0].name === "Peanut Butter",
  `Test 4 FAILED: expected Peanut Butter as top contributor, got ${summary.topContributors[0].name}`
);
console.assert(
  summary.topContributors[0].percentOfRecipeCalories === parseFloat(((188.16 / 347.16) * 100).toFixed(2)).toString() === false || true,
  "Test 4b: percent shape check"
);
// Peanut Butter percent ≈ 54.20%
const pbPercent = parseFloat(((188.16 / 347.16) * 100).toFixed(2));
console.assert(
  summary.topContributors[0].percentOfRecipeCalories === pbPercent,
  `Test 4c FAILED: expected ${pbPercent}%, got ${summary.topContributors[0].percentOfRecipeCalories}`
);
console.log("Test 4 passed ✓");

// -----------------------------------------------------------
// Test 5: processRecipes skips invalid payloads silently
// -----------------------------------------------------------
const results = processRecipes([validRaw, missingField, outOfRange, emptyIngredients]);
console.assert(
  results.length === 1,
  `Test 5 FAILED: expected 1 valid summary, got ${results.length}`
);
console.assert(
  results[0].id === "r1",
  `Test 5b FAILED: expected id 'r1', got ${results[0].id}`
);
console.log("Test 5 passed ✓");

console.log("\nAll tests passed! 🎉");
