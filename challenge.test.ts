// challenge.test.ts
import {
  makeProductId,
  calcLineDiscount,
  buildCartSummary,
  filterByCategory,
  type CartItem,
  type CartSummary,
} from "./challenge";

// --- Mock data ---

const laptop: CartItem = {
  product: {
    id: makeProductId("prod-001"),
    name: "Laptop",
    category: "electronics",
    priceInCents: 100000, // $1000.00
  },
  quantity: 1,
  discount: { kind: "percentage", percent: 10 }, // 10% off → $100 off
};

const tShirt: CartItem = {
  product: {
    id: makeProductId("prod-002"),
    name: "T-Shirt",
    category: "clothing",
    priceInCents: 2000, // $20.00
  },
  quantity: 3,
  discount: { kind: "bxgy", buyQty: 2, getQty: 1 }, // buy 2 get 1 free → 1 free shirt = $20 off
};

const apple: CartItem = {
  product: {
    id: makeProductId("prod-003"),
    name: "Apple",
    category: "food",
    priceInCents: 150, // $1.50
  },
  quantity: 6,
  discount: { kind: "fixed", amountInCents: 200 }, // $2.00 fixed off (total $9, so $2 fine)
};

const banana: CartItem = {
  product: {
    id: makeProductId("prod-004"),
    name: "Banana",
    category: "food",
    priceInCents: 80,
  },
  quantity: 4,
  discount: null,
};

// --- Tests ---

// Test 1: calcLineDiscount — percentage
const laptopDiscount = calcLineDiscount(laptop);
console.assert(
  laptopDiscount === 10000,
  `[FAIL] Expected laptop discount 10000, got ${laptopDiscount}`
);
console.log(`[PASS] laptop percentage discount: ${laptopDiscount}`);

// Test 2: calcLineDiscount — bxgy (3 shirts, buy2get1 → 1 free)
const tShirtDiscount = calcLineDiscount(tShirt);
console.assert(
  tShirtDiscount === 2000,
  `[FAIL] Expected t-shirt discount 2000, got ${tShirtDiscount}`
);
console.log(`[PASS] t-shirt bxgy discount: ${tShirtDiscount}`);

// Test 3: calcLineDiscount — fixed (6 apples × $1.50 = $9.00 total; fixed $2 off)
const appleDiscount = calcLineDiscount(apple);
console.assert(
  appleDiscount === 200,
  `[FAIL] Expected apple discount 200, got ${appleDiscount}`
);
console.log(`[PASS] apple fixed discount: ${appleDiscount}`);

// Test 4: buildCartSummary totals
const summary: CartSummary = buildCartSummary([laptop, tShirt, apple, banana]);

// subtotal: 100000 + 6000 + 900 + 320 = 107220
console.assert(
  summary.subtotalInCents === 107220,
  `[FAIL] Expected subtotal 107220, got ${summary.subtotalInCents}`
);
console.log(`[PASS] subtotal: ${summary.subtotalInCents}`);

// discountInCents: 10000 + 2000 + 200 + 0 = 12200
console.assert(
  summary.discountInCents === 12200,
  `[FAIL] Expected discount 12200, got ${summary.discountInCents}`
);
console.log(`[PASS] total discount: ${summary.discountInCents}`);

// totalInCents: 107220 - 12200 = 95020
console.assert(
  summary.totalInCents === 95020,
  `[FAIL] Expected total 95020, got ${summary.totalInCents}`
);
console.log(`[PASS] total: ${summary.totalInCents}`);

// Test 5: filterByCategory returns only food items
const foodItems = filterByCategory(summary, "food");
console.assert(
  foodItems.length === 2 &&
    foodItems.every((i) => i.product.category === "food"),
  `[FAIL] Expected 2 food items, got ${foodItems.length}`
);
console.log(`[PASS] filterByCategory food: ${foodItems.map((i) => i.product.name).join(", ")}`);
