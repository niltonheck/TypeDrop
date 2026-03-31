// ============================================================
// Typed Product Inventory Filter & Sorter
// challenge.ts — fill in every TODO. No `any` allowed.
// ============================================================

// ------------------------------------------------------------------
// 1. DOMAIN TYPES
// ------------------------------------------------------------------

/** All valid product categories in the storefront. */
export type Category = "electronics" | "clothing" | "food" | "books" | "toys";

/** A product as it arrives from an untrusted external source (CSV, API, etc.). */
export interface RawProduct {
  id: unknown;
  name: unknown;
  category: unknown;
  priceUsd: unknown;
  inStock: unknown;
}

/** A validated, fully-typed product record. */
export interface Product {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;
  inStock: boolean;
}

// ------------------------------------------------------------------
// 2. VALIDATION RESULT  (Result<T, E> pattern)
// ------------------------------------------------------------------

export type ValidationOk<T> = { ok: true; value: T };
export type ValidationErr = { ok: false; field: string; reason: string };
export type ValidationResult<T> = ValidationOk<T> | ValidationErr;

// ------------------------------------------------------------------
// 3. FILTER & SORT OPTIONS
// ------------------------------------------------------------------

export type SortField = "priceUsd" | "name";
export type SortDirection = "asc" | "desc";

export interface FilterOptions {
  /** Keep only products in these categories. Omit (or empty array) = no filter. */
  categories?: Category[];
  /** Inclusive minimum price. Omit = no lower bound. */
  minPrice?: number;
  /** Inclusive maximum price. Omit = no upper bound. */
  maxPrice?: number;
  /** When true, return only products where inStock === true. */
  onlyInStock?: boolean;
}

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

// ------------------------------------------------------------------
// 4. CATALOG RESULT
// ------------------------------------------------------------------

/** Returned by `processCatalog`. */
export interface CatalogResult {
  /** Successfully validated and filtered+sorted products. */
  products: Product[];
  /** One entry per raw product that failed validation. */
  errors: Array<{ rawId: unknown; field: string; reason: string }>;
}

// ------------------------------------------------------------------
// 5. YOUR TASKS
// ------------------------------------------------------------------

/**
 * TODO 1 — Validate a single RawProduct.
 *
 * Requirements:
 *  - `id`       must be a non-empty string
 *  - `name`     must be a non-empty string
 *  - `category` must be one of the Category union values
 *  - `priceUsd` must be a finite number >= 0
 *  - `inStock`  must be a boolean
 *
 * Return `ValidationOk<Product>` on success, or `ValidationErr`
 * describing the FIRST failing field (check in the order listed above).
 */
export function validateProduct(raw: RawProduct): ValidationResult<Product> {
  // TODO: implement validation
  throw new Error("Not implemented");
}

/**
 * TODO 2 — Filter an array of valid Products.
 *
 * Requirements:
 *  - If `options.categories` is a non-empty array, keep only products
 *    whose category is included in it.
 *  - If `options.minPrice` is defined, exclude products with priceUsd < minPrice.
 *  - If `options.maxPrice` is defined, exclude products with priceUsd > maxPrice.
 *  - If `options.onlyInStock` is true, exclude products where inStock === false.
 *  - All conditions are ANDed together.
 *  - Returning the original array (mutating it) is not allowed — return a new array.
 */
export function filterProducts(
  products: Product[],
  options: FilterOptions
): Product[] {
  // TODO: implement filtering
  throw new Error("Not implemented");
}

/**
 * TODO 3 — Sort an array of valid Products.
 *
 * Requirements:
 *  - Sort by `options.field` in `options.direction` order.
 *  - For `name`, use locale-aware string comparison (localeCompare).
 *  - For `priceUsd`, use numeric comparison.
 *  - Ties in the primary field must be broken by `id` ascending (localeCompare).
 *  - Do NOT mutate the input array — return a new sorted array.
 */
export function sortProducts(
  products: Product[],
  options: SortOptions
): Product[] {
  // TODO: implement sorting
  throw new Error("Not implemented");
}

/**
 * TODO 4 — Orchestrate the full pipeline.
 *
 * Requirements:
 *  1. Validate every RawProduct with `validateProduct`.
 *  2. Collect validation errors; keep only the valid Products.
 *  3. Apply `filterProducts` to the valid set.
 *  4. Apply `sortProducts` to the filtered set.
 *  5. Return a `CatalogResult` with the final product list and all errors.
 */
export function processCatalog(
  rawProducts: RawProduct[],
  filter: FilterOptions,
  sort: SortOptions
): CatalogResult {
  // TODO: implement orchestration
  throw new Error("Not implemented");
}
