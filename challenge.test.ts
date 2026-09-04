// challenge.test.ts
import {
  classifyResponse,
  exponentialDelay,
  renderError,
  toHttpStatus,
} from "./challenge";

import type {
  HttpError,
  HttpResult,
  RawResponse,
  RequestConfig,
  RetryPolicy,
  Transport,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────
function ok<T>(result: HttpResult<T>): T {
  if (!result.ok) throw new Error("Expected ok, got error: " + JSON.stringify(result.error));
  return result.value;
}
function err<T>(result: HttpResult<T>): HttpError {
  if (result.ok) throw new Error("Expected error, got ok: " + JSON.stringify(result.value));
  return result.error;
}

// ── Mock transport factory ───────────────────────────────────
function makeTransport(responses: Array<RawResponse | "network">): Transport {
  let call = 0;
  return async <TBody>(_config: RequestConfig<TBody>): Promise<RawResponse> => {
    const next = responses[call++] ?? responses[responses.length - 1];
    if (next === "network") throw new Error("Connection refused");
    return next;
  };
}

// ── 1. classifyResponse — 200 ────────────────────────────────
const res200 = classifyResponse({ status: toHttpStatus(200), body: "hello" });
console.assert(res200.ok === true, "200 should be ok");
console.assert(ok(res200) === "hello", "200 body should be 'hello'");

// ── 2. classifyResponse — 404 ────────────────────────────────
const res404 = classifyResponse({ status: toHttpStatus(404), body: "not found" });
console.assert(res404.ok === false, "404 should be error");
console.assert(err(res404).kind === "client", "404 kind should be 'client'");

// ── 3. classifyResponse — 503 ────────────────────────────────
const res503 = classifyResponse({ status: toHttpStatus(503), body: "unavailable" });
console.assert(res503.ok === false, "503 should be error");
console.assert(err(res503).kind === "server", "503 kind should be 'server'");

// ── 4. renderError — exhaustive ──────────────────────────────
const networkErr: HttpError = { kind: "network", message: "timeout" };
const clientErr: HttpError  = { kind: "client",  status: toHttpStatus(403), body: "forbidden" };
const serverErr: HttpError  = { kind: "server",  status: toHttpStatus(500), body: "boom" };

console.assert(renderError(networkErr) === "Network error: timeout",          "network render");
console.assert(renderError(clientErr)  === "Client error 403: forbidden",     "client render");
console.assert(renderError(serverErr)  === "Server error 500: boom",          "server render");

// ── 5. exponentialDelay — timing ────────────────────────────
(async () => {
  const before = Date.now();
  await exponentialDelay(50, 2); // should wait ~100 ms
  const elapsed = Date.now() - before;
  console.assert(elapsed >= 90, `exponentialDelay attempt 2 should wait ≥90 ms, got ${elapsed}`);
})();

// ── 6. fetchWithRetry — succeeds on second attempt ──────────
(async () => {
  // Dynamically import to avoid top-level await issues in test harness
  const { fetchWithRetry } = await import("./challenge") as { fetchWithRetry: Function };

  const transport = makeTransport([
    "network",
    { status: toHttpStatus(200), body: "recovered" },
  ]);
  const policy: RetryPolicy = { maxAttempts: 3, baseDelayMs: 10, retryOn: ["network"] };
  const config: RequestConfig<undefined> = { url: "/ping", method: "GET" };

  const result = await fetchWithRetry(config, transport, policy) as HttpResult<string>;
  console.assert(result.ok === true, "should succeed on retry after network error");
  console.assert(ok(result) === "recovered", "body should be 'recovered'");
})();

// ── 7. fetchWithRetry — does NOT retry 4xx ──────────────────
(async () => {
  const { fetchWithRetry } = await import("./challenge") as { fetchWithRetry: Function };

  const transport = makeTransport([
    { status: toHttpStatus(400), body: "bad request" },
    { status: toHttpStatus(200), body: "should not reach" },
  ]);
  const policy: RetryPolicy = { maxAttempts: 3, baseDelayMs: 10, retryOn: ["network", "server"] };
  const config: RequestConfig<undefined> = { url: "/bad", method: "GET" };

  const result = await fetchWithRetry(config, transport, policy) as HttpResult<string>;
  console.assert(result.ok === false, "4xx should not be retried");
  console.assert(err(result).kind === "client", "error kind should be 'client'");
})();

console.log("All assertions passed ✓");
