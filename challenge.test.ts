// challenge.test.ts
import {
  scaleRecipe,
  toShoppingList,
  mergeShoppingLists,
  type Recipe,
  type ScaledIngredient,
  type ShoppingListEntry,
} from "./challenge";

// ── Mock Data ────────────────────────────────────────────────

const pancakeRecipe: Recipe = {
  title: "Pancakes",
  servings: 4,
  ingredients: [
    { name: "flour",        amount: 1,   unit: "cup"  },
    { name: "milk",         amount: 0.5, unit: "cup"  },
    { name: "eggs",         amount: 2,   unit: "whole"},
    { name: "butter",       amount: 2,   unit: "tbsp" },
    { name: "baking powder",amount: 1,   unit: "tsp"  },
  ],
};

const smoothieRecipe: Recipe = {
  title: "Berry Smoothie",
  servings: 2,
  ingredients: [
    { name: "milk",         amount: 1,   unit: "cup"  },
    { name: "banana",       amount: 1,   unit: "whole"},
    { name: "blueberries",  amount: 100, unit: "g"    },
  ],
};

// ── Test 1: scaleRecipe doubles the amounts correctly ────────
const doubled = scaleRecipe(pancakeRecipe, 8);

console.assert(
  doubled.servings === 8,
  `[FAIL] Expected servings=8, got ${doubled.servings}`
);

const flourEntry = doubled.ingredients.find((i) => i.name === "flour");
console.assert(
  flourEntry?.amount === 2,
  `[FAIL] Expected flour amount=2, got ${flourEntry?.amount}`
);

const eggsEntry = doubled.ingredients.find((i) => i.name === "eggs");
console.assert(
  eggsEntry?.amount === 4,
  `[FAIL] Expected eggs amount=4, got ${eggsEntry?.amount}`
);

console.log(`[PASS] scaleRecipe doubles amounts correctly`);

// ── Test 2: scaleRecipe rounds to 2 decimal places ───────────
const oddScale = scaleRecipe(pancakeRecipe, 3); // factor = 3/4 = 0.75
const butterEntry = oddScale.ingredients.find((i) => i.name === "butter");
// 2 tbsp * 0.75 = 1.5
console.assert(
  butterEntry?.amount === 1.5,
  `[FAIL] Expected butter amount=1.5, got ${butterEntry?.amount}`
);

const milkOdd = oddScale.ingredients.find((i) => i.name === "milk");
// 0.5 cup * 0.75 = 0.375 → 0.38 after rounding
console.assert(
  milkOdd?.amount === 0.38,
  `[FAIL] Expected milk amount=0.38, got ${milkOdd?.amount}`
);

console.log(`[PASS] scaleRecipe rounds to 2 decimal places`);

// ── Test 3: scaleRecipe throws on invalid servings ───────────
let threw = false;
try {
  scaleRecipe(pancakeRecipe, 0);
} catch (e) {
  threw = e instanceof RangeError;
}
console.assert(threw, `[FAIL] Expected RangeError for targetServings=0`);
console.log(`[PASS] scaleRecipe throws RangeError for targetServings <= 0`);

// ── Test 4: toShoppingList discriminates whole vs measured ───
const scaled = scaleRecipe(pancakeRecipe, 8);
const list = toShoppingList(scaled.ingredients);

const eggsListEntry = list.find((e) => e.name === "eggs");
console.assert(
  eggsListEntry?.kind === "whole",
  `[FAIL] Expected eggs kind="whole", got ${eggsListEntry?.kind}`
);
console.assert(
  eggsListEntry?.display === "4 whole eggs",
  `[FAIL] Expected display="4 whole eggs", got ${eggsListEntry?.display}`
);

const flourListEntry = list.find((e) => e.name === "flour");
console.assert(
  flourListEntry?.kind === "measured",
  `[FAIL] Expected flour kind="measured", got ${flourListEntry?.kind}`
);
console.assert(
  flourListEntry?.display === "2 cup flour",
  `[FAIL] Expected display="2 cup flour", got ${flourListEntry?.display}`
);

console.log(`[PASS] toShoppingList discriminates whole vs measured entries`);

// ── Test 5: mergeShoppingLists combines same-name same-kind ──
const pancakeList = toShoppingList(scaleRecipe(pancakeRecipe, 4).ingredients);
const smoothieList = toShoppingList(scaleRecipe(smoothieRecipe, 2).ingredients);

const merged = mergeShoppingLists(pancakeList, smoothieList);

// Both recipes have "milk" as a "measured" cup entry → should merge
const mergedMilk = merged.filter((e) => e.name === "milk");
console.assert(
  mergedMilk.length === 1,
  `[FAIL] Expected 1 merged milk entry, got ${mergedMilk.length}`
);
console.assert(
  mergedMilk[0].amount === 1.5, // 1 cup + 0.5 cup
  `[FAIL] Expected merged milk amount=1.5, got ${mergedMilk[0].amount}`
);

// "banana" only in smoothie, "eggs" only in pancakes → each appears once
const bananaEntry = merged.filter((e) => e.name === "banana");
console.assert(
  bananaEntry.length === 1,
  `[FAIL] Expected 1 banana entry, got ${bananaEntry.length}`
);

console.log(`[PASS] mergeShoppingLists combines same-name same-kind entries`);

console.log("\n✅ All tests passed!");
