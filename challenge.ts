// ============================================================
// Typed Product Catalog Filter & Sorter
// ============================================================
// GOAL: Implement the three functions below so the catalog
// engine can validate raw filter inputs, apply them to a
// product list, and return sorted results — with zero `any`.
// ============================================================

// ----------------------------------------------------------
// 1. Core domain types
// ----------------------------------------------------------

export type Category = "electronics" | "clothing" | "books" | "home" | "sports";

export type Product = {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;
  inStock: boolean;
  rating: number; // 0–5
};

// ----------------------------------------------------------
// 2. Filter & Sort types
// ----------------------------------------------------------

/**
 * Raw filter input that arrives from a query string / form.
 * All fields are optional and unvalidated.
 */
export type RawFilterInput = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStockOnly?: string; // "true" | "false" | anything else
};

/**
 * A validated, type-safe filter.
 * Only fields that were successfully parsed are present.
 */
export type ValidatedFilter = {
  category?: Category;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
};

export type SortField = "priceUsd" | "rating" | "name";
export type SortDirection = "asc" | "desc";

export type SortOptions = {
  field: SortField;
  direction: SortDirection;
};

// ----------------------------------------------------------
// 3. Result type for validation errors
// ----------------------------------------------------------

export type ValidationError = {
  field: keyof RawFilterInput;
  message: string;
};

// A simple Result discriminated union — no third-party libs.
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; errors: E[] };

// ----------------------------------------------------------
// 4. TODO — implement these three functions
// ----------------------------------------------------------

/**
 * TODO: Parse and validate a `RawFilterInput`.
 *
 * Requirements (each is independently validated):
 *   1. If `category` is present, it must be one of the valid
 *      Category values; otherwise emit a ValidationError for
 *      the "category" field.
 *   2. If `minPrice` is present, it must parse to a finite
 *      non-negative number; otherwise emit a ValidationError
 *      for the "minPrice" field.
 *   3. If `maxPrice` is present, it must parse to a finite
 *      non-negative number; otherwise emit a ValidationError
 *      for the "maxPrice" field.
 *   4. If BOTH minPrice and maxPrice are valid numbers and
 *      minPrice > maxPrice, emit an additional ValidationError
 *      for "minPrice" (message of your choice).
 *   5. If `inStockOnly` is present, accept only "true" or
 *      "false" (case-sensitive); otherwise emit a
 *      ValidationError for the "inStockOnly" field.
 *   6. Return `{ ok: true, value: ValidatedFilter }` when
 *      there are zero errors, otherwise `{ ok: false, errors }`.
 */
export function validateFilter(
  raw: RawFilterInput
): Result<ValidatedFilter, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Apply a `ValidatedFilter` to an array of products.
 *
 * Requirements:
 *   1. If `filter.category` is set, keep only products whose
 *      category matches exactly.
 *   2. If `filter.minPrice` is set, keep only products with
 *      priceUsd >= minPrice.
 *   3. If `filter.maxPrice` is set, keep only products with
 *      priceUsd <= maxPrice.
 *   4. If `filter.inStockOnly` is true, keep only in-stock
 *      products. If false (or undefined), do NOT filter by
 *      stock at all.
 *   5. Return a NEW array (do not mutate the input).
 */
export function applyFilter(
  products: Product[],
  filter: ValidatedFilter
): Product[] {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Sort an array of products by the given SortOptions.
 *
 * Requirements:
 *   1. Sort by `options.field` in `options.direction` order.
 *   2. For "name", use locale-aware string comparison
 *      (`localeCompare`).
 *   3. For "priceUsd" and "rating", use numeric comparison.
 *   4. Return a NEW array (do not mutate the input).
 *   5. The function must be generic enough that TypeScript
 *      infers the return type as `Product[]` without casting.
 */
export function sortProducts(
  products: Product[],
  options: SortOptions
): Product[] {
  // TODO
  throw new Error("Not implemented");
}
