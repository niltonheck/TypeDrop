# Typed Graph Traversal Engine with Shortest-Path & Cycle Detection

**Difficulty:** Hard

## Scenario

You're building the dependency-resolution core for a monorepo build system. Packages form a directed graph of dependencies; the engine must detect circular dependencies (which would deadlock a build), compute the shortest build path between two packages, and produce a topologically sorted build order — all with the compiler enforcing every graph shape, traversal result, and error variant.

## How to solve

1. Open `challenge.ts`
2. Implement the types and functions marked with `TODO`
3. Verify your solution using one of the methods below

### In CodeSandbox (recommended)

1. Click the **Open Devtool** icon in the top-right corner (or press `Ctrl + \``)
2. In the Devtools panel, click **Type Check + Run Tests** to validate your solution
3. For `console.log` output and assertion results, open your **browser DevTools** (`F12` > Console tab)

### Locally

```bash
npm install
npm test    # runs tsc --noEmit && tsx challenge.test.ts
```

## Evaluation Checklist

| Skill Exercised | Where in Code |
|---|---|
| **Branded types** (nominal typing via `& { __brand }`) | `PackageId`, `pkgId()` factory — R19/R20 |
| **Discriminated union** for typed errors | `GraphError` with `kind` discriminant — R8/R10/R13 |
| **Generic `Result<T,E>` type** | Used as return type of `shortestPath`, `topologicalSort` — R7/R12 |
| **Mapped type indexing** (`GraphQueryMap[K]`) | `queryGraph<K extends keyof GraphQueryMap>` return type — R16 |
| **`ReadonlyMap` / `ReadonlyArray`** for immutable graph | `DependencyGraph.nodes`, all result fields |
| **Type narrowing** via `result.ok` discriminant | Test harness — `if (pathResult.ok)` branches |
| **DFS cycle detection** with full path tracking | `detectCycles` — R4/R5/R6 |
| **Dijkstra's algorithm** with typed priority queue | `shortestPath` — R9/R11 |
| **Kahn's algorithm** (in-degree BFS topo sort) | `topologicalSort` — R14/R15 |
| **Generic constraint** (`K extends keyof`) for precise inference | `queryGraph` — R16/R17/R18 |


## Bonus

Extend `shortestPath` to accept an optional `AbortSignal` and return `{ kind: "aborted" }` inside `GraphError` if the signal fires mid-traversal.
