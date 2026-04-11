// ============================================================
// Typed Event Sourcing Ledger
// challenge.ts
// ============================================================
// RULES: strict: true, no `any`, no `as`, no type assertions.
// Fill every TODO. Do NOT change existing type signatures.
// ============================================================

// ---------------------------------------------------------------------------
// 1. DOMAIN EVENT TYPES
// ---------------------------------------------------------------------------

// TODO 1: Define a branded type `EventId` (string brand "EventId")
//         and a branded type `AccountId` (string brand "AccountId").
//         Use an intersection with `{ readonly _brand: "..." }`.
export type EventId = string & { readonly _brand: "EventId" };
export type AccountId = string & { readonly _brand: "AccountId" };

// TODO 2: Define the following discriminated-union members.
//         Each event MUST carry:
//           - `id: EventId`
//           - `accountId: AccountId`
//           - `occurredAt: string`  (ISO-8601)
//
//         Event shapes:
//           AccountOpened  → type: "AccountOpened",  ownerName: string, initialDeposit: number
//           MoneyDeposited → type: "MoneyDeposited",  amount: number
//           MoneyWithdrawn → type: "MoneyWithdrawn",  amount: number
//           AccountClosed  → type: "AccountClosed",   reason: string
export type AccountOpened = {
  // TODO
};

export type MoneyDeposited = {
  // TODO
};

export type MoneyWithdrawn = {
  // TODO
};

export type AccountClosed = {
  // TODO
};

// TODO 3: Build the `DomainEvent` discriminated union from the four types above.
export type DomainEvent = /* TODO */;

// ---------------------------------------------------------------------------
// 2. ACCOUNT PROJECTION (fold target)
// ---------------------------------------------------------------------------

// TODO 4: Define `AccountStatus` as a union of string literals:
//         "open" | "closed"
export type AccountStatus = /* TODO */;

// TODO 5: Define `AccountProjection` — the in-memory view of one account.
//         Fields required:
//           accountId:   AccountId
//           ownerName:   string
//           balance:     number
//           status:      AccountStatus
//           eventCount:  number
//           openedAt:    string
//           closedAt:    string | null
export type AccountProjection = {
  // TODO
};

// ---------------------------------------------------------------------------
// 3. RESULT TYPE
// ---------------------------------------------------------------------------

// TODO 6: Define a generic `Result<T, E>` discriminated union:
//         | { ok: true;  value: T }
//         | { ok: false; error: E }
export type Result<T, E> = /* TODO */;

// ---------------------------------------------------------------------------
// 4. VALIDATION ERRORS
// ---------------------------------------------------------------------------

// TODO 7: Define `ValidationError` as a discriminated union of:
//         MissingField   → { kind: "MissingField";   field: string }
//         WrongType      → { kind: "WrongType";      field: string; expected: string }
//         UnknownEvent   → { kind: "UnknownEvent";   got: string }
//         OutOfOrder     → { kind: "OutOfOrder";      eventId: EventId }
export type ValidationError =
  // TODO
  ;

// ---------------------------------------------------------------------------
// 5. RUNTIME VALIDATORS
// ---------------------------------------------------------------------------

// TODO 8: Implement `parseEventId(raw: unknown): Result<EventId, ValidationError>`.
//         Returns ok if raw is a non-empty string, otherwise WrongType on field "id".
export function parseEventId(raw: unknown): Result<EventId, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// TODO 9: Implement `parseAccountId(raw: unknown): Result<AccountId, ValidationError>`.
//         Returns ok if raw is a non-empty string, otherwise WrongType on field "accountId".
export function parseAccountId(raw: unknown): Result<AccountId, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// TODO 10: Implement `parseDomainEvent(raw: unknown): Result<DomainEvent, ValidationError>`.
//          Must validate:
//            - raw is a non-null object
//            - `type` field exists and is a string (UnknownEvent if not a known type)
//            - `id`, `accountId`, `occurredAt` are non-empty strings
//            - event-specific numeric/string fields (amount, ownerName, etc.) are correct types
//          Returns the first error encountered (fail-fast).
export function parseDomainEvent(raw: unknown): Result<DomainEvent, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 6. LEDGER FOLD
// ---------------------------------------------------------------------------

// TODO 11: Implement `applyEvent`:
//          Signature:  applyEvent(projection: AccountProjection | null, event: DomainEvent): Result<AccountProjection, ValidationError>
//          Rules:
//            - AccountOpened  : projection must be null (else OutOfOrder); creates new projection
//            - MoneyDeposited : projection must be non-null & open; adds amount to balance
//            - MoneyWithdrawn : projection must be non-null & open; subtracts amount (balance may not go negative → OutOfOrder)
//            - AccountClosed  : projection must be non-null & open; sets status "closed", closedAt = event.occurredAt
//          Always increment eventCount.
export function applyEvent(
  projection: AccountProjection | null,
  event: DomainEvent
): Result<AccountProjection, ValidationError> {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 7. STREAM PROCESSOR
// ---------------------------------------------------------------------------

// TODO 12: Define `LedgerReport`:
//          {
//            accounts:    Map<AccountId, AccountProjection>
//            totalEvents: number
//            errors:      Array<{ raw: unknown; error: ValidationError }>
//          }
export type LedgerReport = {
  // TODO
};

// TODO 13: Implement `buildLedger(rawEvents: unknown[]): LedgerReport`.
//          For each element in rawEvents:
//            1. Call parseDomainEvent; on failure push to errors and continue.
//            2. Retrieve current projection for accountId (or null).
//            3. Call applyEvent; on failure push to errors (use a synthetic ValidationError) and continue.
//            4. Upsert the updated projection into the accounts map.
//          Return the completed LedgerReport.
export function buildLedger(rawEvents: unknown[]): LedgerReport {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 8. TYPED QUERY PROJECTIONS  (mapped + conditional types)
// ---------------------------------------------------------------------------

// TODO 14: Define `ProjectionQuery<K extends keyof AccountProjection>`:
//          A type that, given a key K of AccountProjection, produces:
//          { field: K; value: AccountProjection[K] }
export type ProjectionQuery<K extends keyof AccountProjection> = /* TODO */;

// TODO 15: Implement `queryAccounts<K extends keyof AccountProjection>`:
//          Signature: queryAccounts(report: LedgerReport, field: K, value: AccountProjection[K]): AccountProjection[]
//          Returns all projections where projection[field] === value.
export function queryAccounts<K extends keyof AccountProjection>(
  report: LedgerReport,
  field: K,
  value: AccountProjection[K]
): AccountProjection[] {
  // TODO
  throw new Error("Not implemented");
}

// ---------------------------------------------------------------------------
// 9. AGGREGATE SUMMARY  (single-pass reduce)
// ---------------------------------------------------------------------------

// TODO 16: Define `LedgerSummary`:
//          {
//            totalAccounts:       number
//            openAccounts:        number
//            closedAccounts:      number
//            totalBalance:        number
//            averageBalance:      number
//            largestBalance:      number
//            mostActiveAccountId: AccountId | null   ← highest eventCount
//          }
export type LedgerSummary = {
  // TODO
};

// TODO 17: Implement `summariseLedger(report: LedgerReport): LedgerSummary`.
//          Must be a SINGLE-PASS reduce over report.accounts.values().
//          Compute all fields in one iteration — no second loops.
export function summariseLedger(report: LedgerReport): LedgerSummary {
  // TODO
  throw new Error("Not implemented");
}
