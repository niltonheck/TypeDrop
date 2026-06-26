// ============================================================
// challenge.ts — Typed Event Sourcing Engine
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every TODO. Do NOT change existing type signatures.
// ============================================================

// ─── 1. DOMAIN EVENTS (discriminated union) ──────────────────

export type AccountOpenedEvent = {
  readonly type: "AccountOpened";
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredAt: string; // ISO-8601
  readonly payload: {
    readonly owner: string;
    readonly initialDeposit: number; // must be >= 0
  };
};

export type MoneyDepositedEvent = {
  readonly type: "MoneyDeposited";
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredAt: string;
  readonly payload: {
    readonly amount: number; // must be > 0
  };
};

export type MoneyWithdrawnEvent = {
  readonly type: "MoneyWithdrawn";
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredAt: string;
  readonly payload: {
    readonly amount: number; // must be > 0
  };
};

export type AccountClosedEvent = {
  readonly type: "AccountClosed";
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredAt: string;
  readonly payload: {
    readonly reason: string;
  };
};

// TODO 1: Define `DomainEvent` as the discriminated union of all four event types above.
export type DomainEvent = /* TODO */never;

// ─── 2. AGGREGATE STATE ──────────────────────────────────────

export type AccountStatus = "open" | "closed";

export type AccountState = {
  readonly aggregateId: string;
  readonly owner: string;
  readonly balance: number;
  readonly status: AccountStatus;
  readonly version: number; // incremented once per applied event
};

// ─── 3. SNAPSHOT ─────────────────────────────────────────────

export type Snapshot<S> = {
  readonly aggregateId: string;
  readonly state: S;
  readonly version: number; // version of the last event baked into this snapshot
};

// ─── 4. RESULT TYPE ──────────────────────────────────────────

export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E extends string> = { readonly ok: false; readonly error: E };
export type Result<T, E extends string> = Ok<T> | Err<E>;

// Convenience constructors (already implemented — do not modify)
export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E extends string>(error: E): Err<E> => ({ ok: false, error });

// ─── 5. VALIDATION ERRORS ────────────────────────────────────

export type ValidationError =
  | "MISSING_TYPE"
  | "UNKNOWN_EVENT_TYPE"
  | "MISSING_EVENT_ID"
  | "MISSING_AGGREGATE_ID"
  | "MISSING_OCCURRED_AT"
  | "INVALID_PAYLOAD";

// ─── 6. RUNTIME VALIDATOR ────────────────────────────────────

/**
 * TODO 2: Implement `validateEvent`.
 *
 * Requirements:
 * - Input is `unknown`; output is `Result<DomainEvent, ValidationError>`
 * - Must check that the value is a non-null object
 * - Must check `type` is one of the four known strings → "UNKNOWN_EVENT_TYPE" if not
 * - Must check `eventId`, `aggregateId`, `occurredAt` are non-empty strings
 * - Must validate each event's payload fields:
 *     AccountOpened   → owner: string, initialDeposit: number >= 0
 *     MoneyDeposited  → amount: number > 0
 *     MoneyWithdrawn  → amount: number > 0
 *     AccountClosed   → reason: non-empty string
 * - Return the narrowed `DomainEvent` on success
 */
export function validateEvent(raw: unknown): Result<DomainEvent, ValidationError> {
  // TODO 2
  throw new Error("Not implemented");
}

// ─── 7. AGGREGATE REDUCER ────────────────────────────────────

export type ReducerError =
  | "ACCOUNT_ALREADY_EXISTS"
  | "ACCOUNT_NOT_OPEN"
  | "INSUFFICIENT_FUNDS"
  | "WRONG_AGGREGATE";

/**
 * TODO 3: Implement `applyEvent`.
 *
 * Requirements:
 * - `state` is `AccountState | null` (null means no aggregate exists yet)
 * - Returns `Result<AccountState, ReducerError>`
 * - "AccountOpened"  → only valid when state is null; initialises state (version 1)
 * - "MoneyDeposited" → only valid when status is "open"; adds amount to balance
 * - "MoneyWithdrawn" → only valid when status is "open"; subtracts amount;
 *                      return "INSUFFICIENT_FUNDS" if amount > balance
 * - "AccountClosed"  → only valid when status is "open"; sets status to "closed"
 * - All events: if state is non-null and event.aggregateId !== state.aggregateId
 *               return "WRONG_AGGREGATE"
 * - Increment `version` by 1 on every successful application
 */
export function applyEvent(
  state: AccountState | null,
  event: DomainEvent
): Result<AccountState, ReducerError> {
  // TODO 3
  throw new Error("Not implemented");
}

// ─── 8. EVENT LOG REBUILDER ───────────────────────────────────

