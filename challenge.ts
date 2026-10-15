// ============================================================
// challenge.ts — Typed Product Catalog Filter & Grouper
// ============================================================
// RULES: strict: true, no `any`, no type assertions (`as`).
// Fill in every spot marked TODO.
// ============================================================

// --------------- Domain Types --------------------------------

export type Category = "electronics" | "clothing" | "books" | "home";

export type Product = {
  id: string;
  name: string;
  category: Category;
  priceUsd: number;
  inStock: boolean;
  rating: number; // 0–5
};

// --------------- Requirement 1 --------------------------------
// Define `FilterCriteria` as a mapped type over Product so that:
//   - Every key is OPTIONAL
//   - Scalar fields (string, number, boolean, Category) use an
//     exact-match value  (same type as the Product field)
//   - No extra keys are allowed (only keys that exist on Product)
//
// TODO: replace `unknown` with the correct mapped type
export type FilterCriteria = {
  [K in keyof Product]?: Product[K];
};

// --------------- Requirement 2 --------------------------------
// `filterProducts` must accept a readonly array of Products and
// a FilterCriteria, then return only the products that match
// ALL supplied criteria fields (logical AND).
//
// TODO: implement the function body
export function filterProducts(
  products: ReadonlyArray<Product>,
  criteria: FilterCriteria
): Product[] {
  // TODO: return products where every key present in `criteria`
  //       matches the corresponding field on the product.
  //       Hint: Object.keys / Object.entries will help.
  throw new Error("Not implemented");
}

// --------------- Requirement 3 --------------------------------
// `GroupedProducts` is a Record keyed by a subset of Product's
// keys (only keys whose value type is `string` or `Category`),
// where each value maps a concrete field value to an array of
// matching Products.
//
// First, define `StringKeys` — a union of the keys of Product
// whose value type extends `string`:
//
// TODO: replace `never` with the correct conditional/utility type
export type StringKeys = {
  [K in keyof Product]: Product[K] extends string ? K : never;
}[keyof Product];

// Then define `GroupedProducts<K>`, constrained so K can only be
// one of those string-valued keys.  The result maps each distinct
// value found in the data to an array of Products.
//
// TODO: replace `unknown` with the correct generic mapped type
export type GroupedProducts<K extends StringKeys> = Record<string, Product[]> & {
  // The constraint K extends StringKeys is the important part —
  // leave this structure; you may refine the Record if you wish.
  _groupKey?: K; // phantom field to surface K in IDE tooling
};

// --------------- Requirement 4 --------------------------------
// `groupBy` accepts a readonly product array and a key K
// (constrained to StringKeys) and returns a GroupedProducts<K>
// where each distinct string value of product[K] maps to the
// array of products sharing that value.
//
// TODO: implement the function body
export function groupBy<K extends StringKeys>(
  products: ReadonlyArray<Product>,
  key: K
): GroupedProducts<K> {
  // TODO: iterate products, build and return the grouped map.
  //       The returned object must satisfy GroupedProducts<K>.
  throw new Error("Not implemented");
}

// --------------- Requirement 5 --------------------------------
// `filterAndGroup` composes the two functions above:
//   1. Filter the catalog with the given criteria
//   2. Group the filtered results by the given key
// The return type must be inferred — do NOT annotate it manually.
//
// TODO: implement (one or two lines using the functions above)
export function filterAndGroup<K extends StringKeys>(
  products: ReadonlyArray<Product>,
  criteria: FilterCriteria,
  groupKey: K
) {
  // TODO
  throw new Error("Not implemented");
}
