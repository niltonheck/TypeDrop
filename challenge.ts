// ============================================================
// Typed API Pagination Cursor Engine
// ============================================================
// TOPICS: Generics, Conditional Types, Mapped Types,
//         Result<T,E>, Fetching & I/O, Parsing & Validation,
//         Iteration & Aggregation
// ============================================================

// ------------------------------------------------------------------
// 1. Result type — use this for ALL fallible operations
// ------------------------------------------------------------------
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ------------------------------------------------------------------
// 2. Domain resource shapes
// ------------------------------------------------------------------
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
}

export interface OrderRecord {
  id: string;
  userId: string;
  totalCents: number;
  status: "pending" | "fulfilled" | "cancelled";
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  priceCents: number;
  inStock: boolean;
}

// ------------------------------------------------------------------
// 3. The union of all supported resource types
// ------------------------------------------------------------------
export type ResourceMap = {
  users: UserRecord;
  orders: OrderRecord;
  products: ProductRecord;
};

export type ResourceKind = keyof ResourceMap;

// ------------------------------------------------------------------
// 4. Raw API response shape (what the network returns as `unknown`)
// ------------------------------------------------------------------
// A real paginated API response looks like:
// {
//   data: unknown[],
//   nextCursor: string | null,
//   total: number
// }
export interface RawPageResponse {
  data: unknown[];
  nextCursor: string | null;
  total: number;
}

// ------------------------------------------------------------------
// 5. Pagination errors — discriminated union
// ------------------------------------------------------------------
export type PaginationError =
  | { kind: "INVALID_PAGE"; message: string; cursor: string | null }
  | { kind: "VALIDATION_FAILED"; message: string; index: number; raw: unknown }
  | { kind: "FETCH_ERROR"; message: string; statusCode: number };

// ------------------------------------------------------------------
// 6. Typed page result — one page of validated records
// ------------------------------------------------------------------
export interface PageResult<K extends ResourceKind> {
  kind: K;
  records: ResourceMap[K][];
  nextCursor: string | null;
  total: number;
}

// ------------------------------------------------------------------
// 7. Aggregated result — all pages combined
// ------------------------------------------------------------------
export interface AggregatedResult<K extends ResourceKind> {
  kind: K;
  records: ResourceMap[K][];
  totalFetched: number;
  pageCount: number;
}

// ------------------------------------------------------------------
// 8. Per-resource validator type
//    Each validator receives `unknown` and returns a Result.
// ------------------------------------------------------------------
export type Validator<T> = (raw: unknown) => Result<T, string>;

// A registry mapping each resource kind to its validator
export type ValidatorRegistry = {
  [K in ResourceKind]: Validator<ResourceMap[K]>;
};

// ------------------------------------------------------------------
// 9. Fetcher type — simulates a typed fetch call
//    Returns a RawPageResponse or throws (you must wrap it)
// ------------------------------------------------------------------
export type PageFetcher = (
  cursor: string | null
) => Promise<RawPageResponse>;

// ------------------------------------------------------------------
// 10. TODO: Implement `parseRawPage`
//
// Requirements:
//   a) Accept a `kind`, the raw response (`unknown`), and a
//      `ValidatorRegistry`. Return Result<PageResult<K>, PaginationError>.
//   b) The raw response must be an object with:
//        - `data` — a non-empty array
//        - `nextCursor` — string or null
//        - `total` — a positive integer
//      If the shape is wrong, return a INVALID_PAGE error.
//   c) Validate every item in `data` using the registry validator
//      for `kind`. If any item fails, return a VALIDATION_FAILED
//      error including the item's index and raw value.
//   d) On success, return a PageResult<K> with the validated records.
// ------------------------------------------------------------------
export function parseRawPage<K extends ResourceKind>(
  kind: K,
  raw: unknown,
  registry: ValidatorRegistry
): Result<PageResult<K>, PaginationError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 11. TODO: Implement `fetchAllPages`
//
// Requirements:
//   a) Accept a `kind`, a `PageFetcher`, a `ValidatorRegistry`,
//      and a `maxPages` limit (default: 10).
//      Return Promise<Result<AggregatedResult<K>, PaginationError>>.
//   b) Start with cursor = null. After each successful page, use
//      `nextCursor` to fetch the next one. Stop when:
//        - `nextCursor` is null (no more pages), OR
//        - `maxPages` pages have been fetched.
//   c) If the fetcher throws, catch it and return a FETCH_ERROR
//      with statusCode: 0 and the error's message.
//   d) Pass each raw response through `parseRawPage`. If any page
//      fails validation, stop immediately and return that error.
//   e) On success, return an AggregatedResult<K> with all records
//      from all pages combined, plus `totalFetched` and `pageCount`.
// ------------------------------------------------------------------
export async function fetchAllPages<K extends ResourceKind>(
  kind: K,
  fetcher: PageFetcher,
  registry: ValidatorRegistry,
  maxPages: number = 10
): Promise<Result<AggregatedResult<K>, PaginationError>> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 12. TODO: Implement `buildValidatorRegistry`
//
// Requirements:
//   a) Return a complete `ValidatorRegistry` with validators for
//      "users", "orders", and "products".
//   b) Each validator must check that the raw value is a non-null
//      object and that all required fields exist with correct types:
//        - UserRecord:    id/name/email (string), role (union literal)
//        - OrderRecord:   id/userId (string), totalCents (number),
//                         status (union literal)
//        - ProductRecord: id/sku/name (string), priceCents (number),
//                         inStock (boolean)
//   c) Return Result<T, string> — Ok on success, Err with a
//      descriptive message on failure. No type assertions allowed.
// ------------------------------------------------------------------
export function buildValidatorRegistry(): ValidatorRegistry {
  // TODO
  throw new Error("Not implemented");
}
