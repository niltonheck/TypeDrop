// ============================================================
// Typed Workflow State Machine
// challenge.ts
// ============================================================
// REQUIREMENTS
// 1. Define a discriminated-union `OrderState` covering every state
//    listed in STATE_NAMES. Each variant must carry only the payload
//    fields shown in the STATE_PAYLOAD map below.
// 2. Define a `Transition<From, To>` branded type that encodes the
//    source and destination states as type parameters so illegal
//    transitions are rejected at compile time.
// 3. Build the TRANSITIONS registry using `satisfies` so TypeScript
//    validates each entry against the Transition type without widening.
// 4. Implement `applyTransition`: given the current `OrderState` and a
//    raw `TransitionInput`, validate the transition is legal, apply the
//    new payload, append an `AuditEntry` to the log, and return
//    `Result<MachineContext, TransitionError>`.
// 5. Implement `runWorkflow`: accept an initial raw order and an array
//    of `TransitionInput` objects, run them sequentially through
//    `applyTransition`, and return the final `Result<MachineContext,
//    TransitionError>` — stopping at the first failure.
// 6. Implement `summariseMachine`: accept a `MachineContext` and return
//    a `WorkflowSummary` using a single-pass reduce over the audit log.
//    The summary must count transitions per state name and capture the
//    latest timestamp without any intermediate arrays.
// 7. No `any`, no type assertions (`as`), no non-null assertions (`!`).
// ============================================================

// ── State names ──────────────────────────────────────────────
export const STATE_NAMES = [
  "pending",
  "confirmed",
  "picking",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type StateName = (typeof STATE_NAMES)[number];

// ── Per-state payload shapes ──────────────────────────────────
// Each state carries ONLY its own fields (no optional pollution).
export type StatePayloadMap = {
  pending:   { orderId: string; placedAt: string };
  confirmed: { orderId: string; confirmedAt: string; warehouseId: string };
  picking:   { orderId: string; assignedTo: string; startedAt: string };
  packed:    { orderId: string; packedAt: string; boxCount: number };
  shipped:   { orderId: string; trackingCode: string; shippedAt: string };
  delivered: { orderId: string; deliveredAt: string; signature: string };
  cancelled: { orderId: string; cancelledAt: string; reason: string };
};

// ── TODO 1 ───────────────────────────────────────────────────
// Define `OrderState` as a discriminated union.
// Each variant must have a `kind` field equal to the StateName key
// and spread the matching StatePayloadMap entry.
// Example shape (do NOT copy verbatim — generate it for ALL states):
//   | { kind: "pending"; orderId: string; placedAt: string }
//   | ...
export type OrderState = never; // ← replace with your union

// ── TODO 2 ───────────────────────────────────────────────────
// Define a branded `Transition` type.
// It must encode `From extends StateName` and `To extends StateName`
// as phantom type parameters so that `Transition<"pending","confirmed">`
// is NOT assignable to `Transition<"pending","cancelled">`.
export type Transition<
  From extends StateName,
  To extends StateName
> = never; // ← replace with your branded type

// ── TODO 3 ───────────────────────────────────────────────────
// Build the TRANSITIONS registry.
// Keys are `${StateName}->${StateName}` template-literal strings.
// Values are `Transition<From, To>` objects.
// Use `satisfies` to validate each entry.
// Legal transitions:
//   pending    → confirmed
//   pending    → cancelled
//   confirmed  → picking
//   confirmed  → cancelled
//   picking    → packed
//   picking    → cancelled
//   packed     → shipped
//   shipped    → delivered
export const TRANSITIONS = {} as const; // ← replace with your registry

// ── Audit log ────────────────────────────────────────────────
export type AuditEntry = {
  readonly from: StateName;
  readonly to: StateName;
  readonly at: string; // ISO timestamp
};

// ── Machine context ───────────────────────────────────────────
export type MachineContext = {
  readonly current: OrderState;
  readonly log: readonly AuditEntry[];
};

// ── Result type ───────────────────────────────────────────────
export type Result<T, E> =
  | { readonly ok: true;  readonly value: T }
  | { readonly ok: false; readonly error: E };

// ── Error types ───────────────────────────────────────────────
export type TransitionError =
  | { readonly kind: "illegal_transition"; from: StateName; to: StateName }
  | { readonly kind: "invalid_payload";    state: StateName; missing: string[] }
  | { readonly kind: "unknown_state";      raw: string };

// ── Transition input (raw, unvalidated) ───────────────────────
export type TransitionInput = {
  readonly targetState: string;          // may be invalid
  readonly payload: Record<string, unknown>; // unvalidated fields
  readonly at: string;                   // ISO timestamp
};

// ── Workflow Summary ──────────────────────────────────────────
export type WorkflowSummary = {
  readonly totalTransitions: number;
  readonly transitionCounts: Record<StateName, number>;
  readonly latestTimestamp: string;
  readonly finalState: StateName;
};

// ── TODO 4 ───────────────────────────────────────────────────
// Implement `applyTransition`.
// Steps:
//   a. Validate `input.targetState` is a known StateName
//      → return TransitionError { kind: "unknown_state" } if not.
//   b. Validate the transition from `ctx.current.kind` → targetState
//      exists in TRANSITIONS
//      → return TransitionError { kind: "illegal_transition" } if not.
//   c. Validate that `input.payload` contains all required fields for
//      the target state (use StatePayloadMap as the source of truth).
//      → return TransitionError { kind: "invalid_payload" } listing
//        every missing field.
//   d. Construct the new `OrderState` variant with `kind` + payload.
//   e. Append an `AuditEntry` to the log.
//   f. Return Result<MachineContext, TransitionError> { ok: true }.
export function applyTransition(
  ctx: MachineContext,
  input: TransitionInput
): Result<MachineContext, TransitionError> {
  // TODO
  throw new Error("Not implemented");
}

// ── TODO 5 ───────────────────────────────────────────────────
// Implement `runWorkflow`.
// Accept a raw initial payload for a "pending" order and an array of
// TransitionInputs. Build the initial MachineContext (log is empty),
// then fold over inputs with `applyTransition`, short-circuiting on
// the first error.
export function runWorkflow(
  initialPayload: { orderId: string; placedAt: string },
  transitions: readonly TransitionInput[]
): Result<MachineContext, TransitionError> {
  // TODO
  throw new Error("Not implemented");
}

// ── TODO 6 ───────────────────────────────────────────────────
// Implement `summariseMachine`.
// Use a SINGLE reduce call over `ctx.log` — no intermediate arrays,
// no extra loops. The `transitionCounts` key for each StateName not yet
// seen should start at 0 (use a fully-initialised seed).
export function summariseMachine(ctx: MachineContext): WorkflowSummary {
  // TODO
  throw new Error("Not implemented");
}
