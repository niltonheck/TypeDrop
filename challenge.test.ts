// challenge.test.ts
import {
  toServingCount,
  toQuantity,
  scaleRecipe,
  convertMeasurement,
  buildShoppingList,
  UNIT_TO_BASE,
  FAMILY_BASE_UNIT,
  type Recipe,
  type Ingredient,
  type ServingCount,
  type Quantity,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function assertNonNull<T>(v: T | null, label: string): T {
  console.assert(v !== null, `❌ Expected non-null for: ${label}`);
  if (v === null) throw new Error(label);
  return v;
}

// ── Mock data ────────────────────────────────────────────────

const servings4 = assertNonNull(toServingCount(4), "servings4");
const servings2 = assertNonNull(toServingCount(2), "servings2");
const servings8 = assertNonNull(toServingCount(8), "servings8");

const pancakeRecipe: Recipe = {
  name: "Pancakes",
  servings: servings4,
  ingredients: [
    {
      name: "all-purpose flour",
      measurement: {
        kind: "mass",
        quantity: assertNonNull(toQuantity(240), "flour 240g"),
        unit: "g",
      },
    },
    {
      name: "milk",
      measurement: {
        kind: "volume",
        quantity: assertNonNull(toQuantity(2), "milk 2 cups"),
        unit: "cup",
      },
    },
    {
      name: "eggs",
      measurement: {
        kind: "count",
        quantity: assertNonNull(toQuantity(2), "eggs 2"),
        unit: "count",
      },
    },
  ],
};

const smoothieRecipe: Recipe = {
  name: "Berry Smoothie",
  servings: servings2,
  ingredients: [
    {
      name: "milk",
      measurement: {
        kind: "volume",
        quantity: assertNonNull(toQuantity(300), "milk 300ml"),
        unit: "ml",
      },
    },
    {
      name: "all-purpose flour", // unusual but tests aggregation across families if kind differs
      measurement: {
        kind: "mass",
        quantity: assertNonNull(toQuantity(50), "flour 50g"),
        unit: "g",
      },
    },
  ],
};

// ── Test 1: toServingCount rejects invalid values ────────────
console.assert(toServingCount(0) === null,   "❌ Test 1a: 0 should be invalid serving count");
console.assert(toServingCount(-3) === null,  "❌ Test 1b: -3 should be invalid serving count");
console.assert(toServingCount(4) !== null,   "❌ Test 1c: 4 should be a valid serving count");
console.log("✅ Test 1 passed: toServingCount validation");

// ── Test 2: scaleRecipe doubles quantities ───────────────────
const doubled = scaleRecipe(pancakeRecipe, servings8);
console.assert(doubled.servings === 8, "❌ Test 2a: scaled servings should be 8");

const flourIngredient = doubled.ingredients.find(i => i.name === "all-purpose flour");
console.assert(
  flourIngredient?.measurement.quantity === 480,
  `❌ Test 2b: flour should scale to 480g, got ${flourIngredient?.measurement.quantity}`
);

const eggsIngredient = doubled.ingredients.find(i => i.name === "eggs");
console.assert(
  eggsIngredient?.measurement.quantity === 4,
  `❌ Test 2c: eggs should scale to 4, got ${eggsIngredient?.measurement.quantity}`
);
console.log("✅ Test 2 passed: scaleRecipe doubles correctly");

// ── Test 3: convertMeasurement volume conversion ─────────────
const milkCups = pancakeRecipe.ingredients.find(i => i.name === "milk")!.measurement;
if (milkCups.kind !== "volume") throw new Error("Expected volume");

const milkInMl = convertMeasurement(milkCups, "ml");
const expectedMl = 2 * UNIT_TO_BASE["cup"].baseValue; // 2 cups → ml
console.assert(
  Math.abs(milkInMl.quantity - expectedMl) < 0.01,
  `❌ Test 3a: 2 cups should convert to ~${expectedMl}ml, got ${milkInMl.quantity}`
);
console.assert(milkInMl.unit === "ml",  "❌ Test 3b: converted unit should be 'ml'");
console.assert(milkInMl.kind === "volume", "❌ Test 3c: kind should remain 'volume'");
console.log("✅ Test 3 passed: convertMeasurement volume");

// ── Test 4: UNIT_TO_BASE completeness ────────────────────────
const expectedUnits: string[] = ["tsp","tbsp","fl_oz","cup","ml","l","oz","lb","g","kg","count"];
for (const u of expectedUnits) {
  console.assert(
    u in UNIT_TO_BASE,
    `❌ Test 4: UNIT_TO_BASE missing key "${u}"`
  );
}
console.log("✅ Test 4 passed: UNIT_TO_BASE is complete");

// ── Test 5: buildShoppingList aggregates & sorts ─────────────
const scaled1 = scaleRecipe(pancakeRecipe, servings4); // unchanged
const scaled2 = scaleRecipe(smoothieRecipe, servings2); // unchanged

const list = buildShoppingList([scaled1, scaled2]);

// Should be sorted alphabetically
const names = list.map(e => e.name);
const sortedNames = [...names].sort();
console.assert(
  JSON.stringify(names) === JSON.stringify(sortedNames),
  `❌ Test 5a: shopping list not sorted — got [${names.join(", ")}]`
);

// "milk" appears in both recipes as volume → should be one aggregated entry
const milkEntry = list.find(e => e.name === "milk");
console.assert(milkEntry !== undefined, "❌ Test 5b: 'milk' entry missing from shopping list");
console.assert(milkEntry?.baseUnit === "ml", `❌ Test 5c: milk base unit should be 'ml', got ${milkEntry?.baseUnit}`);

// milk total: 2 cups (pancake) + 300ml (smoothie)
const expectedMilkTotal = 2 * UNIT_TO_BASE["cup"].baseValue + 300;
console.assert(
  Math.abs((milkEntry?.totalBaseQuantity ?? 0) - expectedMilkTotal) < 0.01,
  `❌ Test 5d: milk total should be ~${expectedMilkTotal}ml, got ${milkEntry?.totalBaseQuantity}`
);
console.log("✅ Test 5 passed: buildShoppingList aggregation & sorting");

// ── Test 6: FAMILY_BASE_UNIT lookup ──────────────────────────
console.assert(FAMILY_BASE_UNIT["volume"] === "ml",    "❌ Test 6a: volume base unit should be 'ml'");
console.assert(FAMILY_BASE_UNIT["mass"]   === "g",     "❌ Test 6b: mass base unit should be 'g'");
console.assert(FAMILY_BASE_UNIT["count"]  === "count", "❌ Test 6c: count base unit should be 'count'");
console.log("✅ Test 6 passed: FAMILY_BASE_UNIT values correct");

console.log("\n🎉 All tests passed!");
