// ============================================================
// Typed Shopping Cart with Discount Rules
// ============================================================
// REQUIREMENTS
// 1. Define a `Category` union of at least three literal string types:
//    "electronics" | "clothing" | "food"
//
// 2. Define a `Product` interface with:
//    - id: string (branded as ProductId)
//    - name: string
//    - category: Category
//    - priceInCents: number
//
// 3. Define a discriminated union `DiscountRule` with three variants:
//    - { kind: "percentage"; percent: number }          // e.g. 10 => 10% off
//    - { kind: "fixed"; amountInCents: number }         // e.g. 500 => $5.00 off
//    - { kind: "bxgy"; buyQty: number; getQty: number } // buy N get M free
//
// 4. Define a `CartItem` interface with:
//    - product: Product
//    - quantity: number
//    - discount: DiscountRule | null
//
// 5. Define a `CartSummary` interface with:
//    - items: ReadonlyArray<CartItem>
//    - subtotalInCents: number   // sum of (product.priceInCents * quantity) before discounts
//    - discountInCents: number   // total savings
//    - totalInCents: number      // subtotalInCents - discountInCents (never below 0)
//
// 6. Implement `makeProductId(raw: string): ProductId`
//    Returns a branded ProductId from a plain string.
//
// 7. Implement `calcLineDiscount(item: CartItem): number`
//    Returns the discount amount IN CENTS for a single CartItem.
//    Rules:
//      - "percentage": floor(priceInCents * quantity * percent / 100)
//      - "fixed":      min(amountInCents, priceInCents * quantity)  ← never over-discount
//      - "bxgy":       free units = floor(quantity / (buyQty + getQty)) * getQty
//                      discount  = free units * priceInCents
//      - null:         0
//
// 8. Implement `buildCartSummary(items: ReadonlyArray<CartItem>): CartSummary`
//    Computes subtotal, total discount (sum of calcLineDiscount per item), and total.
//    Total must never be negative.
//
// 9. Implement `filterByCategory<C extends Category>(
//      summary: CartSummary,
//      category: C
//    ): ReadonlyArray<CartItem>`
//    Returns only the items whose product.category === category.
//    The return type must use the generic C (keep it in the signature).
// ============================================================

// --- Branded type helper (do not change) ---
declare const __brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [__brand]: B };

// TODO: Define ProductId branded type
export type ProductId = Brand<string, "ProductId">;

// TODO: Define Category union
export type Category = /* your union here */ never;

// TODO: Define Product interface
export interface Product {
  id: ProductId;
  name: string;
  category: Category;
  priceInCents: number;
}

// TODO: Define DiscountRule discriminated union
export type DiscountRule =
  | { kind: "percentage"; percent: number }
  | { kind: "fixed"; amountInCents: number }
  | { kind: "bxgy"; buyQty: number; getQty: number };

// TODO: Define CartItem interface
export interface CartItem {
  product: Product;
  quantity: number;
  discount: DiscountRule | null;
}

// TODO: Define CartSummary interface
export interface CartSummary {
  items: ReadonlyArray<CartItem>;
  subtotalInCents: number;
  discountInCents: number;
  totalInCents: number;
}

// TODO: Implement makeProductId
export function makeProductId(raw: string): ProductId {
  throw new Error("Not implemented");
}

// TODO: Implement calcLineDiscount
export function calcLineDiscount(item: CartItem): number {
  throw new Error("Not implemented");
}

// TODO: Implement buildCartSummary
export function buildCartSummary(items: ReadonlyArray<CartItem>): CartSummary {
  throw new Error("Not implemented");
}

// TODO: Implement filterByCategory
export function filterByCategory<C extends Category>(
  summary: CartSummary,
  category: C
): ReadonlyArray<CartItem> {
  throw new Error("Not implemented");
}
