// ─────────────────────────────────────────────────────────────────────────────
// challenge.test.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  aggregatePages,
  paginatorFor,
  type Page,
  type AggregatorResult,
  type PaginatorConfig,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────────────────────

type Widget = { id: number; name: string };

/** Build a fake multi-page fetchPage that returns `pages` in order. */
function makeFakeFetch(
  pages: Array<{ items: Widget[]; nextCursor: string | null }>,
  delayMs = 0
): PaginatorConfig<Widget>["fetchPage"] {
  let callIndex = 0;
  return async (_cursor, signal) => {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    if (delayMs > 0) {
      await new Promise<void>((res, rej) => {
        const t = setTimeout(res, delayMs);
        signal.addEventListener("abort", () => {
          clearTimeout(t);
          rej(new DOMException("Aborted", "AbortError"));
        });
      });
    }
    const page = pages[callIndex++];
    if (!page) throw new Error("No more pages available");
    return page;
  };
}

// ── Test 1: happy path — collects all items across 3 pages ───────────────────
async function test_happyPath() {
  const config: PaginatorConfig<Widget> = {
    fetchPage: makeFakeFetch([
      { items: [{ id: 1, name: "A" }, { id: 2, name: "B" }], nextCursor: "c1" },
      { items: [{ id: 3, name: "C" }],                        nextCursor: "c2" },
      { items: [{ id: 4, name: "D" }, { id: 5, name: "E" }], nextCursor: null },
    ]),
    pageTimeoutMs: 1000,
    maxPages: 10,
  };

  const result = await aggregatePages(config);
  console.assert(result.status === "ok", "Test 1a: status should be ok");
  if (result.status === "ok") {
    console.assert(result.items.length === 5,      "Test 1b: should collect 5 items");
    console.assert(result.pagesFetched === 3,      "Test 1c: should fetch 3 pages");
    console.assert(result.items[0].id === 1,       "Test 1d: first item id = 1");
    console.assert(result.items[4].name === "E",   "Test 1e: last item name = E");
  }
}

// ── Test 2: maxPages cap triggers error result ────────────────────────────────
async function test_maxPagesCap() {
  const config: PaginatorConfig<Widget> = {
    fetchPage: makeFakeFetch([
      { items: [{ id: 1, name: "A" }], nextCursor: "c1" },
      { items: [{ id: 2, name: "B" }], nextCursor: "c2" }, // would continue
    ]),
    pageTimeoutMs: 1000,
    maxPages: 1, // only allow 1 page
  };

  const result = await aggregatePages(config);
  console.assert(result.status === "error",                 "Test 2a: status should be error");
  if (result.status === "error") {
    console.assert(result.reason.kind === "max_pages",      "Test 2b: reason kind = max_pages");
    if (result.reason.kind === "max_pages") {
      console.assert(result.reason.limit === 1,             "Test 2c: limit = 1");
    }
    console.assert(result.partialItems.length === 1,        "Test 2d: partialItems has 1 item");
    console.assert(result.pagesFetched === 1,               "Test 2e: pagesFetched = 1");
  }
}

// ── Test 3: per-page timeout triggers error result ────────────────────────────
async function test_timeout() {
  const config: PaginatorConfig<Widget> = {
    fetchPage: makeFakeFetch(
      [{ items: [{ id: 1, name: "A" }], nextCursor: "c1" }],
      200 // simulated delay of 200ms
    ),
    pageTimeoutMs: 50, // timeout fires before fetch completes
    maxPages: 10,
  };

  const result = await aggregatePages(config);
  console.assert(result.status === "error",               "Test 3a: status should be error");
  if (result.status === "error") {
    console.assert(result.reason.kind === "timeout",      "Test 3b: reason kind = timeout");
    if (result.reason.kind === "timeout") {
      console.assert(result.reason.pageIndex === 0,       "Test 3c: timed out on page 0");
    }
  }
}

// ── Test 4: network error triggers error result ───────────────────────────────
async function test_networkError() {
  const config: PaginatorConfig<Widget> = {
    fetchPage: async (_cursor, _signal) => {
      throw new Error("DNS resolution failed");
    },
    pageTimeoutMs: 1000,
    maxPages: 10,
  };

  const result = await aggregatePages(config);
  console.assert(result.status === "error",                       "Test 4a: status should be error");
  if (result.status === "error") {
    console.assert(result.reason.kind === "network",              "Test 4b: reason kind = network");
    if (result.reason.kind === "network") {
      console.assert(
        result.reason.message.includes("DNS"),                    "Test 4c: message includes 'DNS'"
      );
      console.assert(result.reason.pageIndex === 0,               "Test 4d: failed on page 0");
    }
  }
}

// ── Test 5: paginatorFor type-checks and builds a valid config ────────────────
async function test_paginatorFor() {
  // We just verify the shape is correct and fetchPage is a function;
  // actual network calls are skipped in this unit harness.
  const config = paginatorFor<Widget>({
    url: "https://api.example.com/widgets",
    transform: (raw) => {
      // Minimal structural check (real impl would validate deeply)
      const r = raw as { items: Widget[]; nextCursor: string | null };
      return { items: r.items, nextCursor: r.nextCursor };
    },
    pageTimeoutMs: 3000,
    maxPages: 50,
  });

  console.assert(typeof config.fetchPage === "function",  "Test 5a: fetchPage is a function");
  console.assert(config.pageTimeoutMs === 3000,           "Test 5b: pageTimeoutMs = 3000");
  console.assert(config.maxPages === 50,                  "Test 5c: maxPages = 50");
}

// ── Runner ────────────────────────────────────────────────────────────────────
(async () => {
  await test_happyPath();
  await test_maxPagesCap();
  await test_timeout();
  await test_networkError();
  await test_paginatorFor();
  console.log("All tests complete.");
})();
