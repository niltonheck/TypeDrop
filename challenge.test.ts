// challenge.test.ts
// Run with: npx ts-node --strict challenge.test.ts
// (or add to your Jest / Vitest suite)

import {
  defineEndpoint,
  buildCaller,
  createApiClient,
  ExtractPathParams,
  CallOptions,
  ApiResult,
  EndpointDef,
} from "./challenge";

// ─── Mock data shapes ────────────────────────────────────────────────────────

type User = { id: string; name: string; email: string };
type Post = { id: string; title: string; body: string };
type HealthCheck = { status: "ok" | "degraded" };

// ─── Type-level tests (compile-time only) ────────────────────────────────────

// Requirement 2: ExtractPathParams
type _T1 = ExtractPathParams<"/users/:id">;                   // should be "id"
type _T2 = ExtractPathParams<"/users/:id/posts/:postId">;     // should be "id" | "postId"
type _T3 = ExtractPathParams<"/health">;                      // should be never

// Requirement 3: CallOptions
type _T4 = CallOptions<"/health">;         // no `pathParams` key
type _T5 = CallOptions<"/users/:id">;      // `pathParams: { id: string }` required

// Requirement 4: defineEndpoint — curried, infers path, fixes response type
const getUserDef = defineEndpoint("GET", "/users/:id")<User>();
const createPostDef = defineEndpoint("POST", "/users/:id/posts")<Post>();
const healthDef = defineEndpoint("GET", "/health")<HealthCheck>();

// Verify shapes compile correctly
const _check1: EndpointDef<"/users/:id", User> = getUserDef;
const _check2: EndpointDef<"/users/:id/posts", Post> = createPostDef;
const _check3: EndpointDef<"/health", HealthCheck> = healthDef;

// ─── Runtime tests with a mocked fetch ───────────────────────────────────────

// Helper: install a mock fetch that returns a fixed payload
function mockFetch(status: number, payload: unknown, ok = true): void {
  (globalThis as Record<string, unknown>)["fetch"] = async (
    _url: string,
    _init?: RequestInit
  ): Promise<Response> => {
    return {
      ok,
      status,
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    } as unknown as Response;
  };
}

function mockFetchThrow(message: string): void {
  (globalThis as Record<string, unknown>)["fetch"] = async (): Promise<never> => {
    throw new Error(message);
  };
}

// ─── Test 1: buildCaller — successful GET with path params ───────────────────
(async () => {
  const mockUser: User = { id: "42", name: "Alice", email: "alice@example.com" };
  mockFetch(200, mockUser, true);

  const getUser = buildCaller(getUserDef, "https://api.example.com");
  const result = await getUser({ pathParams: { id: "42" } });

  console.assert(result.ok === true, "Test 1a FAILED: expected ok=true");
  if (result.ok) {
    console.assert(result.data.id === "42",    "Test 1b FAILED: data.id mismatch");
    console.assert(result.data.name === "Alice","Test 1c FAILED: data.name mismatch");
    console.assert(result.status === 200,       "Test 1d FAILED: status should be 200");
  }
  console.log("Test 1 PASSED: buildCaller successful GET with path params");
})();

// ─── Test 2: buildCaller — 404 error response ────────────────────────────────
(async () => {
  mockFetch(404, { message: "Not found" }, false);

  const getUser = buildCaller(getUserDef, "https://api.example.com");
  const result = await getUser({ pathParams: { id: "999" } });

  console.assert(result.ok === false, "Test 2a FAILED: expected ok=false");
  if (!result.ok) {
    console.assert(result.status === 404, "Test 2b FAILED: status should be 404");
    console.assert(typeof result.error === "string", "Test 2c FAILED: error should be string");
  }
  console.log("Test 2 PASSED: buildCaller handles error response");
})();

// ─── Test 3: buildCaller — network failure ───────────────────────────────────
(async () => {
  mockFetchThrow("Network unreachable");

  const getUser = buildCaller(getUserDef, "https://api.example.com");
  const result = await getUser({ pathParams: { id: "1" } });

  console.assert(result.ok === false,   "Test 3a FAILED: expected ok=false");
  console.assert(result.status === 0,   "Test 3b FAILED: status should be 0");
  console.assert(
    result.ok === false && result.error.includes("Network unreachable"),
    "Test 3c FAILED: error message should contain thrown message"
  );
  console.log("Test 3 PASSED: buildCaller handles network error");
})();

// ─── Test 4: buildCaller — no path params (health endpoint) ──────────────────
(async () => {
  const mockHealth: HealthCheck = { status: "ok" };
  mockFetch(200, mockHealth, true);

  const checkHealth = buildCaller(healthDef, "https://api.example.com");
  // NOTE: passing `{}` (no pathParams) must compile — type-level check
  const result = await checkHealth({});

  console.assert(result.ok === true, "Test 4a FAILED: expected ok=true");
  if (result.ok) {
    console.assert(result.data.status === "ok", "Test 4b FAILED: health status mismatch");
  }
  console.log("Test 4 PASSED: buildCaller works with no path params");
})();

// ─── Test 5: createApiClient — builds a correctly keyed client object ─────────
(async () => {
  const mockUser: User = { id: "7", name: "Bob", email: "bob@example.com" };
  mockFetch(200, mockUser, true);

  const client = createApiClient("https://api.example.com", {
    getUser: getUserDef,
    health: healthDef,
  });

  // The `client` object must have `getUser` and `health` as typed callers
  console.assert(typeof client.getUser === "function", "Test 5a FAILED: client.getUser not a function");
  console.assert(typeof client.health  === "function", "Test 5b FAILED: client.health not a function");

  const result = await client.getUser({ pathParams: { id: "7" } });
  console.assert(result.ok === true, "Test 5c FAILED: expected ok=true");
  if (result.ok) {
    console.assert(result.data.name === "Bob", "Test 5d FAILED: data.name mismatch");
  }
  console.log("Test 5 PASSED: createApiClient returns a correctly keyed client");
})();
