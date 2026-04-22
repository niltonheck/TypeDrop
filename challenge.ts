// ============================================================
// Typed API Response Cache
// challenge.ts
// ============================================================
// Scenario:
//   You're building the caching layer for a typed REST API client.
//   Raw responses arrive as `unknown` from fetch; your cache must
//   validate them, store them with TTL-aware entries, and serve
//   requests through a stale-while-revalidate strategy.
//
// Rules:
//   - No `any`, no type assertions (`as`), no `@ts-ignore`
//   - Must compile under strict: true
// ============================================================

// ── 1. Result type ────────────────────────────────────────────
// A generic discriminated union for success / failure outcomes.

export type Result<T, E extends string = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ── 2. Validator type ─────────────────────────────────────────
// A function that takes `unknown` and returns Result<T, string>.
// Used to parse and validate raw API responses at runtime.

export type Validator<T> = (raw: unknown) => Result<T, string>;

// ── 3. CacheEntry ─────────────────────────────────────────────
// Represents a stored cache entry. Must track:
//   - the validated value
//   - the timestamp it was stored (ms since epoch)
//   - the TTL in milliseconds

export type CacheEntry<T> = {
  // TODO: add `value`, `storedAt`, and `ttl` fields with correct types
};

// ── 4. CacheStatus ────────────────────────────────────────────
// A discriminated union describing what the cache returned:
//   - "hit"   → fresh entry, value available
//   - "stale" → entry exists but TTL has expired; value still available
//   - "miss"  → no entry found

export type CacheStatus<T> =
  // TODO: define all three variants as a discriminated union
  // Each variant must carry a `status` literal field.
  // "hit" and "stale" must also carry the cached `value: T`.
  never;

// ── 5. FetchFn ────────────────────────────────────────────────
// A generic async function type that fetches a resource by key
// and returns `unknown` (simulating a raw fetch response).

export type FetchFn = (key: string) => Promise<unknown>;

// ── 6. RevalidationResult ────────────────────────────────────
// Returned after a stale-while-revalidate cycle completes.
// Must carry:
//   - the cache key
//   - whether revalidation succeeded
//   - the new value on success, or an error string on failure

export type RevalidationResult<T> =
  // TODO: discriminated union on `revalidated: true | false`
  never;

// ── 7. TypedCache class ───────────────────────────────────────
// A generic, key-based cache with TTL and stale-while-revalidate.

export class TypedCache<T> {
  // TODO: store entries in a Map with the correct generic types

  constructor(
    private readonly defaultTtl: number, // ms
    private readonly validator: Validator<T>
  ) {}

  // ── 7a. set ─────────────────────────────────────────────────
  // Requirement 1: Validate `raw` using `this.validator`.
  //   - On failure, return the Result error as-is.
  //   - On success, store a CacheEntry and return ok: true.
  set(key: string, raw: unknown, ttl?: number): Result<T, string> {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 7b. get ─────────────────────────────────────────────────
  // Requirement 2: Look up `key` in the store.
  //   - If absent → CacheStatus "miss"
  //   - If present and not expired → CacheStatus "hit"
  //   - If present but expired   → CacheStatus "stale"
  // "Expired" means: Date.now() > storedAt + ttl
  get(key: string): CacheStatus<T> {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 7c. delete ──────────────────────────────────────────────
  // Requirement 3: Remove the entry for `key` if it exists.
  //   Returns true if an entry was removed, false otherwise.
  delete(key: string): boolean {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 7d. revalidate ──────────────────────────────────────────
  // Requirement 4: Stale-while-revalidate for a single key.
  //   - Call `fetchFn(key)` to fetch fresh data.
  //   - Validate and store the result via `this.set(...)`.
  //   - Return a RevalidationResult<T> indicating success or failure.
  //   - On fetch/network errors, the result must carry the error message.
  async revalidate(
    key: string,
    fetchFn: FetchFn
  ): Promise<RevalidationResult<T>> {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 7e. getOrFetch ──────────────────────────────────────────
  // Requirement 5: Cache-aside with automatic population.
  //   - If the cache has a FRESH "hit" for `key`, return its value.
  //   - Otherwise (miss OR stale): fetch, validate, store, return value.
  //   - If fetch or validation fails, return a Result failure.
  async getOrFetch(
    key: string,
    fetchFn: FetchFn
  ): Promise<Result<T, string>> {
    // TODO
    throw new Error("Not implemented");
  }

  // ── 7f. purgeExpired ────────────────────────────────────────
  // Requirement 6: Remove ALL expired entries from the store.
  //   Returns the number of entries removed.
  purgeExpired(): number {
    // TODO
    throw new Error("Not implemented");
  }
}

// ── 8. buildValidator ─────────────────────────────────────────
// Requirement 7: Implement a validator factory.
// Given a `shape` — a Record mapping field names to a type-check
// function `(v: unknown) => boolean` — return a Validator<T> that:
//   - Confirms the raw value is a non-null object
//   - Checks every field in `shape` passes its predicate
//   - Returns ok: true with the narrowed value, or ok: false with
//     a descriptive error string naming the offending field.
//
// The `shape` parameter type and return type must be fully typed
// without using `any`. Use a mapped type or generic constraint.

export function buildValidator<T extends Record<string, unknown>>(
  shape: { [K in keyof T]: (v: unknown) => boolean }
): Validator<T> {
  // TODO
  throw new Error("Not implemented");
}
