// ============================================================
// challenge.test.ts
// Run with:  npx ts-node --strict challenge.test.ts
// ============================================================
import {
  toBaseUnit,
  calculateRecipeCost,
  summarizeMenu,
  filterByMaxCostPerServing,
  type IngredientPrice,
  type Recipe,
  type RecipeCost,
} from "./challenge";

// ── Mock price list ──────────────────────────────────────────
const prices: readonly IngredientPrice[] = [
  { name: "flour",  pricePerBaseUnit: 0.002,  baseUnit: "g"    }, // $0.002 / g
  { name: "butter", pricePerBaseUnit: 0.008,  baseUnit: "g"    }, // $0.008 / g
  { name: "milk",   pricePerBaseUnit: 0.0015, baseUnit: "ml"   }, // $0.0015 / ml
  { name: "egg",    pricePerBaseUnit: 0.30,   baseUnit: "unit" }, // $0.30 / egg
  { name: "oil",    pricePerBaseUnit: 0.003,  baseUnit: "ml"   }, // $0.003 / ml
];

// ── Mock recipes ─────────────────────────────────────────────
const pancakes: Recipe = {
  id: "r1",
  name: "Pancakes",
  servings: 4,
  ingredients: [
    { ingredientName: "flour",  quantity: 0.2,  unit: "kg"   }, // 200 g  → $0.40
    { ingredientName: "milk",   quantity: 0.3,  unit: "l"    }, // 300 ml → $0.45
    { ingredientName: "egg",    quantity: 2,    unit: "unit" }, //         → $0.60
    { ingredientName: "butter", quantity: 50,   unit: "g"    }, //         → $0.40
    // total $1.85 / 4 servings = $0.4625 → $0.46
  ],
};

const steakDinner: Recipe = {
  id: "r2",
  name: "Steak Dinner",
  servings: 2,
  ingredients: [
    { ingredientName: "butter", quantity: 0.1,  unit: "kg"   }, // 100 g  → $0.80
    { ingredientName: "oil",    quantity: 50,   unit: "ml"   }, //         → $0.15
    // total $0.95 / 2 servings = $0.475 → $0.48
    // (steak itself is not in price list → $0)
  ],
};

const simpleSalad: Recipe = {
  id: "r3",
  name: "Simple Salad",
  servings: 2,
  ingredients: [
    { ingredientName: "oil",    quantity: 0.02, unit: "l"    }, // 20 ml  → $0.06
    // total $0.06 / 2 servings = $0.03
  ],
};

const THRESHOLD = 0.45; // $0.45 per serving

// ── Test 1: toBaseUnit ───────────────────────────────────────
console.assert(toBaseUnit(1,    "kg")   === 1000, "1 kg → 1000 g");
console.assert(toBaseUnit(0.5,  "l")    === 500,  "0.5 l → 500 ml");
console.assert(toBaseUnit(200,  "g")    === 200,  "200 g stays 200");
console.assert(toBaseUnit(3,    "unit") === 3,    "3 unit stays 3");

// ── Test 2: calculateRecipeCost ──────────────────────────────
const pancakeCost: RecipeCost = calculateRecipeCost(pancakes, prices, THRESHOLD);
console.assert(pancakeCost.totalCost      === 1.85, `Pancake totalCost: expected 1.85, got ${pancakeCost.totalCost}`);
console.assert(pancakeCost.costPerServing === 0.46, `Pancake costPerServing: expected 0.46, got ${pancakeCost.costPerServing}`);
console.assert(pancakeCost.isExpensive    === true, "Pancakes should be expensive (0.46 > 0.45)");

const saladCost: RecipeCost = calculateRecipeCost(simpleSalad, prices, THRESHOLD);
console.assert(saladCost.totalCost      === 0.06, `Salad totalCost: expected 0.06, got ${saladCost.totalCost}`);
console.assert(saladCost.costPerServing === 0.03, `Salad costPerServing: expected 0.03, got ${saladCost.costPerServing}`);
console.assert(saladCost.isExpensive    === false, "Salad should NOT be expensive");

// ── Test 3: summarizeMenu ────────────────────────────────────
const steakCost: RecipeCost  = calculateRecipeCost(steakDinner, prices, THRESHOLD);
const allCosts: readonly RecipeCost[] = [pancakeCost, steakCost, saladCost];

const summary = summarizeMenu(allCosts);
console.assert(summary.totalRecipes    === 3,    `totalRecipes: expected 3, got ${summary.totalRecipes}`);
console.assert(summary.expensiveCount  === 2,    `expensiveCount: expected 2, got ${summary.expensiveCount}`);
console.assert(summary.cheapestRecipe.recipeId  === "r3", `cheapest should be salad, got ${summary.cheapestRecipe.recipeId}`);
console.assert(summary.mostExpensiveRecipe.recipeId === "r2" || summary.mostExpensiveRecipe.recipeId === "r1",
  `mostExpensive should be steak or pancakes, got ${summary.mostExpensiveRecipe.recipeId}`);

// RangeError on empty input
let threw = false;
try { summarizeMenu([]); } catch (e) { threw = e instanceof RangeError; }
console.assert(threw, "summarizeMenu([]) must throw a RangeError");

// ── Test 4: filterByMaxCostPerServing ────────────────────────
const affordable = filterByMaxCostPerServing(allCosts, 0.45);
console.assert(affordable.length === 1, `Expected 1 affordable recipe, got ${affordable.length}`);
console.assert(affordable[0].recipeId === "r3", `Expected salad, got ${affordable[0].recipeId}`);

console.log("All tests passed! ✅");
