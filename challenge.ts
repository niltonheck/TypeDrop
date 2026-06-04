// ============================================================
// challenge.ts — Typed Product Inventory Aggregator
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every TODO to make the test harness pass.
// ============================================================

// -----------------------------------------------------------
// 1. CORE DOMAIN TYPES
// -----------------------------------------------------------

/** All supported product categories (extend if needed). */
export type Category = "electronics" | "apparel" | "grocery" | "furniture";

/**
 * A validated inventory record.
 * `discountedPrice` is derived — NOT present in raw input.
 */
export interface Product {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;       // must be > 0
  stockUnits: number;     // must be >= 0, integer
  warehouseCode: string;  // non-empty string
}

// -----------------------------------------------------------
// 2. RESULT TYPE  (no throwing — return errors as values)
// -----------------------------------------------------------

export type Result<T, E> =
  | { ok: true;  value: T }
  | { ok: false; error: E };

// -----------------------------------------------------------
// 3. VALIDATION
// -----------------------------------------------------------

export type ValidationError = {
  field: string;
  message: string;
};

/**
 * TODO: Implement runtime validation of a single raw record.
 *
 * Requirements:
 *  R1. Return `Result<Product, ValidationError[]>`.
 *  R2. Collect ALL field errors before returning — do not short-circuit.
 *  R3. Validate:
 *        - id        → non-empty string
 *        - name      → non-empty string
 *        - category  → one of the Category union members
 *        - priceUsd  → number > 0
 *        - stockUnits→ integer number >= 0
 *        - warehouseCode → non-empty string
 *  R4. On success return `{ ok: true, value: Product }`.
 *  R5. On failure return `{ ok: false, error: ValidationError[] }`.
 */
export function validateProduct(raw: unknown): Result<Product, ValidationError[]> {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 4. DISCOUNT STRATEGY REGISTRY
// -----------------------------------------------------------

/**
 * A discount strategy receives a validated Product and returns
 * the discounted price (a number >= 0).
 */
export type DiscountStrategy = (product: Product) => number;

/**
 * The registry maps every Category to exactly one DiscountStrategy.
 * TODO: Declare the type of `discountRegistry` using a mapped type
 *       over `Category` so that every category MUST be present.
 */
export type DiscountRegistry = {
  // TODO: mapped type — every Category key → DiscountStrategy
  [K in Category]: DiscountStrategy;
};

/**
 * TODO: Provide a default registry with these rules:
 *  - electronics : 10 % off
 *  - apparel     : 20 % off
 *  - grocery     :  5 % off
 *  - furniture   : 15 % off
 *
 * Use the `satisfies` operator to verify it matches DiscountRegistry.
 */
export const defaultDiscountRegistry: DiscountRegistry =
  // TODO — use `satisfies DiscountRegistry` on the object literal
  {} as DiscountRegistry; // ← replace this stub

// -----------------------------------------------------------
// 5. PER-CATEGORY SUMMARY
// -----------------------------------------------------------

/**
 * Aggregated summary for one category.
 */
export interface CategorySummary {
  category: Category;
  totalProducts: number;       // count of valid products in this category
  totalStockUnits: number;     // sum of stockUnits
  totalStockValueUsd: number;  // sum of (discountedPrice × stockUnits)
  averageDiscountedPriceUsd: number; // mean discounted price across products
  warehouseCodes: Set<string>; // distinct warehouse codes
}

/**
 * The final report is a Record keyed by every Category that
 * had at least one valid product.
 *
 * TODO: Declare `InventoryReport` as a mapped type that makes
 *       every Category key optional (a category may have no products)
 *       but the value type is always CategorySummary.
 */
export type InventoryReport = {
  // TODO: mapped type with optional keys over Category
  [K in Category]?: CategorySummary;
};

// -----------------------------------------------------------
// 6. MAIN AGGREGATOR
// -----------------------------------------------------------

export interface AggregatorResult {
  report: InventoryReport;
  validCount: number;
  invalidCount: number;
  /** All validation errors, keyed by the raw record's `id` field
   *  (or "__unknown__" when id is itself invalid). */
  errors: Record<string, ValidationError[]>;
}

/**
 * TODO: Implement the aggregator.
 *
 * Requirements:
 *  R6.  Accept `rawRecords: unknown[]` and an optional
 *       `registry: DiscountRegistry` (default: `defaultDiscountRegistry`).
 *  R7.  Validate each record with `validateProduct`.
 *  R8.  For invalid records accumulate errors in `AggregatorResult.errors`
 *       using the raw `id` string when available, else "__unknown__".
 *  R9.  For valid records compute `discountedPrice` via the registry:
 *         discountedPrice = registry[product.category](product)
 *  R10. Aggregate per-category into `InventoryReport`:
 *         - totalProducts          += 1
 *         - totalStockUnits        += product.stockUnits
 *         - totalStockValueUsd     += discountedPrice × product.stockUnits
 *         - averageDiscountedPriceUsd = mean across all products in category
 *         - warehouseCodes           = Set of distinct codes
 *  R11. Return the full `AggregatorResult`.
 */
export function aggregateInventory(
  rawRecords: unknown[],
  registry: DiscountRegistry = defaultDiscountRegistry
): AggregatorResult {
  // TODO
  throw new Error("Not implemented");
}
