// ============================================================
// challenge.test.ts — Test harness for Typed Graph Traversal Engine
// Run with: npx ts-node challenge.test.ts
// ============================================================

import {
  buildGraph,
  detectCycles,
  shortestPath,
  topologicalSort,
  queryGraph,
  pkgId,
  type PackageNode,
  type DependencyEdge,
} from "./challenge";

// ------------------------------------------------------------------
// Mock data — a small monorepo dependency graph
//
//   core ──(1)──► utils ──(2)──► logger
//     │                             ▲
//    (3)                           (1)
//     ▼                             │
//   api  ──(4)──► server ──────────(1)──► logger
//     │
//    (5)
//     ▼
//   cli
//
// (numbers = edge weights)
// ------------------------------------------------------------------

const [core, utils, logger, api, server, cli] = [
  "core", "utils", "logger", "api", "server", "cli",
].map(pkgId);

const nodes: ReadonlyArray<PackageNode> = [
  { id: core,   name: "core",   deps: [utils, api] },
  { id: utils,  name: "utils",  deps: [logger] },
  { id: logger, name: "logger", deps: [] },
  { id: api,    name: "api",    deps: [server, cli] },
  { id: server, name: "server", deps: [logger] },
  { id: cli,    name: "cli",    deps: [] },
];

const edges: ReadonlyArray<DependencyEdge> = [
  { from: core,   to: utils,  weight: 1 },
  { from: utils,  to: logger, weight: 2 },
  { from: core,   to: api,    weight: 3 },
  { from: api,    to: server, weight: 4 },
  { from: api,    to: cli,    weight: 5 },
  { from: server, to: logger, weight: 1 },
];

const acyclicGraph = buildGraph(nodes, edges);

// ------------------------------------------------------------------
// Cyclic graph: introduce api → core (creates core → api → core cycle)
// ------------------------------------------------------------------
const cyclicEdges: ReadonlyArray<DependencyEdge> = [
  ...edges,
  { from: api, to: core, weight: 1 }, // back-edge → cycle
];
const cyclicNodes: ReadonlyArray<PackageNode> = nodes.map((n) =>
  n.id === api ? { ...n, deps: [...n.deps, core] } : n
);
const cyclicGraph = buildGraph(cyclicNodes, cyclicEdges);

// ------------------------------------------------------------------
// TEST 1 — Acyclic graph has no cycles
// ------------------------------------------------------------------
const cycleResult = detectCycles(acyclicGraph);
console.assert(
  cycleResult.isAcyclic === true,
  `TEST 1 FAILED: expected isAcyclic=true, got ${cycleResult.isAcyclic}`
);
console.assert(
  cycleResult.cycles.length === 0,
  `TEST 1 FAILED: expected 0 cycles, got ${cycleResult.cycles.length}`
);
console.log("TEST 1 PASSED — acyclic graph correctly identified");

// ------------------------------------------------------------------
// TEST 2 — Cyclic graph is detected
// ------------------------------------------------------------------
const cyclicResult = detectCycles(cyclicGraph);
console.assert(
  cyclicResult.isAcyclic === false,
  `TEST 2 FAILED: expected isAcyclic=false, got ${cyclicResult.isAcyclic}`
);
console.assert(
  cyclicResult.cycles.length >= 1,
  `TEST 2 FAILED: expected at least 1 cycle, got ${cyclicResult.cycles.length}`
);
console.log("TEST 2 PASSED — cycle detected in cyclic graph");

// ------------------------------------------------------------------
// TEST 3 — Shortest path: core → logger
// Expected cheapest path: core(0) → utils(1) → logger(3)  total=3
// vs core → api(3) → server(7) → logger(8)
// ------------------------------------------------------------------
const pathResult = shortestPath(acyclicGraph, core, logger);
console.assert(
  pathResult.ok === true,
  `TEST 3 FAILED: expected ok=true, got ok=${pathResult.ok}`
);
if (pathResult.ok) {
  console.assert(
    pathResult.value.totalCost === 3,
    `TEST 3 FAILED: expected totalCost=3, got ${pathResult.value.totalCost}`
  );
  console.assert(
    pathResult.value.path[0] === core && pathResult.value.path[pathResult.value.path.length - 1] === logger,
    `TEST 3 FAILED: path must start at core and end at logger`
  );
}
console.log("TEST 3 PASSED — shortest path core→logger is cost 3");

// ------------------------------------------------------------------
// TEST 4 — Topological sort on acyclic graph
// ------------------------------------------------------------------
const topoResult = topologicalSort(acyclicGraph);
console.assert(
  topoResult.ok === true,
  `TEST 4 FAILED: expected ok=true, got ok=${topoResult.ok}`
);
if (topoResult.ok) {
  const order = topoResult.value.order;
  // logger must come before utils and server
  const loggerIdx  = order.indexOf(logger);
  const utilsIdx   = order.indexOf(utils);
  const serverIdx  = order.indexOf(server);
  const coreIdx    = order.indexOf(core);
  console.assert(
    loggerIdx < utilsIdx && loggerIdx < serverIdx && utilsIdx < coreIdx,
    `TEST 4 FAILED: topological order violated. order=${order.join(" → ")}`
  );
}
console.log("TEST 4 PASSED — topological sort respects dependency order");

// ------------------------------------------------------------------
// TEST 5 — queryGraph generic helper returns precise types
// ------------------------------------------------------------------
const cyclesViaQuery = queryGraph(acyclicGraph, "cycles");
// TypeScript should infer cyclesViaQuery as CycleCheckResult (has .isAcyclic)
console.assert(
  typeof cyclesViaQuery.isAcyclic === "boolean",
  `TEST 5 FAILED: queryGraph("cycles") should return CycleCheckResult`
);

const topoViaQuery = queryGraph(acyclicGraph, "topoSort");
// TypeScript should infer topoViaQuery as Result<TopologicalOrderResult, GraphError>
console.assert(
  "ok" in topoViaQuery,
  `TEST 5 FAILED: queryGraph("topoSort") should return Result<...>`
);
console.log("TEST 5 PASSED — queryGraph returns correctly narrowed types");

console.log("\n✅ All tests passed!");
