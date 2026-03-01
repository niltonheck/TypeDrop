# Typed Distributed Cache with TTL & Eviction Policies

**Difficulty:** Hard

## Scenario

You're building the caching layer for a high-throughput microservice platform. Each cache namespace has its own value shape, TTL strategy, and eviction policy — and the orchestrator must coordinate reads, writes, and invalidations across multiple namespaces with full compile-time safety on every key-value pair.

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

| Skill | Where in code |
|---|---|
| Discriminated union (`EvictionPolicy`) | `EvictionPolicy` type definition |
| Branded types | `CacheKey` type + `cacheKey()` helper |
| Generic constraints (`S extends CacheSchema`) | `createCacheOrchestrator<S>` signature |
| Mapped types (`NamespaceConfigs<S>`) | `NamespaceConfigs` definition |
| Keyof + indexed access (`S[K]`) | `CacheOrchestrator<S>` interface methods |
| Conditional / narrowed logic per policy kind | LRU vs TTL vs none handling inside implementation |
| Readonly utility type | `NamespaceStats` fields |
| Optional typed function fields (`serialize`/`deserialize`) | `NamespaceConfig<V>` definition |
| Type-safe generic interface | `CacheOrchestrator<S>` interface |
| Runtime validation with typed output | `cacheKey()` length guard → branded return |

## Bonus

Extend `CacheOrchestrator` with a `warmUp<K extends keyof S>(ns: K, loader: (key: string) => Promise<S[K]>, keys: string[]): Promise<void>` method that pre-populates a namespace concurrently with a configurable concurrency limit.