/**
 * TODO 4: Implement `rebuildFromEvents`.
 *
 * Requirements:
 * - Accepts an optional `Snapshot<AccountState>` as a starting point
 * - Replays only the events whose implicit sequence position is > snapshot.version
 *   (i.e. skip the first `snapshot.version` events — they are already baked in)
 * - Returns `Result<AccountState, ReducerError>` — the first reducer error short-circuits
 * - If `events` is empty AND no snapshot is provided, return an `Err("ACCOUNT_NOT_OPEN")`
 */
export function rebuildFromEvents(
  events: readonly DomainEvent[],
  snapshot?: Snapshot<AccountState>
): Result<AccountState, ReducerError> {
  // TODO 4
  throw new Error("Not implemented");
}

// ─── 9. PROJECTIONS ──────────────────────────────────────────

// A projection folds a stream of events into a read model R.
// TODO 5: Define the `Projection<R>` type as a generic interface with:
//   - `name: string`
//   - `init: () => R`  — returns the initial/empty read model
//   - `apply: (readModel: R, event: DomainEvent) => R`  — pure fold step
export interface Projection<R> {
  // TODO 5
}

// ─── Built-in projections (you must implement both) ──────────

// 9a. Balance ledger: a running list of balance-changing entries
export type LedgerEntry = {
  readonly eventId: string;
  readonly type: "credit" | "debit";
  readonly amount: number;
  readonly occurredAt: string;
  readonly balanceAfter: number;
};

export type LedgerReadModel = {
  readonly aggregateId: string | null;
  readonly entries: readonly LedgerEntry[];
  readonly currentBalance: number;
};

/**
 * TODO 6: Implement `ledgerProjection`.
 * - Only "MoneyDeposited" and "MoneyWithdrawn" produce ledger entries.
 * - "AccountOpened" sets aggregateId and credits the initialDeposit (if > 0).
 * - Ignore "AccountClosed".
 */
export const ledgerProjection: Projection<LedgerReadModel> = {
  // TODO 6
  name: "ledger",
  init: () => ({ aggregateId: null, entries: [], currentBalance: 0 }),
  apply: (_readModel, _event) => {
    throw new Error("Not implemented");
  },
};

// 9b. Account summary: lightweight aggregate overview
export type AccountSummary = {
  readonly aggregateId: string | null;
  readonly owner: string | null;
  readonly status: AccountStatus | null;
  readonly totalDeposited: number;
  readonly totalWithdrawn: number;
  readonly transactionCount: number;
};

/**
 * TODO 7: Implement `summaryProjection`.
 * - Track owner and status from AccountOpened / AccountClosed.
 * - Accumulate totalDeposited (MoneyDeposited) and totalWithdrawn (MoneyWithdrawn).
 * - transactionCount increments for every MoneyDeposited or MoneyWithdrawn event.
 */
export const summaryProjection: Projection<AccountSummary> = {
  // TODO 7
  name: "summary",
  init: () => ({
    aggregateId: null,
    owner: null,
    status: null,
    totalDeposited: 0,
    totalWithdrawn: 0,
    transactionCount: 0,
  }),
  apply: (_readModel, _event) => {
    throw new Error("Not implemented");
  },
};

// ─── 10. PROJECTION RUNNER ────────────────────────────────────

/**
 * TODO 8: Implement `runProjections`.
 *
 * Signature must stay exactly as below.
 *
 * Requirements:
 * - Accept a tuple of projections (at least one) whose read-model types are inferred
 * - Replay all events through each projection independently
 * - Return a tuple of read models in the same order as the input projections tuple
 *
 * Hint: You'll need a mapped type or conditional type to derive the return tuple
 *       from the input projections tuple.
 */
export function runProjections<const Ps extends readonly [Projection<unknown>, ...Projection<unknown>[]]>(
  events: readonly DomainEvent[],
  projections: Ps
): { [K in keyof Ps]: Ps[K] extends Projection<infer R> ? R : never } {
  // TODO 8
  throw new Error("Not implemented");
}

// ─── 11. INGESTION PIPELINE ───────────────────────────────────

export type IngestionReport = {
  readonly accepted: readonly DomainEvent[];
  readonly rejected: ReadonlyArray<{ readonly raw: unknown; readonly error: ValidationError }>;
};

/**
 * TODO 9: Implement `ingestEvents`.
 *
 * Requirements:
 * - Validate each raw item using `validateEvent`
 * - Partition into `accepted` (valid DomainEvent[]) and `rejected` (with error)
 * - After partitioning, call `rebuildFromEvents` on the accepted events
 * - Call `runProjections` with BOTH `ledgerProjection` and `summaryProjection`
 * - Return the full `IngestionReport` AND the two read models as a single object
 */
export type PipelineResult = {
  readonly report: IngestionReport;
  readonly aggregateState: Result<AccountState, ReducerError>;
  readonly ledger: LedgerReadModel;
  readonly summary: AccountSummary;
};

export function ingestEvents(rawEvents: readonly unknown[]): PipelineResult {
  // TODO 9
  throw new Error("Not implemented");
}
