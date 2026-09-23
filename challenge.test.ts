// challenge.test.ts
import {
  type Unit,
  type Ingredient,
  type Recipe,
  type ScaledIngredient,
  type ScaledRecipe,
  scaleRecipe,
  findIngredientsByUnit,
} from "./challenge";

// ── Mock data ──────────────────────────────────────────────────────────

const pancakeRecipe: Recipe = {
  title: "Fluffy Pancakes",
  servings: 4,
  ingredients: [
    { name: "all-purpose flour", quantity: 1.5, unit: "cup" },
    { name: "milk",              quantity: 240,  unit: "ml"  },
    { name: "egg",               quantity: 2,    unit: "whole" },
    { name: "butter",            quantity: 2,    unit: "tbsp" },
    { name: "salt",              quantity: 1,    unit: "pinch" },
    { name: "baking powder",     quantity: 1,    unit: "tsp"  },
  ],
} as const satisfies Recipe;

// ── Tests ──────────────────────────────────────────────────────────────

// Test 1: scaleRecipe doubles servings correctly
const doubled = scaleRecipe(pancakeRecipe, 2);
console.assert(
  doubled.servings === 8,
  `[FAIL] Test 1: expected servings=8, got ${doubled.servings}`
);
console.log("[PASS] Test 1: servings doubled correctly");

// Test 2: scaleRecipe scales ingredient quantities and rounds to 2 dp
const flour = doubled.ingredients.find((i) => i.name === "all-purpose flour");
console.assert(
  flour?.quantity === 3,
  `[FAIL] Test 2: expected flour quantity=3, got ${flour?.quantity}`
);
console.log("[PASS] Test 2: ingredient quantity scaled correctly");

// Test 3: scaleRecipe with a fractional multiplier rounds to 2 dp
const halved = scaleRecipe(pancakeRecipe, 0.333);
const milk = halved.ingredients.find((i) => i.name === "milk");
console.assert(
  milk?.quantity === 79.92,
  `[FAIL] Test 3: expected milk quantity=79.92, got ${milk?.quantity}`
);
console.log("[PASS] Test 3: fractional scaling rounds to 2 decimal places");

// Test 4: findIngredientsByUnit returns only matching ingredients
const cupIngredients = findIngredientsByUnit(pancakeRecipe, "cup");
console.assert(
  cupIngredients.length === 1 && cupIngredients[0].name === "all-purpose flour",
  `[FAIL] Test 4: expected 1 cup ingredient (flour), got ${cupIngredients.length}`
);
console.log("[PASS] Test 4: findIngredientsByUnit filters correctly");

// Test 5: scaleRecipe title is preserved unchanged
console.assert(
  doubled.title === "Fluffy Pancakes",
  `[FAIL] Test 5: expected title='Fluffy Pancakes', got '${doubled.title}'`
);
console.log("[PASS] Test 5: recipe title preserved after scaling");

console.log("\nAll tests complete.");
