// challenge.test.ts
import {
  composePipeline,
  runPipeline,
  matchError,
  createAuthMiddleware,
  createRateLimitMiddleware,
  createValidationMiddleware,
  type PipelineError,
  type RawContext,
  type Result,
} from "./challenge";

// ── Helpers ──────────────────────────────────────────────────────────────────

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ PASS: ${message}`);
  }
}

function isOk<T>(result: Result<T, PipelineError>): result is { ok: true; value: T } {
  return result.ok === true;
}

function isErr<T>(result: Result<T, PipelineError>): result is { ok: false; error: PipelineError } {
  return result.ok === false;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const TOKEN_MAP = {
  "token-admin": { userId: "user-1", roles: ["admin"] as const },
  "token-editor": { userId: "user-2", roles: ["editor"] as const },
};

const REQUEST_COUNTS: Record<string, number> = {
  "user-1": 3,
  "user-2": 11, // over limit of 10
};

const VALID_BODY = { title: "Hello", content: "World" };
const REQUIRED_FIELDS = ["title", "content"];

// ── Test suite ────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n=== Middleware Pipeline Tests ===\n");

  // ── Test 1: Full happy-path pipeline succeeds ──────────────────────────────
  {
    const rawCtx: RawContext & { token?: string } = {
      requestId: "req-001",
      path: "/articles",
      method: "POST",
      token: "token-admin",
    };

    const authMw    = createAuthMiddleware(TOKEN_MAP);
    const rateMw    = createRateLimitMiddleware(REQUEST_COUNTS, 10, 60_000);
    const validateMw = createValidationMiddleware(VALID_BODY, REQUIRED_FIELDS);

    const pipeline = composePipeline(authMw, rateMw, validateMw);
    const result   = await runPipeline(pipeline, rawCtx);

    assert(isOk(result), "Test 1: Full pipeline succeeds for valid admin request");
    if (isOk(result)) {
      assert(result.value.userId === "user-1",        "Test 1: userId is correct");
      assert(result.value.remainingQuota === 7,       "Test 1: remainingQuota = limit - count = 7");
      assert(result.value.body === VALID_BODY,        "Test 1: body is attached");
    }
  }

  // ── Test 2: Missing token → AuthError ─────────────────────────────────────
  {
    const rawCtx: RawContext & { token?: string } = {
      requestId: "req-002",
      path: "/articles",
      method: "GET",
      // no token
    };

    const authMw = createAuthMiddleware(TOKEN_MAP);
    const result = await runPipeline(authMw, rawCtx);

    assert(isErr(result), "Test 2: Missing token yields an error result");
    if (isErr(result)) {
      assert(result.error.kind === "AuthError", "Test 2: error kind is AuthError");
    }
  }

  // ── Test 3: Rate-limited user → RateLimitError short-circuits ─────────────
  {
    const rawCtx: RawContext & { token?: string } = {
      requestId: "req-003",
      path: "/articles",
      method: "POST",
      token: "token-editor", // user-2 has 11 requests, limit is 10
    };

    const authMw = createAuthMiddleware(TOKEN_MAP);
    const rateMw = createRateLimitMiddleware(REQUEST_COUNTS, 10, 30_000);
    const pipeline = composePipeline(authMw, rateMw);
    const result   = await runPipeline(pipeline, rawCtx);

    assert(isErr(result), "Test 3: Over-limit user yields an error result");
    if (isErr(result)) {
      assert(result.error.kind === "RateLimitError", "Test 3: error kind is RateLimitError");
      assert(
        (result.error as Extract<PipelineError, { kind: "RateLimitError" }>).retryAfterMs === 30_000,
        "Test 3: retryAfterMs is correct"
      );
    }
  }

  // ── Test 4: Missing required body field → ValidationError ─────────────────
  {
    const rawCtx: RawContext & { token?: string } = {
      requestId: "req-004",
      path: "/articles",
      method: "POST",
      token: "token-admin",
    };

    const incompleteBody = { title: "Only title" }; // missing "content"
    const authMw     = createAuthMiddleware(TOKEN_MAP);
    const rateMw     = createRateLimitMiddleware(REQUEST_COUNTS, 10, 60_000);
    const validateMw = createValidationMiddleware(incompleteBody, REQUIRED_FIELDS);
    const pipeline   = composePipeline(authMw, rateMw, validateMw);
    const result     = await runPipeline(pipeline, rawCtx);

    assert(isErr(result), "Test 4: Missing body field yields an error result");
    if (isErr(result)) {
      assert(result.error.kind === "ValidationError", "Test 4: error kind is ValidationError");
      const ve = result.error as Extract<PipelineError, { kind: "ValidationError" }>;
      assert(ve.fields.includes("content"),           "Test 4: missing field 'content' reported");
    }
  }

  // ── Test 5: matchError dispatches to correct handler exhaustively ──────────
  {
    const err: PipelineError = {
      kind: "UpstreamError",
      message: "Service unavailable",
      statusCode: 503,
      upstreamService: "inventory-api",
    };

    const label = matchError(err, {
      AuthError:      (e) => `auth:${e.message}`,
      RateLimitError: (e) => `rate:${e.retryAfterMs}`,
      ValidationError:(e) => `validation:${e.fields.join(",")}`,
      UpstreamError:  (e) => `upstream:${e.upstreamService}:${e.statusCode}`,
    });

    assert(label === "upstream:inventory-api:503", "Test 5: matchError dispatches to UpstreamError handler");
  }

  console.log("\n=== Done ===\n");
}

main().catch(console.error);
