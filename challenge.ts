// ============================================================
// Typed Retry Scheduler with Exponential Backoff
// ============================================================
// SCENARIO: You're building the resilience layer for a microservice
// that calls unreliable third-party APIs. Implement a typed retry
// scheduler that runs an async operation under a declared retry policy,
// records every attempt, and resolves to a discriminated Result.
//
// No `any`, no `as`, no unsafe casts — strict: true throughout.
// ============================================================

// ── 1. Branded primitive ─────────────────────────────────────
// Requirement 1: Define a branded type `Milliseconds` (brand: "ms")
//   over `number` so delay values are never confused with raw numbers.

export type Milliseconds = number & { readonly __brand: "ms" };

/** Helper — the ONLY place a raw number is promoted to Milliseconds. */
export function ms(value: number): Milliseconds {
  // TODO: implement (one line — just return the branded value)
  throw new Error("Not implemented");
}

// ── 2. Retry policy ─────────────────────────────────────────
// Requirement 2: Define `RetryPolicy` with ALL of the following fields:
//   - maxAttempts:    number          — total tries (including the first)
//   - baseDelay:      Milliseconds    — delay before the 2nd attempt
//   - maxDelay:       Milliseconds    — cap on any single delay
//   - backoffFactor:  number          — multiplier applied each retry
//   - shouldRetry:    (error: unknown) => boolean
//                     — predicate; return false to abort early

export type RetryPolicy = {
  // TODO: add the five fields described above
};

// ── 3. Attempt record ────────────────────────────────────────
// Requirement 3: Define `AttemptRecord<T>` as a discriminated union
//   with two members, both carrying `attemptNumber: number`:
//   - { status: "success"; attemptNumber: number; value: T; durationMs: Milliseconds }
//   - { status: "failure"; attemptNumber: number; error: unknown; durationMs: Milliseconds }

export type AttemptRecord<T> =
  // TODO: define the discriminated union (two members, discriminant: "status")
  never;

// ── 4. Scheduler result ──────────────────────────────────────
// Requirement 4: Define `SchedulerResult<T>` as a discriminated union:
//   - { outcome: "succeeded"; value: T; attempts: AttemptRecord<T>[] }
//   - { outcome: "failed";    lastError: unknown; attempts: AttemptRecord<T>[] }

export type SchedulerResult<T> =
  // TODO: define the discriminated union (two members, discriminant: "outcome")
  never;

// ── 5. Delay calculator ──────────────────────────────────────
// Requirement 5: Implement `calcDelay(policy, attemptIndex)`:
//   - attemptIndex is 0-based (0 = before 2nd attempt, 1 = before 3rd, …)
//   - delay = policy.baseDelay * (policy.backoffFactor ** attemptIndex)
//   - clamp the result to policy.maxDelay
//   - return a Milliseconds value

export function calcDelay(policy: RetryPolicy, attemptIndex: number): Milliseconds {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 6. Core scheduler ────────────────────────────────────────
// Requirement 6: Implement `withRetry<T>(operation, policy, sleep?)`:
//
//   Parameters:
//     operation — () => Promise<T>   — the fallible async call
//     policy    — RetryPolicy
//     sleep     — optional (delayMs: Milliseconds) => Promise<void>
//                 defaults to a real setTimeout-based implementation
//
//   Behaviour:
//     a) Run `operation()` up to policy.maxAttempts times.
//     b) After each failure, call policy.shouldRetry(error):
//        - false  → stop immediately (do NOT consume another attempt)
//        - true   → wait calcDelay(policy, retryIndex) then try again
//     c) Record EVERY attempt (success or failure) as an AttemptRecord<T>.
//        durationMs = wall-clock time of that single attempt (use Date.now()).
//     d) Resolve with SchedulerResult<T>:
//        - If any attempt succeeds → outcome "succeeded"
//        - If all attempts fail    → outcome "failed", lastError = last error
//
//   Return type must be Promise<SchedulerResult<T>>.

export async function withRetry<T>(
  operation: () => Promise<T>,
  policy: RetryPolicy,
  sleep?: (delayMs: Milliseconds) => Promise<void>
): Promise<SchedulerResult<T>> {
  // TODO: implement
  throw new Error("Not implemented");
}

// ── 7. Type-level helpers (no runtime code needed) ───────────
// Requirement 7: Using conditional types, define:
//
//   ExtractSuccess<R> — if R extends SchedulerResult<infer T>
//                       and outcome is "succeeded", resolve to T;
//                       otherwise resolve to never.
//
//   Example: ExtractSuccess<SchedulerResult<string>> → string

export type ExtractSuccess<R> =
  // TODO: implement with conditional types + infer
  never;
