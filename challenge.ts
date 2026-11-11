// ============================================================
// Typed GraphQL-Style Query Planner & Result Assembler
// challenge.ts — fill in every TODO; do NOT use `any` or `as`
// ============================================================

// ---------------------------------------------------------------------------
// 1. SCHEMA DEFINITION — the universe of fields available to clients
// ---------------------------------------------------------------------------

/** All scalar leaf types supported by this engine */
export type ScalarType = "string" | "number" | "boolean" | "date";

/** Maps a ScalarType tag to its runtime TypeScript type */
export type ScalarToTS<S extends ScalarType> =
  S extends "string"  ? string  :
  S extends "number"  ? number  :
  S extends "boolean" ? boolean :
  S extends "date"    ? Date    :
  never;

/** A leaf field in the schema */
export type ScalarField<S extends ScalarType = ScalarType> = {
  kind: "scalar";
  type: S;
  nullable: boolean;
};

/** An object field whose value is another entity type */
export type ObjectField<T extends EntitySchema = EntitySchema> = {
  kind: "object";
  schema: T;
  nullable: boolean;
};

/** A list field whose items are another entity type */
export type ListField<T extends EntitySchema = EntitySchema> = {
  kind: "list";
  schema: T;
  nullable: boolean;
};

/** Union of all field descriptor kinds */
export type FieldDescriptor = ScalarField | ObjectField | ListField;

/** A named collection of fields that forms one entity in the schema */
export type EntitySchema = Record<string, FieldDescriptor>;

// ---------------------------------------------------------------------------
// 2. SELECTION SET — what the client wants to fetch
// ---------------------------------------------------------------------------

/**
 * Given an EntitySchema E, SelectionSet<E> is a mapped type where:
 *   - scalar fields  → `true` (include) or `false` / omitted (exclude)
 *   - object fields  → a nested SelectionSet over the nested schema, or false/omitted
 *   - list fields    → a nested SelectionSet over the item schema, or false/omitted
 *
 * TODO: Implement SelectionSet<E>
 * Constraints:
 *   - All keys must be optional (Partial)
 *   - Scalar fields map to `boolean`
 *   - Object fields map to `SelectionSet<F["schema"]> | false`
 *   - List fields  map to `SelectionSet<F["schema"]> | false`
 */
export type SelectionSet<E extends EntitySchema> = {
  // TODO
};

// ---------------------------------------------------------------------------
// 3. RESULT TYPE — the shape derived from schema + selection
// ---------------------------------------------------------------------------

/**
 * Given an EntitySchema E and a SelectionSet S over it, ResolvedResult<E, S>
 * produces the exact TypeScript type of the assembled result object.
 *
 * Rules (apply per key K in S):
 *   - Only keys where S[K] is not `false` appear in the result
 *   - Scalar  field: ScalarToTS<E[K]["type"]>  (wrapped in `| null` if nullable)
 *   - Object  field: ResolvedResult<E[K]["schema"], S[K]>  (wrapped in `| null` if nullable)
 *   - List    field: Array<ResolvedResult<E[K]["schema"], S[K]>>  (wrapped in `| null` if nullable)
 *
 * TODO: Implement ResolvedResult<E, S>
 * Hint: Use a mapped type over `keyof S`, conditional types on E[K]["kind"],
 *       and `infer` or direct property access to extract nested schemas/types.
 */
export type ResolvedResult<E extends EntitySchema, S extends SelectionSet<E>> = {
  // TODO
};

// ---------------------------------------------------------------------------
// 4. DATA SOURCE ABSTRACTION
// ---------------------------------------------------------------------------

/** A raw untyped record coming back from a data source */
export type RawRecord = Record<string, unknown>;

/**
 * A DataSource knows how to fetch raw records for one entity type.
 * `fetch` takes a list of IDs and returns a map of id → raw record.
 */
export type DataSource<_E extends EntitySchema> = {
  fetch: (ids: readonly string[]) => Promise<Map<string, RawRecord>>;
};

// ---------------------------------------------------------------------------
// 5. FIELD RESOLVER
// ---------------------------------------------------------------------------

/**
 * A FieldResolver for entity E knows how to:
 *   - resolve the IDs of nested entities referenced by a parent raw record
 *   - coerce a raw scalar value to its typed form
 *
 * TODO: Define FieldResolver<E extends EntitySchema> as a mapped type where
 *   each key K in E maps to:
 *     - if E[K] is ScalarField:  (raw: unknown) => ScalarToTS<E[K]["type"]>
 *     - if E[K] is ObjectField:  (parent: RawRecord) => string | null   (returns child ID)
 *     - if E[K] is ListField:    (parent: RawRecord) => readonly string[]  (returns child IDs)
 */
export type FieldResolver<E extends EntitySchema> = {
  // TODO
};

// ---------------------------------------------------------------------------
// 6. QUERY PLAN
// ---------------------------------------------------------------------------

