// ============================================================
// Typed Product Catalog Filter & Sorter
// ============================================================
// REQUIREMENTS
// 1. Define a `Category` union type for the four supported categories:
//    "electronics" | "clothing" | "books" | "home"
//
// 2. Define a `Product` interface with the following fields:
//    - id: string
//    - name: string
//    - category: Category
//    - priceUsd: number
//    - rating: number        (1–5, inclusive)
//    - inStock: boolean
//
// 3. Define a `FilterCriteria` interface. All fields are optional:
//    - category?: Category
//    - minPriceUsd?: number
//    - maxPriceUsd?: number
//    - minRating?: number
//    - inStockOnly?: boolean
//
// 4. Define a `SortKey` type — a union of the two sortable numeric
//    fields on Product: "priceUsd" | "rating"
//
// 5. Define a `SortOrder` type: "asc" | "desc"
//
// 6. Define a `SortOptions` interface:
//    - key: SortKey
//    - order: SortOrder
//
// 7. Implement `filterProducts`:
//    - Accepts a readonly array of Product and a FilterCriteria.
//    - Returns a new Product[] containing only products that satisfy
//      ALL provided criteria (omitted criteria are ignored).
//    - Must NOT mutate the input array.
//
// 8. Implement `sortProducts`:
//    - Accepts a Product[] and SortOptions.
//    - Returns a new Product[] sorted by the given key and order.
//    - Must NOT mutate the input array.
//
// 9. Implement `filterAndSort`:
//    - Composes filterProducts and sortProducts.
//    - Signature: (products: readonly Product[], filter: FilterCriteria, sort: SortOptions) => Product[]
//
// 10. Implement `groupByCategory`:
//     - Accepts a readonly Product[].
//     - Returns a Record<Category, Product[]> where every Category key
//       is always present (use an empty array when no products match).

// ----- Type Definitions -----

export type Category = TODO; // replace TODO with the correct type

export interface Product {
  // TODO: fill in all required fields
}

export interface FilterCriteria {
  // TODO: fill in all optional fields
}

export type SortKey = TODO; // replace TODO with the correct type

export type SortOrder = TODO; // replace TODO with the correct type

export interface SortOptions {
  // TODO: fill in fields
}

// ----- Function Signatures -----

export function filterProducts(
  products: readonly Product[],
  criteria: FilterCriteria
): Product[] {
  // TODO
  throw new Error("Not implemented");
}

export function sortProducts(
  products: Product[],
  options: SortOptions
): Product[] {
  // TODO
  throw new Error("Not implemented");
}

export function filterAndSort(
  products: readonly Product[],
  filter: FilterCriteria,
  sort: SortOptions
): Product[] {
  // TODO
  throw new Error("Not implemented");
}

export function groupByCategory(
  products: readonly Product[]
): Record<Category, Product[]> {
  // TODO
  throw new Error("Not implemented");
}
