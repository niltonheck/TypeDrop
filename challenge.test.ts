// ============================================================
// challenge.test.ts — verify your implementation
// Run with: npx ts-node --project tsconfig.json challenge.test.ts
// ============================================================

import {
  makeEndpointUrl,
  ok, err,
  parseMarketQuote,
  computeDelay,
  fetchWithRetry,
  orchestrate,
  aggregateReport,
  extractFulfilledUrls,
  DEFAULT_POLICY,
  type EndpointSpec,
  type Fetcher,
  type MarketQuote,
  type OrchestrationReport,
} from "./challenge";

// ── helpers ─────────────────────────────────────────────────
function assert(condition: boolean, msg: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${msg}`);
  }
}

// ── TEST 1: makeEndpointUrl & branded type ───────────────────
console.log("\n[1] makeEndpointUrl");
const validUrl = makeEndpointUrl("https://market.example.com/quote/AAPL");
assert(validUrl !== "invalid", "valid https URL should NOT return 'invalid'");
assert(makeEndpointUrl("http://insecure.com") === "invalid", "http URL should return 'invalid'");
assert(makeEndpointUrl("ftp://nope.com") === "invalid", "ftp URL should return 'invalid'");

// ── TEST 2: parseMarketQuote ─────────────────────────────────
console.log("\n[2] parseMarketQuote");
const goodRaw = { symbol: "AAPL", price: 189.5, assetClass: "equity", timestampMs: 1716800000000 };
const parsed = parseMarketQuote(goodRaw);
assert(parsed.ok === true, "valid raw object should parse successfully");
if (parsed.ok) {
  assert(parsed.value.symbol === "AAPL", "symbol should be AAPL");
  assert(parsed.value.assetClass === "equity", "assetClass should be equity");
}
assert(parseMarketQuote(null).ok === false, "null should fail validation");
assert(parseMarketQuote({ symbol: "X", price: "bad", assetClass: "equity", timestampMs: 0 }).ok === false,
  "non-numeric price should fail");
assert(parseMarketQuote({ symbol: "X", price: 1, assetClass: "nft", timestampMs: 0 }).ok === false,
  "unknown assetClass 'nft' should fail");

// ── TEST 3: computeDelay ─────────────────────────────────────
console.log("\n[3] computeDelay");
assert(computeDelay(DEFAULT_POLICY, 0) === 100, "attempt 0 → 100 ms");
assert(computeDelay(DEFAULT_POLICY, 1) === 200, "attempt 1 → 200 ms");
assert(computeDelay(DEFAULT_POLICY, 2) === 400, "attempt 2 → 400 ms");
// With a tiny maxDelayMs the cap should kick in
assert(computeDelay({ ...DEFAULT_POLICY, maxDelayMs: 150 }, 1) === 150, "delay capped at maxDelayMs");

// ── TEST 4: fetchWithRetry — happy path ──────────────────────
console.log("\n[4] fetchWithRetry — happy path");
(async () => {
  const goodQuote: MarketQuote = { symbol: "BTC", price: 67000, assetClass: "crypto", timestampMs: Date.now() };
  const mockFetcher: Fetcher = async (_url, _sig) => goodQuote;
  const ac = new AbortController();
  const result = await fetchWithRetry(validUrl as ReturnType<typeof makeEndpointUrl> & string extends infer U ? U extends "invalid" ? never : U : never,
    mockFetcher, DEFAULT_POLICY, ac.signal);
  // Just use validUrl directly — it's already EndpointUrl | "invalid"
  // We'll cast via the branded helper result (it's not "invalid" per test 1)
  assert(result.ok === true, "happy-path fetcher should return ok");
  if (result.ok) assert(result.value.symbol === "BTC", "symbol should be BTC");
})().catch(console.error);

// ── TEST 4b: fetchWithRetry — invalid response, no retry ─────
(async () => {
  let calls = 0;
  const badFetcher: Fetcher = async () => { calls++; return { broken: true }; };
  const ac = new AbortController();
  // makeEndpointUrl already validated — use non-null assertion pattern via helper
  const url = makeEndpointUrl("https://bad-shape.example.com");
  if (url === "invalid") return;
  const result = await fetchWithRetry(url, badFetcher, DEFAULT_POLICY, ac.signal);
  assert(result.ok === false && result.error === "INVALID_RESPONSE",
    "bad shape should return INVALID_RESPONSE immediately");
  assert(calls === 1, "should NOT retry on INVALID_RESPONSE — called exactly once");
})().catch(console.error);

// ── TEST 5: orchestrate + aggregateReport ────────────────────
console.log("\n[5] orchestrate + aggregateReport");
(async () => {
  const quotes: MarketQuote[] = [
    { symbol: "AAPL", price: 190,   assetClass: "equity",    timestampMs: 1 },
    { symbol: "MSFT", price: 420,   assetClass: "equity",    timestampMs: 2 },
    { symbol: "BTC",  price: 67000, assetClass: "crypto",    timestampMs: 3 },
    { symbol: "GOLD", price: 2300,  assetClass: "commodity", timestampMs: 4 },
  ];
  let idx = 0;
  const roundRobinFetcher: Fetcher = async () => quotes[idx++ % quotes.length];

  const specs: EndpointSpec[] = quotes.map((q, i) => ({
    url: makeEndpointUrl(`https://market.example.com/q${i}`) as Exclude<ReturnType<typeof makeEndpointUrl>, "invalid">,
    policy: DEFAULT_POLICY,
  }));

  const ac = new AbortController();
  const report = await orchestrate(specs, roundRobinFetcher, 2, ac.signal);

  const keys = Object.keys(report);
  assert(keys.length === 4, `report should have 4 entries, got ${keys.length}`);

  const agg = aggregateReport(report);
  assert(agg.equity !== undefined, "equity summary should exist");
  if (agg.equity) {
    assert(agg.equity.count === 2, "equity count should be 2");
    assert(agg.equity.avgPrice === 305, `equity avgPrice should be 305, got ${agg.equity.avgPrice}`);
    assert(agg.equity.minPrice === 190, "equity minPrice should be 190");
    assert(agg.equity.maxPrice === 420, "equity maxPrice should be 420");
  }
  assert(agg.crypto !== undefined, "crypto summary should exist");
  assert(agg.bond === undefined, "bond summary should be absent");

  // ── TEST 6: extractFulfilledUrls ─────────────────────────────
  console.log("\n[6] extractFulfilledUrls");
  const mixedReport: OrchestrationReport = {
    "https://a.com": { status: "fulfilled", quote: quotes[0] },
    "https://b.com": { status: "rejected",  error: "NETWORK_ERROR", detail: "conn refused" },
    "https://c.com": { status: "fulfilled", quote: quotes[1] },
  };
  const fulfilled = extractFulfilledUrls(mixedReport);
  assert(fulfilled.length === 2, `should return 2 fulfilled URLs, got ${fulfilled.length}`);
  assert(fulfilled.includes("https://a.com"), "should include https://a.com");
  assert(!fulfilled.includes("https://b.com"), "should NOT include https://b.com");
})().catch(console.error);
