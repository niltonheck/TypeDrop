// ============================================================
// challenge.ts — Typed Product Catalog Filter & Facet Engine
// ============================================================
// Scenario: You are building the search & browse layer for an
// e-commerce platform. Raw catalog entries arrive as `unknown`
// JSON. Your engine must:
//   1. Validate & narrow unknown input into typed Product records
//   2. Apply a composable set of typed filters (price, category,
//      availability, rating)
//   3. Produce a FacetedResult with the filtered products AND
//      aggregated facets (category counts, price buckets, stock)
//
// Rules:
//   - No `any`, no type assertions (`as`), no `@ts-ignore`
//   - strict: true must pass
//   - All filter fields are optional; omitting one means "no filter"
// ============================================================

// -----------------------------------------------------------
// 1. DOMAIN TYPES
// -----------------------------------------------------------

export type Category =
  | "electronics"
  | "clothing"
  | "home"
  | "sports"
  | "books";

export type PriceBucket = "0-25" | "25-50" | "50-100" | "100-250" | "250+";

export interface Product {
  id: string;
  name: string;
  category: Category;
  priceUSD: number;       // positive number
  rating: number;         // 0–5 inclusive
  inStock: boolean;
  tags: string[];
}

// -----------------------------------------------------------
// 2. FILTER TYPES
// -----------------------------------------------------------

export interface PriceRange {
  minUSD?: number;
  maxUSD?: number;
}

/**
 * Every field is optional — omitting it means "no filter on this axis".
 * When `categories` is provided it acts as an OR filter (product must
 * belong to at least one of the listed categories).
 * When `tags` is provided the product must match ALL listed tags.
 */
export interface CatalogFilter {
  priceRange?: PriceRange;
  categories?: Category[];
  minRating?: number;     // inclusive lower bound, 0–5
  inStockOnly?: boolean;
  tags?: string[];        // product must have ALL of these tags
}

// -----------------------------------------------------------
// 3. FACET / RESULT TYPES
// -----------------------------------------------------------

/** How many products fall into each category (only populated categories). */
export type CategoryFacet = Partial<Record<Category, number>>;

/** How many products fall into each price bucket. */
export type PriceFacet = Partial<Record<PriceBucket, number>>;

export interface FacetSummary {
  byCategory: CategoryFacet;
  byPriceBucket: PriceFacet;
  inStockCount: number;
  outOfStockCount: number;
}

export interface FacetedResult {
  products: Product[];        // filtered list, original order preserved
  totalCount: number;         // === products.length
  facets: FacetSummary;       // computed over the FILTERED products
}

// -----------------------------------------------------------
// 4. VALIDATION — unknown → Product
// -----------------------------------------------------------

/**
 * TODO: Implement this type guard.
 *
 * Requirements:
 *  R1. Return true only when `value` is a non-null object with all
 *      required Product fields present and of the correct types.
 *  R2. `category` must be one of the five valid Category literals.
 *  R3. `priceUSD` must be a finite positive number.
 *  R4. `rating` must be a number in [0, 5].
 *  R5. `tags` must be an array of strings (may be empty).
 *  R6. Use NO type assertions — rely on narrowing only.
 */
export function isProduct(value: unknown): value is Product {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement this parser.
 *
 * Requirements:
 *  R7.  Accept a `unknown` value (e.g. parsed JSON array).
 *  R8.  Return only the elements that pass `isProduct`.
 *  R9.  Silently skip invalid entries (no throwing).
 *  R10. The return type must be `Product[]` — inferred from R8, not cast.
 */
export function parseProducts(raw: unknown): Product[] {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 5. PRICE BUCKET HELPER
// -----------------------------------------------------------

/**
 * TODO: Implement this pure helper.
 *
 * Requirements:
 *  R11. Map a price (USD) to the correct PriceBucket:
 *         0 ≤ p < 25   → "0-25"
 *        25 ≤ p < 50   → "25-50"
 *        50 ≤ p < 100  → "50-100"
 *       100 ≤ p < 250  → "100-250"
 *       250 ≤ p        → "250+"
 *  R12. Return type must be the branded `PriceBucket` union, not string.
 */
export function getPriceBucket(priceUSD: number): PriceBucket {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 6. FILTER ENGINE
// -----------------------------------------------------------

/**
 * TODO: Implement this function.
 *
 * Requirements:
 *  R13. Apply each present filter field independently (AND logic between
 *       different filter axes).
 *  R14. `categories` filter: product.category must be in the array (OR).
 *  R15. `priceRange` filter: apply minUSD and/or maxUSD bounds (inclusive).
 *  R16. `minRating` filter: product.rating >= minRating.
 *  R17. `inStockOnly` filter: when true, exclude out-of-stock products.
 *  R18. `tags` filter: product must contain ALL specified tags.
 *  R19. Preserve the original order of `products`.
 */
export function applyFilter(
  products: Product[],
  filter: CatalogFilter
): Product[] {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 7. FACET BUILDER
// -----------------------------------------------------------

/**
 * TODO: Implement this function.
 *
 * Requirements:
 *  R20. Compute byCategory: count products per category (omit zero-count
 *       categories — use Partial<Record<...>>).
 *  R21. Compute byPriceBucket: count products per PriceBucket (omit zeros).
 *  R22. Compute inStockCount and outOfStockCount.
 *  R23. All counts are derived from the `products` array passed in
 *       (i.e. the already-filtered list).
 */
export function buildFacets(products: Product[]): FacetSummary {
  // TODO
  throw new Error("Not implemented");
}

// -----------------------------------------------------------
// 8. MAIN ENTRY POINT
// -----------------------------------------------------------

/**
 * TODO: Implement this orchestrator.
 *
 * Requirements:
 *  R24. Parse `rawCatalog` with `parseProducts`.
 *  R25. Apply `filter` with `applyFilter`.
 *  R26. Build facets with `buildFacets` over the filtered list.
 *  R27. Return a `FacetedResult` with products, totalCount, and facets.
 */
export function searchCatalog(
  rawCatalog: unknown,
  filter: CatalogFilter
): FacetedResult {
  // TODO
  throw new Error("Not implemented");
}