/**
 * A QueryPlan bundles everything needed to execute a query:
 *   - schema:    the root EntitySchema
 *   - selection: the SelectionSet over that schema
 *   - source:    the DataSource for the root entity
 *   - resolvers: FieldResolver for each field in the root schema
 *   - nested:    for object/list fields, a recursive QueryPlan for the child schema
 *                (only required for fields that appear as object/list in the schema)
 *
 * TODO: Define QueryPlan<E, S> as a generic interface/type with the above shape.
 * Constraints:
 *   - `nested` must be a mapped type over only the object/list keys of E,
 *     where each value is a QueryPlan for the child schema and its own SelectionSet.
 *   - Use conditional types to extract ObjectField/ListField keys.
 */

/** Helper: extract keys of E whose field is an ObjectField or ListField */
export type NestedKeys<E extends EntitySchema> = {
  [K in keyof E]: E[K] extends ObjectField | ListField ? K : never;
}[keyof E];

export type QueryPlan<E extends EntitySchema, S extends SelectionSet<E>> = {
  // TODO
};

// ---------------------------------------------------------------------------
// 7. PLANNER — builds a QueryPlan from declarative config
// ---------------------------------------------------------------------------

export type PlannerConfig<E extends EntitySchema, S extends SelectionSet<E>> = {
  schema: E;
  selection: S;
  source: DataSource<E>;
  resolvers: FieldResolver<E>;
  nested: {
    [K in NestedKeys<E>]: E[K] extends ObjectField<infer C>
      ? PlannerConfig<C, SelectionSet<C>>
      : E[K] extends ListField<infer C>
      ? PlannerConfig<C, SelectionSet<C>>
      : never;
  };
};

/**
 * TODO: Implement `buildPlan`
 *
 * Takes a PlannerConfig<E, S> and returns a QueryPlan<E, S>.
 * Requirements:
 *   1. The returned plan must carry `schema`, `selection`, `source`, and `resolvers`
 *      directly from the config.
 *   2. For each key in `config.nested`, recursively call `buildPlan` to produce
 *      the nested QueryPlan and store it under the same key in `plan.nested`.
 *   3. The function must be generic over E and S.
 *   4. No `any` or type assertions.
 */
export function buildPlan<E extends EntitySchema, S extends SelectionSet<E>>(
  config: PlannerConfig<E, S>
): QueryPlan<E, S> {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 8. EXECUTOR — runs a QueryPlan against real data
// ---------------------------------------------------------------------------

/**
 * TODO: Implement `executePlan`
 *
 * Signature:
 *   executePlan<E, S>(plan: QueryPlan<E, S>, rootIds: readonly string[])
 *     : Promise<Map<string, ResolvedResult<E, S>>>
 *
 * Requirements:
 *   1. Fetch raw records for `rootIds` using `plan.source.fetch(rootIds)`.
 *   2. For each selected scalar field (where `plan.selection[K] === true`),
 *      call `plan.resolvers[K](raw[K])` to coerce the value.
 *   3. For each selected object field, use `plan.resolvers[K](rawRecord)` to
 *      get the child ID, recursively call `executePlan` on the nested plan with
 *      that single ID, and embed the single resolved child (or null if not found).
 *   4. For each selected list field, use `plan.resolvers[K](rawRecord)` to get
 *      child IDs, recursively call `executePlan` on the nested plan with those IDs,
 *      and embed the resolved array (or null / [] appropriately).
 *   5. Return a Map from root ID → assembled ResolvedResult<E, S>.
 *   6. Run all nested fetches for a given root record in parallel (Promise.all).
 *   7. No `any` or type assertions.
 *
 * Note: Because TypeScript cannot fully evaluate the deep conditional
 * ResolvedResult<E,S> at call sites inside the function body without explicit
 * instantiation, you MAY use a single `satisfies` expression on the final
 * assembled object per record — but no `as` casts or `any`.
 */
export async function executePlan<E extends EntitySchema, S extends SelectionSet<E>>(
  plan: QueryPlan<E, S>,
  rootIds: readonly string[]
): Promise<Map<string, ResolvedResult<E, S>>> {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 9. SAFE ACCESSOR — typed field extraction from a resolved result
// ---------------------------------------------------------------------------

/**
 * TODO: Implement `getField`
 *
 * A generic helper that extracts a single field from a ResolvedResult.
 *
 * Signature:
 *   getField<E, S, K>(result: ResolvedResult<E, S>, key: K)
 *     : ResolvedResult<E, S>[K]
 *
 * Requirements:
 *   - K must be constrained to keyof ResolvedResult<E, S>
 *   - The return type must be exactly ResolvedResult<E, S>[K]
 *   - Implementation is a single property access — the challenge is the signature
 */
export function getField<
  E extends EntitySchema,
  S extends SelectionSet<E>,
  K extends keyof ResolvedResult<E, S>
>(result: ResolvedResult<E, S>, key: K): ResolvedResult<E, S>[K] {
  // TODO
  throw new Error("Not implemented");
}
