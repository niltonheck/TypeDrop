// challenge.test.ts
import {
  type DietTag,
  type NutritionInfo,
  type Ingredient,
  type Recipe,
  type ScaledRecipe,
  type NutritionSummary,
  filterByDietTag,
  scaleRecipe,
  computeNutritionSummary,
  filterAndScale,
} from "./challenge";

// ── Mock Data ─────────────────────────────────────────────────

const avocadoToast: Recipe = {
  id: "r1",
  title: "Avocado Toast",
  servings: 2,
  dietTags: ["vegan", "dairy-free"],
  ingredients: [
    { name: "sourdough bread", quantity: 2, unit: "slices" },
    { name: "avocado", quantity: 1, unit: "whole" },
    { name: "lemon juice", quantity: 10, unit: "ml" },
  ],
  nutrition: { calories: 320, protein: 6, carbs: 38, fat: 16 },
};

const grilledCheese: Recipe = {
  id: "r2",
  title: "Grilled Cheese",
  servings: 1,
  dietTags: ["vegetarian", "nut-free"],
  ingredients: [
    { name: "bread", quantity: 2, unit: "slices" },
    { name: "cheddar", quantity: 60, unit: "g" },
    { name: "butter", quantity: 10, unit: "g" },
  ],
  nutrition: { calories: 450, protein: 18, carbs: 40, fat: 24 },
};

const lentilSoup: Recipe = {
  id: "r3",
  title: "Lentil Soup",
  servings: 4,
  dietTags: ["vegan", "gluten-free", "dairy-free", "nut-free"],
  ingredients: [
    { name: "red lentils", quantity: 200, unit: "g" },
    { name: "tomatoes", quantity: 400, unit: "g" },
    { name: "cumin", quantity: 5, unit: "tsp" },
  ],
  nutrition: { calories: 210, protein: 14, carbs: 36, fat: 2 },
};

const allRecipes: readonly Recipe[] = [avocadoToast, grilledCheese, lentilSoup];

// ── Test 1: filterByDietTag returns only vegan recipes ────────
const veganRecipes = filterByDietTag(allRecipes, "vegan");
console.assert(
  veganRecipes.length === 2,
  `Test 1 FAILED: expected 2 vegan recipes, got ${veganRecipes.length}`
);
console.assert(
  veganRecipes.every((r) => r.dietTags.includes("vegan")),
  "Test 1 FAILED: a returned recipe is not vegan"
);
console.log("Test 1 passed ✓ — filterByDietTag");

// ── Test 2: filterByDietTag with a tag that matches one recipe ─
const glutenFreeRecipes = filterByDietTag(allRecipes, "gluten-free");
console.assert(
  glutenFreeRecipes.length === 1 && glutenFreeRecipes[0].id === "r3",
  `Test 2 FAILED: expected only lentilSoup, got ${glutenFreeRecipes.map((r) => r.id)}`
);
console.log("Test 2 passed ✓ — filterByDietTag single match");

// ── Test 3: scaleRecipe doubles avocadoToast to 4 servings ────
const scaled = scaleRecipe(avocadoToast, 4);
console.assert(
  scaled.targetServings === 4,
  `Test 3 FAILED: targetServings should be 4, got ${scaled.targetServings}`
);
// base: 2 servings → factor = 4/2 = 2  → avocado quantity = 1 * 2 = 2
console.assert(
  scaled.scaledIngredients[1].quantity === 2,
  `Test 3 FAILED: avocado quantity should be 2, got ${scaled.scaledIngredients[1].quantity}`
);
// scaledNutrition = per-serving nutrition * targetServings = 320 * 4 = 1280
console.assert(
  scaled.scaledNutrition.calories === 1280,
  `Test 3 FAILED: scaledNutrition.calories should be 1280, got ${scaled.scaledNutrition.calories}`
);
console.log("Test 3 passed ✓ — scaleRecipe");

// ── Test 4: scaleRecipe throws on invalid targetServings ───────
let threw = false;
try {
  scaleRecipe(avocadoToast, 0);
} catch (e) {
  threw = e instanceof RangeError;
}
console.assert(threw, "Test 4 FAILED: should throw RangeError for targetServings <= 0");
console.log("Test 4 passed ✓ — scaleRecipe RangeError");

// ── Test 5: computeNutritionSummary aggregates correctly ──────
// Scale each recipe to 2 servings for a simple test
const scaledAll: ScaledRecipe[] = [
  scaleRecipe(avocadoToast, 2), // calories: 320*2=640
  scaleRecipe(grilledCheese, 2), // calories: 450*2=900
];
const summary: NutritionSummary = computeNutritionSummary(scaledAll);
console.assert(
  summary.recipeCount === 2,
  `Test 5 FAILED: recipeCount should be 2, got ${summary.recipeCount}`
);
console.assert(
  summary.totalCalories === 1540,
  `Test 5 FAILED: totalCalories should be 1540, got ${summary.totalCalories}`
);
console.assert(
  summary.averageCalories === 770,
  `Test 5 FAILED: averageCalories should be 770, got ${summary.averageCalories}`
);
console.log("Test 5 passed ✓ — computeNutritionSummary");

// ── Test 6: filterAndScale combines both operations ────────────
const scaledVegan = filterAndScale(allRecipes, "vegan", 1);
console.assert(
  scaledVegan.length === 2,
  `Test 6 FAILED: expected 2 scaled vegan recipes, got ${scaledVegan.length}`
);
console.assert(
  scaledVegan.every((r) => r.targetServings === 1),
  "Test 6 FAILED: all results should have targetServings === 1"
);
console.log("Test 6 passed ✓ — filterAndScale");

console.log("\n✅ All tests passed!");
