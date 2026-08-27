// ============================================================
// challenge.ts — Typed GraphQL-Style Query Builder
// ============================================================
// Requirements:
//   1. Define a `SelectionSet<T>` mapped type that, given an object
//      type T, produces an object where each key is optional and maps
//      to `true` (for scalar fields) OR a nested SelectionSet for
//      object/array-element fields.
//   2. Define a `Selected<T, S>` conditional/mapped type that, given
//      type T and a SelectionSet S, returns only the keys present in
//      S — with nested objects recursively narrowed and arrays
//      preserving their element type (also recursively narrowed).
//   3. Implement `buildQuery<T, S extends SelectionSet<T>>(
//        fetcher: () => Promise<T>,
//        selection: S
//      ): Promise<Selected<T, S>>` so that at runtime it resolves the
//      full object and strips any keys not present in the selection.
//   4. Implement `buildQuerySync<T, S extends SelectionSet<T>>(
//        data: T,
//        selection: S
//      ): Selected<T, S>` — a synchronous variant for already-fetched
//      data (useful for testing and caching layers).
//   5. The stripper logic must be recursive: nested objects and arrays
//      must also be pruned to only selected sub-fields.
//   6. No `any`, no type assertions (`as`), no non-null assertions
//      (`!`). Strict mode must pass.

// ── Domain model ────────────────────────────────────────────

export type Address = {
  street: string;
  city: string;
  country: string;
  postalCode: string;
};

export type Repository = {
  id: string;
  name: string;
  isPrivate: boolean;
  starCount: number;
};

export type User = {
  id: string;
  username: string;
  email: string;
  age: number;
  address: Address;
  repositories: Repository[];
};

// ── Type utilities ───────────────────────────────────────────

/**
 * Unwrap an array type to its element type.
 * NonArray<string[]> → string
 * NonArray<string>   → string
 */
export type UnwrapArray<T> = T extends ReadonlyArray<infer E> ? E : T;

/**
 * TODO: Implement SelectionSet<T>
 *
 * For each key K in T:
 *   - If T[K] is a scalar (string | number | boolean | …),
 *     the value type should be `true`.
 *   - If T[K] is an object or array-of-object, the value type should
 *     be `SelectionSet<UnwrapArray<T[K]>>` (allowing further
 *     nesting) OR `true` is NOT allowed for object fields —
 *     callers must always drill into nested objects explicitly.
 *   - Every key is optional (consumers pick what they need).
 *
 * Hint: use a conditional on `NonNullable<T[K]>` to branch between
 * scalar and object shapes.
 */
export type SelectionSet<T> = {
  // TODO: replace this stub
  [K in keyof T]?: unknown;
};

/**
 * TODO: Implement Selected<T, S>
 *
 * Produce a new type containing only the keys of T that are also
 * present (set to `true` or a sub-selection) in S:
 *   - If S[K] is `true`  → include T[K] as-is.
 *   - If S[K] is an object (sub-selection) AND T[K] is an array
 *     → the result key should be `Array<Selected<UnwrapArray<T[K]>, S[K]>>`
 *   - If S[K] is an object (sub-selection) AND T[K] is a plain object
 *     → the result key should be `Selected<T[K], S[K]>`
 *   - Keys absent from S should be excluded entirely (use `never` /
 *     key remapping with `as` in the mapped type, or Pick + mapped
 *     type combination).
 *
 * Requirement: the result type must be an exact object — no `undefined`
 * values leaking in for unselected keys.
 */
export type Selected<T, S extends SelectionSet<T>> = {
  // TODO: replace this stub
  [K in keyof T]: T[K];
};

// ── Runtime helpers (you may add private helpers below) ──────

/**
 * TODO: Implement stripToSelection
 *
 * A recursive runtime function that takes a full object `data: T`
 * and a `selection: S` and returns a new object containing only the
 * selected keys, recursively stripped.
 *
 * This is the single source of truth for both `buildQuery` and
 * `buildQuerySync` — extract it so you don't duplicate logic.
 *
 * Constraints:
 *   - Must return `Selected<T, S>` (not `unknown` or a wider type).
 *   - No `any`, no `as`.
 */
export function stripToSelection<T extends object, S extends SelectionSet<T>>(
  data: T,
  selection: S
): Selected<T, S> {
  // TODO
  throw new Error("Not implemented");
}

// ── Public API ───────────────────────────────────────────────

/**
 * TODO: Implement buildQuerySync
 *
 * Synchronously prune `data` to only the fields described by
 * `selection`. Delegates to `stripToSelection`.
 */
export function buildQuerySync<T extends object, S extends SelectionSet<T>>(
  data: T,
  selection: S
): Selected<T, S> {
  // TODO
  throw new Error("Not implemented");
}

/**
 * TODO: Implement buildQuery
 *
 * Resolve the fetcher, then prune the result to only the fields
 * described by `selection`. Delegates to `stripToSelection`.
 */
export async function buildQuery<T extends object, S extends SelectionSet<T>>(
  fetcher: () => Promise<T>,
  selection: S
): Promise<Selected<T, S>> {
  // TODO
  throw new Error("Not implemented");
}
