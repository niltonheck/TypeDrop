// ============================================================
// challenge.ts — Typed Event Sourcing Ledger Reconstructor
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill in every section marked TODO.
// ============================================================

// ── 1. Domain Event Types ───────────────────────────────────

// TODO: Define a branded type `AccountId` (string brand).
//       Branded types prevent mixing up plain strings with IDs.
export type AccountId = string & { readonly __brand: "AccountId" };

// TODO: Define a branded type `TransactionId` (string brand).
export type TransactionId = string & { readonly __brand: "TransactionId" };

// TODO: Define a discriminated union `LedgerEvent` with these four variants.
//       Each variant MUST have:
//         - `type`: a unique string literal
//         - `accountId`: AccountId
//         - `occurredAt`: number  (Unix ms timestamp)
//       Variant-specific fields:
//
//   "account_opened"   → owner: string; initialBalance: number
//   "funds_deposited"  → transactionId: TransactionId; amount: number
//   "funds_withdrawn"  → transactionId: TransactionId; amount: number
//   "account_closed"   → reason: string
export type LedgerEvent = TODO;

// ── 2. Account Snapshot ────────────────────────────────────

// TODO: Define the `AccountStatus` union type:
//       "active" | "closed"
export type AccountStatus = TODO;

// TODO: Define the `AccountSnapshot` interface:
//   - accountId:     AccountId
//   - owner:         string
//   - balance:       number
//   - status:        AccountStatus
//   - transactions:  ReadonlyArray<TransactionId>
//   - openedAt:      number
//   - closedAt:      number | null
export interface AccountSnapshot {
  // TODO
}

// ── 3. Result Type ─────────────────────────────────────────

// TODO: Define a generic `Result<T, E>` discriminated union:
//       { ok: true; value: T } | { ok: false; error: E }
export type Result<T, E> = TODO;

// ── 4. Validation Errors ───────────────────────────────────

// TODO: Define a discriminated union `ValidationError` with these variants:
//   "missing_field"    → field: string
//   "wrong_type"       → field: string; expected: string
//   "unknown_event"    → received: string
export type ValidationError =
  | { kind: "missing_field"; field: string }
  | { kind: "wrong_type"; field: string; expected: string }
  | { kind: "unknown_event"; received: string };

// ── 5. Replay Errors ──────────────────────────────────────

// TODO: Define a discriminated union `ReplayError` with these variants:
//   "account_not_opened"   → (no extra fields)
//   "account_already_open" → existingOwner: string
//   "account_closed"       → closedAt: number
//   "insufficient_funds"   → balance: number; attempted: number
export type ReplayError =
  | { kind: "account_not_opened" }
  | { kind: "account_already_open"; existingOwner: string }
  | { kind: "account_closed"; closedAt: number }
  | { kind: "insufficient_funds"; balance: number; attempted: number };

// ── 6. Runtime Validator ───────────────────────────────────

/**
 * TODO: Implement `parseLedgerEvent`.
 *
 * Requirements:
 *  R1. Accept a single `unknown` value.
 *  R2. Return `Result<LedgerEvent, ValidationError>`.
 *  R3. Validate that the input is a non-null object.
 *  R4. Validate that `type`, `accountId`, and `occurredAt` are present
 *      and correctly typed (string, string, number).
 *  R5. Branch on `type` and validate variant-specific fields:
 *        - "account_opened"  → owner (string), initialBalance (number)
 *        - "funds_deposited" → transactionId (string), amount (number)
 *        - "funds_withdrawn" → transactionId (string), amount (number)
 *        - "account_closed"  → reason (string)
 *        - anything else     → return a `unknown_event` ValidationError
 *  R6. Cast string IDs to their branded types using helper `brand<T>()` below
 *      (the only approved narrow cast in the file).
 */
export function parseLedgerEvent(raw: unknown): Result<LedgerEvent, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// Approved narrow-cast helper — do NOT use elsewhere.
function brand<T extends string>(value: string): T {
  return value as T;
}

// ── 7. Event Replayer ─────────────────────────────────────

/**
 * TODO: Implement `replayEvents`.
 *
 * Requirements:
 *  R7.  Accept `events: ReadonlyArray<LedgerEvent>`.
 *  R8.  Return `Result<AccountSnapshot, ReplayError>`.
 *  R9.  Events MUST be processed in ascending `occurredAt` order
 *       (sort a copy — do not mutate the input array).
 *  R10. The first event MUST be "account_opened"; otherwise return
 *       `{ kind: "account_not_opened" }`.
 *  R11. If a second "account_opened" event appears, return
 *       `{ kind: "account_already_open", existingOwner }`.
 *  R12. "funds_deposited" and "funds_withdrawn" events on a closed
 *       account return `{ kind: "account_closed", closedAt }`.
 *  R13. "funds_withdrawn" when balance would go negative returns
 *       `{ kind: "insufficient_funds", balance, attempted }`.
 *  R14. Accumulate all `transactionId`s (deposits + withdrawals) in
 *       `transactions` in replay order.
 *  R15. Set `closedAt` when an "account_closed" event is processed.
 */
export function replayEvents(
  events: ReadonlyArray<LedgerEvent>
): Result<AccountSnapshot, ReplayError> {
  // TODO
  throw new Error("Not implemented");
}

// ── 8. Top-Level Pipeline ─────────────────────────────────

/**
 * TODO: Implement `reconstructLedger`.
 *
 * Requirements:
 *  R16. Accept `rawEvents: ReadonlyArray<unknown>`.
 *  R17. Return `{ snapshot: AccountSnapshot | null; parseErrors: ValidationError[]; replayError: ReplayError | null }`.
 *  R18. Run `parseLedgerEvent` on each raw event; collect failures in
 *       `parseErrors` and pass successes to `replayEvents`.
 *  R19. If `replayEvents` returns an error, set `replayError` and
 *       `snapshot` to `null`.
 *  R20. If `replayEvents` succeeds, set `snapshot` and `replayError`
 *       to `null`.
 */
export type LedgerReport = {
  snapshot: AccountSnapshot | null;
  parseErrors: ValidationError[];
  replayError: ReplayError | null;
};

export function reconstructLedger(rawEvents: ReadonlyArray<unknown>): LedgerReport {
  // TODO
  throw new Error("Not implemented");
}
