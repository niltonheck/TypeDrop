// challenge.test.ts
// Run with: npx ts-node --strict challenge.test.ts
// (or compile + node)

import {
  makeValidUrl,
  makePageNumber,
  ok,
  err,
  fetchPage,
  fetchAllPages,
  withRetry,
  createPaginatedClient,
  type ValidUrl,
  type PageNumber,
  type PageEnvelope,
  type ApiError,
  type Result,
  type ClientConfig,
} from "./challenge";

// ─── helpers ────────────────────────────────────────────────
function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  console.log(`PASS: ${msg}`);
}

function neverAborted(): AbortSignal {
  return new AbortController().signal;
}

// ─── mock dataset ───────────────────────────────────────────
interface Widget {
  id: number;
  name: string;
}

const PAGES: Widget[][] = [
  [{ id: 1, name: "Sprocket" }, { id: 2, name: "Cog" }],
  [{ id: 3, name: "Lever" },   { id: 4, name: "Pulley" }],
  [{ id: 5, name: "Gear" }],
];

/** Simulates a paginated API over `PAGES`. */
function mockFetch(url: string): Promise<Response> {
  const match = url.match(/page=(\d+)/);
  const pageIdx = match ? parseInt(match[1], 10) - 1 : 0;
  const items = PAGES[pageIdx] ?? [];
  const totalPages = PAGES.length;
  const hasNext = pageIdx + 1 < totalPages;

  const body = JSON.stringify({
    items,
    page: pageIdx + 1,
    totalPages,
    nextPage: hasNext ? pageIdx + 2 : null,
  });

  return Promise.resolve(new Response(body, { status: 200 }));
}

// Monkey-patch global fetch for tests
(globalThis as { fetch: unknown }).fetch = mockFetch;

// ─── § 1  Branded constructors ──────────────────────────────
assert(
  (() => { try { makeValidUrl(""); return false; } catch { return true; } })(),
  "makeValidUrl throws on empty string"
);

assert(
  makeValidUrl("https://api.example.com") === "https://api.example.com",
  "makeValidUrl returns the string unchanged when valid"
);

assert(
  (() => { try { makePageNumber(0); return false; } catch { return true; } })(),
  "makePageNumber throws on 0"
);

assert(
  makePageNumber(3) === 3,
  "makePageNumber returns the number unchanged when valid"
);

// ─── § 2  Result helpers ────────────────────────────────────
const okResult = ok<number>(42);
assert(okResult.ok === true && okResult.value === 42, "ok() constructs Ok<number>");

const errResult = err<ApiError>({ kind: "network", message: "timeout" });
assert(errResult.ok === false && errResult.error.kind === "network", "err() constructs Err<ApiError>");

// ─── § 3  withRetry — succeeds on second attempt ────────────
(async () => {
  let calls = 0;
  const result = await withRetry<string>(
    async (_attempt) => {
      calls++;
      if (calls < 2) return err({ kind: "network", message: "fluke" });
      return ok("hello");
    },
    { maxAttempts: 3, baseDelayMs: 1 },
    neverAborted()
  );
  assert(result.ok === true && (result as { ok: true; value: string }).value === "hello",
    "withRetry resolves Ok on second attempt");
  assert(calls === 2, "withRetry called operation exactly twice");

  // ─── § 4  withRetry — exhausts all attempts ──────────────
  const exhausted = await withRetry<string>(
    async () => err({ kind: "network", message: "down" }),
    { maxAttempts: 2, baseDelayMs: 1 },
    neverAborted()
  );
  assert(
    !exhausted.ok && exhausted.error.kind === "exhausted" &&
    (exhausted.error as { kind: "exhausted"; attempts: number }).attempts === 2,
    "withRetry returns exhausted error after all attempts fail"
  );

  // ─── § 5  createPaginatedClient — fetchAll collects items ─
  const config: ClientConfig<Widget> = {
    baseUrl: makeValidUrl("https://api.example.com/widgets"),
    buildUrl: (base, page) => makeValidUrl(`${base}?page=${page}`),
    parseItems: (raw) => {
      if (
        raw !== null &&
        typeof raw === "object" &&
        "items" in raw &&
        Array.isArray((raw as { items: unknown }).items)
      ) {
        return ok((raw as { items: Widget[] }).items);
      }
      return err({ kind: "parse", message: "unexpected shape" });
    },
    retry: { maxAttempts: 2, baseDelayMs: 1 },
  };

  const client = createPaginatedClient<Widget>(config);
  const all = await client.fetchAll(neverAborted());
  assert(all.ok === true, "fetchAll returns Ok");
  const items = (all as { ok: true; value: Widget[] }).value;
  assert(items.length === 5, `fetchAll collected all 5 widgets (got ${items.length})`);
  assert(items[4].name === "Gear", "fetchAll last item is Gear");

  console.log("\nAll assertions passed ✓");
})().catch((e) => { console.error(e); process.exit(1); });
