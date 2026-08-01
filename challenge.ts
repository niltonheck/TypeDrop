// ─────────────────────────────────────────────────────────────────────────────
// challenge.ts — Typed In-Memory Cache with TTL & Tagged Invalidation
// ─────────────────────────────────────────────────────────────────────────────
// SCENARIO
// You are building the caching layer for a multi-tenant SaaS dashboard.
// Cached entries span multiple domains (users, products, reports), each with
// its own value shape. Entries expire after a TTL, and a tag system lets
// operators bulk-invalidate all entries sharing a logical tag.
//
// YOUR TASK
// Implement the four exports below so that all requirements are satisfied.
// Do NOT use `any`, `as`, or non-trivial type assertions anywhere.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Branded primitive ───────────────────────────────────────────────────────

// REQUIREMENT 1
// Define a branded type `CacheKey` that is a `string` at runtime but
// distinct from plain `string` at the type level.
// Hint: use an intersection with `{ readonly __brand: "CacheKey" }`.
export type CacheKey = string & { readonly __brand: "CacheKey" };

// REQUIREMENT 2
// Implement `toCacheKey(raw: string): CacheKey` — a runtime constructor for
// the branded type. No unsafe cast; use a type-safe approach.
export function toCacheKey(raw: string): CacheKey {
  // TODO: return raw as a CacheKey without using the `as` keyword.
  // Hint: a single-property satisfies expression or an identity function
  // with an explicit return type annotation both work.
  throw new Error("TODO");
}

// ─── Core data structures ─────────────────────────────────────────────────────

// REQUIREMENT 3
// A cache entry wraps a value of type `V` and carries:
//   - `value`     : V
//   - `expiresAt` : number  (Unix timestamp in ms; use Date.now() + ttlMs)
//   - `tags`      : ReadonlyArray<string>  (logical grouping labels)
export type CacheEntry<V> = {
  // TODO: fill in the three fields described above
};

// ─── Result type ─────────────────────────────────────────────────────────────

// REQUIREMENT 4
// Define a discriminated union `CacheResult<V>`:
//   - { hit: true;  value: V }          — entry found and not expired
//   - { hit: false; reason: "missing" | "expired" }  — entry absent or stale
export type CacheResult<V> =
  // TODO
  never;

// ─── Cache store ─────────────────────────────────────────────────────────────

// REQUIREMENT 5
// `CacheStore<Schema>` is a generic interface where `Schema` is a
// `Record<string, unknown>` mapping logical domain names to their value types.
//
// Example schema:
//   { user: User; product: Product }
//
// The interface must expose:
//
//   set<K extends keyof Schema>(
//     domain: K,
//     id: string,
//     value: Schema[K],
//     ttlMs: number,
//     tags?: string[]
//   ): CacheKey
//     — stores the entry, returns the composite CacheKey.
//
//   get<K extends keyof Schema>(
//     domain: K,
//     id: string
//   ): CacheResult<Schema[K]>
//     — returns a typed CacheResult for the domain's value type.
//
//   invalidate(key: CacheKey): boolean
//     — removes a single entry; returns true if it existed.
//
//   invalidateTag(tag: string): number
//     — removes ALL entries carrying the tag; returns count removed.
//
//   size(): number
//     — total number of live (including possibly-expired) entries.
export interface CacheStore<Schema extends Record<string, unknown>> {
  // TODO: declare the five methods described above
}

// ─── Factory ──────────────────────────────────────────────────────────────────

// REQUIREMENT 6
// Implement `createCacheStore<Schema>(): CacheStore<Schema>`.
//
// Internals (suggested, not enforced):
//   - Use a `Map<CacheKey, CacheEntry<unknown>>` as the backing store.
//   - Composite key format: `"${domain}:${id}"` (cast via toCacheKey).
//   - `get` must check expiry via `Date.now()` and return the correct
//     discriminated variant.
//   - `invalidateTag` must iterate all entries and remove matching ones.
//
// REQUIREMENT 7
// The `get` method's return type must be inferred from `Schema[K]` — the
// caller receives `CacheResult<User>` when domain is "user", not
// `CacheResult<unknown>`.
export function createCacheStore<
  Schema extends Record<string, unknown>
>(): CacheStore<Schema> {
  // TODO: implement
  throw new Error("TODO");
}

// ─── Utility: getOrFetch ──────────────────────────────────────────────────────

// REQUIREMENT 8
// Implement the generic helper:
//
//   getOrFetch<Schema, K extends keyof Schema>(
//     store   : CacheStore<Schema>,
//     domain  : K,
//     id      : string,
//     ttlMs   : number,
//     fetcher : () => Promise<Schema[K]>,
//     tags?   : string[]
//   ): Promise<Schema[K]>
//
// Behaviour:
//   - If the cache holds a live (non-expired) entry, return its value.
//   - Otherwise call `fetcher()`, store the result, then return it.
//   - `tags` are forwarded to `store.set` when populating.
export async function getOrFetch<
  Schema extends Record<string, unknown>,
  K extends keyof Schema
>(
  store: CacheStore<Schema>,
  domain: K,
  id: string,
  ttlMs: number,
  fetcher: () => Promise<Schema[K]>,
  tags?: string[]
): Promise<Schema[K]> {
  // TODO: implement
  throw new Error("TODO");
}
