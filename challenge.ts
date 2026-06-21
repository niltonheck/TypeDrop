// challenge.ts
// =============================================================
// Typed Notification Dispatcher with Retry & Channel Routing
// =============================================================
// SCENARIO:
//   Raw notification payloads arrive as `unknown` from an internal
//   message queue. Your dispatcher must:
//     1. Validate & narrow unknown → a typed NotificationPayload
//     2. Route each payload to the correct channel handler
//     3. Fan out all deliveries concurrently (Promise.allSettled)
//     4. Retry failed deliveries up to a configurable max attempt count
//     5. Return a strongly-typed DeliveryReport
//
// REQUIREMENTS (implement every numbered item):
//   [R1]  Define a discriminated union `NotificationPayload` with three
//         members distinguished by a `channel` literal field:
//           - "email"  → must have `to: string`, `subject: string`, `body: string`
//           - "sms"    → must have `to: string`, `text: string`
//           - "push"   → must have `deviceToken: string`, `title: string`, `body: string`
//         Every member must also carry `id: string` and `userId: string`.
//
//   [R2]  Define a `DeliveryStatus` discriminated union:
//           - { status: "sent";    channel: NotificationPayload["channel"]; id: string }
//           - { status: "failed";  channel: NotificationPayload["channel"]; id: string; reason: string }
//
//   [R3]  Define `DeliveryReport` as a type that contains:
//           - `results`: DeliveryStatus[]
//           - `summary`: a mapped type over each channel name whose value is
//                        `{ sent: number; failed: number }` — use `Record` or a
//                        mapped type, NOT a hand-written interface with three fields.
//
//   [R4]  Implement `parsePayload(raw: unknown): NotificationPayload`
//         Throw a `TypeError` with a descriptive message if validation fails.
//         Use type narrowing (no `as` casts) to satisfy the compiler.
//
//   [R5]  Define the `ChannelHandler<T extends NotificationPayload>` generic type:
//         a function `(payload: T) => Promise<void>` that may reject on failure.
//
//   [R6]  Define `ChannelRegistry` as a mapped type over each channel literal
//         that maps to the correct `ChannelHandler` for that channel variant.
//         (Hint: use a mapped type + `Extract` to pair each key with its payload.)
//
//   [R7]  Implement `dispatchOne`:
//           dispatchOne(
//             payload:   NotificationPayload,
//             registry:  ChannelRegistry,
//             maxRetries: number,
//           ): Promise<DeliveryStatus>
//         - Calls the correct handler from the registry using the `channel` field.
//         - Retries up to `maxRetries` additional times on failure (total attempts =
//           maxRetries + 1).
//         - Returns a `DeliveryStatus` — never rejects.
//
//   [R8]  Implement `dispatchAll`:
//           dispatchAll(
//             rawPayloads: unknown[],
//             registry:    ChannelRegistry,
//             maxRetries:  number,
//           ): Promise<DeliveryReport>
//         - Parses each raw payload via `parsePayload`; if parsing fails, treat it
//           as a failed DeliveryStatus with id "unknown" and channel "email".
//         - Fans out all dispatches concurrently via Promise.allSettled.
//         - Builds and returns a `DeliveryReport`.
//
// CONSTRAINTS:
//   - No `any`, no `as` type assertions, no `@ts-ignore`.
//   - strict: true must pass.
//   - Do NOT implement the actual send logic inside handlers — that's the
//     caller's responsibility (see test harness for mock handlers).
// =============================================================

// [R1] Discriminated union — TODO
export type EmailPayload = TODO;
export type SmsPayload   = TODO;
export type PushPayload  = TODO;
export type NotificationPayload = TODO;

// [R2] DeliveryStatus discriminated union — TODO
export type DeliveryStatus = TODO;

// [R3] DeliveryReport — TODO
export type DeliveryReport = TODO;

// [R5] ChannelHandler generic type — TODO
export type ChannelHandler<T extends NotificationPayload> = TODO;

// [R6] ChannelRegistry mapped type — TODO
export type ChannelRegistry = TODO;

// [R4] Runtime validator
export function parsePayload(raw: unknown): NotificationPayload {
  // TODO
  throw new Error("Not implemented");
}

// [R7] Single-payload dispatcher with retry
export async function dispatchOne(
  payload: NotificationPayload,
  registry: ChannelRegistry,
  maxRetries: number,
): Promise<DeliveryStatus> {
  // TODO
  throw new Error("Not implemented");
}

// [R8] Bulk dispatcher
export async function dispatchAll(
  rawPayloads: unknown[],
  registry: ChannelRegistry,
  maxRetries: number,
): Promise<DeliveryReport> {
  // TODO
  throw new Error("Not implemented");
}
