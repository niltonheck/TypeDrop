// ============================================================
// challenge.test.ts
// ============================================================
import {
  TypedCache,
  buildValidator,
  type CacheStatus,
  type RevalidationResult,
  type Result,
} from "./challenge";

// ── Mock data ─────────────────────────────────────────────────

type User = { id: number; name: string; active: boolean };

const userValidator = buildValidator<User>({
  id: (v) => typeof v === "number",
  name: (v) => typeof v === "string",
  active: (v) => typeof v === "boolean",
});

const validRaw: unknown = { id: 1, name: "Alice", active: true };
const invalidRaw: unknown = { id: "not-a-number", name: "Bob", active: true };

// ── Test 1: buildValidator — valid input ──────────────────────
{
  const result = userValidator(validRaw);
  console.assert(result.ok === true, "Test 1a FAILED: valid raw should parse ok");
  if (result.ok) {
    console.assert(result.value.name === "Alice", "Test 1b FAILED: name should be Alice");
    console.assert(result.value.id === 1,         "Test 1c FAILED: id should be 1");
  }
  console.log("Test 1 passed: buildValidator accepts valid input");
}

// ── Test 2: buildValidator — invalid input ────────────────────
{
  const result = userValidator(invalidRaw);
  console.assert(result.ok === false, "Test 2a FAILED: invalid raw should fail");
  if (!result.ok) {
    console.assert(
      result.error.includes("id"),
      "Test 2b FAILED: error should mention offending field 'id'"
    );
  }
  console.log("Test 2 passed: buildValidator rejects invalid input");
}

// ── Test 3: TypedCache.set + get (fresh hit) ──────────────────
{
  const cache = new TypedCache<User>(60_000, userValidator);
  const setResult = cache.set("user:1", validRaw);
  console.assert(setResult.ok === true, "Test 3a FAILED: set should succeed");

  const status = cache.get("user:1");
  console.assert(status.status === "hit", "Test 3b FAILED: should be a cache hit");
  if (status.status === "hit") {
    console.assert(status.value.name === "Alice", "Test 3c FAILED: cached name should be Alice");
  }
  console.log("Test 3 passed: set + get returns fresh hit");
}

// ── Test 4: TypedCache.get — stale entry ─────────────────────
{
  const cache = new TypedCache<User>(1 /* 1ms TTL */, userValidator);
  cache.set("user:2", validRaw);

  // Wait long enough for the entry to expire
  const waitMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  waitMs(10).then(() => {
    const status = cache.get("user:2");
    console.assert(status.status === "stale", "Test 4 FAILED: should be stale after TTL expires");
    console.log("Test 4 passed: expired entry returns stale status");
  });
}

// ── Test 5: TypedCache.getOrFetch — miss triggers fetch ───────
{
  const cache = new TypedCache<User>(60_000, userValidator);

  const mockFetch = async (_key: string): Promise<unknown> => ({
    id: 42,
    name: "Bob",
    active: false,
  });

  cache.getOrFetch("user:42", mockFetch).then((result: Result<User, string>) => {
    console.assert(result.ok === true, "Test 5a FAILED: getOrFetch should succeed on miss");
    if (result.ok) {
      console.assert(result.value.id === 42,    "Test 5b FAILED: fetched id should be 42");
      console.assert(result.value.name === "Bob", "Test 5c FAILED: fetched name should be Bob");
    }
    // Second call should be a hit — no fetch needed
    const hitStatus = cache.get("user:42");
    console.assert(hitStatus.status === "hit", "Test 5d FAILED: second get should be a hit");
    console.log("Test 5 passed: getOrFetch populates cache on miss");
  });
}

// ── Test 6: TypedCache.purgeExpired ───────────────────────────
{
  const cache = new TypedCache<User>(1 /* 1ms TTL */, userValidator);
  cache.set("user:a", validRaw);
  cache.set("user:b", validRaw);

  const waitMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  waitMs(10).then(() => {
    cache.set("user:c", { id: 3, name: "Carol", active: true }); // fresh entry
    const removed = cache.purgeExpired();
    console.assert(removed === 2, `Test 6a FAILED: expected 2 purged, got ${removed}`);
    const freshStatus = cache.get("user:c");
    console.assert(freshStatus.status === "hit", "Test 6b FAILED: fresh entry should survive purge");
    console.log("Test 6 passed: purgeExpired removes only expired entries");
  });
}

// ── Test 7: TypedCache.revalidate — success ───────────────────
{
  const cache = new TypedCache<User>(1 /* 1ms TTL */, userValidator);
  cache.set("user:99", validRaw);

  const mockFetch = async (_key: string): Promise<unknown> => ({
    id: 99,
    name: "Updated Alice",
    active: true,
  });

  const waitMs = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  waitMs(10).then(() => {
    cache.revalidate("user:99", mockFetch).then((rv: RevalidationResult<User>) => {
      console.assert(rv.revalidated === true, "Test 7a FAILED: revalidation should succeed");
      if (rv.revalidated) {
        console.assert(rv.value.name === "Updated Alice", "Test 7b FAILED: revalidated name mismatch");
      }
      console.log("Test 7 passed: revalidate refreshes a stale entry");
    });
  });
}
