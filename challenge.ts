// ============================================================
// challenge.ts — Typed Graph Traversal Engine
// Dependency-resolution core for a monorepo build system
// ============================================================
// Strict mode is ON. No `any`, no `as` casts, no type assertions.
// ============================================================

// ------------------------------------------------------------------
// 1. CORE DOMAIN TYPES
// ------------------------------------------------------------------

/** A unique package identifier within the monorepo. */
export type PackageId = string & { readonly __brand: "PackageId" };

/** A directed edge from one package to another (dependency relationship). */
export interface DependencyEdge {
  readonly from: PackageId;
  readonly to: PackageId;
  /** Estimated build-time cost of this dependency link (in seconds). */
  readonly weight: number;
}

/** A package node in the dependency graph. */
export interface PackageNode {
  readonly id: PackageId;
  readonly name: string;
  /** Declared dependencies (must all exist as nodes). */
  readonly deps: ReadonlyArray<PackageId>;
}

// ------------------------------------------------------------------
// 2. GRAPH STRUCTURE
// ------------------------------------------------------------------

export interface DependencyGraph {
  readonly nodes: ReadonlyMap<PackageId, PackageNode>;
  readonly edges: ReadonlyArray<DependencyEdge>;
}

// ------------------------------------------------------------------
// 3. RESULT / ERROR TYPES
// ------------------------------------------------------------------

/**
 * A typed discriminated union for all graph-operation errors.
 * Requirements:
 *   - "unknown_node"  : one or both PackageIds were not found in the graph
 *   - "cycle_detected": a cycle exists; include the cycle path as an array
 *   - "no_path"       : no directed path exists between the two nodes
 */
export type GraphError =
  | { readonly kind: "unknown_node"; readonly ids: ReadonlyArray<PackageId> }
  | { readonly kind: "cycle_detected"; readonly cycle: ReadonlyArray<PackageId> }
  | { readonly kind: "no_path"; readonly from: PackageId; readonly to: PackageId };

/** Generic Result type — no `any` allowed. */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// ------------------------------------------------------------------
// 4. TRAVERSAL RESULT TYPES
// ------------------------------------------------------------------

export interface ShortestPathResult {
  /** Ordered list of PackageIds from `from` → `to` (inclusive). */
  readonly path: ReadonlyArray<PackageId>;
  /** Sum of edge weights along the path. */
  readonly totalCost: number;
}

export interface TopologicalOrderResult {
  /** Packages in valid build order (dependencies before dependents). */
  readonly order: ReadonlyArray<PackageId>;
}

export interface CycleCheckResult {
  /** True if the graph is a DAG (no cycles). */
  readonly isAcyclic: boolean;
  /** All detected cycles, each represented as a closed path. */
  readonly cycles: ReadonlyArray<ReadonlyArray<PackageId>>;
}

// ------------------------------------------------------------------
// 5. GRAPH BUILDER
// ------------------------------------------------------------------

/**
 * TODO: Implement `buildGraph`.
 *
 * Requirements:
 *   [R1] Accepts an array of PackageNodes and an array of DependencyEdges.
 *   [R2] Returns a DependencyGraph with a Map keyed by PackageId.
 *   [R3] Edges whose `from` or `to` node does not exist in the nodes array
 *        must be silently dropped (callers validate separately).
 */
export function buildGraph(
  nodes: ReadonlyArray<PackageNode>,
  edges: ReadonlyArray<DependencyEdge>
): DependencyGraph {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 6. CYCLE DETECTION
// ------------------------------------------------------------------

/**
 * TODO: Implement `detectCycles`.
 *
 * Requirements:
 *   [R4] Uses DFS with a recursion-stack colour map to find ALL cycles.
 *   [R5] Each detected cycle is represented as the minimal closed path
 *        (first node === last node).
 *   [R6] Returns a CycleCheckResult; never throws.
 */
export function detectCycles(graph: DependencyGraph): CycleCheckResult {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 7. SHORTEST PATH (Dijkstra)
// ------------------------------------------------------------------

/**
 * TODO: Implement `shortestPath`.
 *
 * Requirements:
 *   [R7]  Returns Result<ShortestPathResult, GraphError>.
 *   [R8]  Returns { kind: "unknown_node" } if either PackageId is absent.
 *   [R9]  Uses Dijkstra's algorithm over edge weights.
 *   [R10] Returns { kind: "no_path" } if the target is unreachable.
 *   [R11] The returned `path` includes both the source and destination nodes.
 */
export function shortestPath(
  graph: DependencyGraph,
  from: PackageId,
  to: PackageId
): Result<ShortestPathResult, GraphError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 8. TOPOLOGICAL SORT
// ------------------------------------------------------------------

/**
 * TODO: Implement `topologicalSort`.
 *
 * Requirements:
 *   [R12] Returns Result<TopologicalOrderResult, GraphError>.
 *   [R13] Returns { kind: "cycle_detected" } (with the cycle path) if the
 *         graph is not a DAG — reuse detectCycles internally.
 *   [R14] Uses Kahn's algorithm (BFS / in-degree reduction).
 *   [R15] Packages with no dependents appear last in the order.
 */
export function topologicalSort(
  graph: DependencyGraph
): Result<TopologicalOrderResult, GraphError> {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 9. GENERIC GRAPH QUERY HELPER  (Conditional / mapped types exercise)
// ------------------------------------------------------------------

/**
 * A map of all supported query operations and their return types.
 * You must NOT change the key names or value types.
 */
export interface GraphQueryMap {
  cycles: CycleCheckResult;
  topoSort: Result<TopologicalOrderResult, GraphError>;
}

/**
 * TODO: Implement `queryGraph`.
 *
 * Requirements:
 *   [R16] Uses a function overload (or generic constraint) so that the
 *         return type is inferred precisely from the `operation` literal —
 *         i.e. queryGraph(g, "cycles") returns CycleCheckResult, not a union.
 *   [R17] Delegates to detectCycles or topologicalSort accordingly.
 *   [R18] No `any`, no `as` casts permitted.
 */
export function queryGraph<K extends keyof GraphQueryMap>(
  graph: DependencyGraph,
  operation: K
): GraphQueryMap[K] {
  // TODO
  throw new Error("Not implemented");
}

// ------------------------------------------------------------------
// 10. BRANDED ID FACTORY
// ------------------------------------------------------------------

/**
 * TODO: Implement `pkgId`.
 *
 * Requirements:
 *   [R19] Returns a branded PackageId from a plain string.
 *   [R20] Must NOT use `as` or any type assertion — use a type-safe
 *         constructor pattern (e.g. a validated factory function with
 *         a type predicate or an overloaded signature).
 *
 * Hint: One clean approach — define a private identity-function
 *       overload so the branding is applied at the call site only.
 */
export function pkgId(raw: string): PackageId {
  // TODO
  throw new Error("Not implemented");
}
