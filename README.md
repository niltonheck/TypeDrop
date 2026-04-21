# Typed Schema Migration Engine

**Difficulty:** Hard

## Scenario

You're building the schema migration engine for a multi-tenant database platform. Raw migration manifests arrive as `unknown` JSON from a CI/CD pipeline; your engine must validate them, compile each migration into a strongly-typed dependency graph, execute migrations in topological order with concurrency limits and rollback support, and emit a discriminated-union result per migration — with zero `any`.

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
| Branded types (`MigrationId`) without `as` | `§1`, `§4` — type guard / branded constructor for `MigrationId` |
| Discriminated unions (5 variants) | `ValidationError`, `GraphError`, `ExecutionError`, `MigrationResult`, `EngineReport` |
| `unknown` → typed narrowing (runtime validation) | `validateManifest` — full field-by-field narrowing of `unknown` input |
| Error accumulation without short-circuiting | `validateManifest` — collect ALL `ValidationError`s before returning |
| Generics + `Map` / `Set` with typed keys | `ExecutionPlan.nodes: Map<MigrationId, MigrationNode>`, `Set<MigrationId>` |
| Graph algorithm (topological sort / cycle detection) | `compileGraph` — DFS or Kahn's, cycle reporting with path |
| `Promise.allSettled` + concurrency limiting | `runMigrations` — wave-based bounded concurrency |
| Rollback with reverse-ordered side effects | `runMigrations` — reverse-applied list rollback on failure |
| `Partial<T>` + default merging | `runEngine` — `options?: Partial<EngineOptions>` with defaults |
| Exhaustive narrowing helper | `assertNever` — used when switching over `MigrationResult["status"]` |
| Type predicate / type guard | `isMigrationId` or branded constructor in `validateManifest` |


## Bonus

Extend `EngineReport` with a `"dry_run"` outcome and add a `dryRun: true` option to `EngineOptions` that validates and compiles the graph but skips execution, returning the ordered wave plan as a human-readable summary string per migration.
