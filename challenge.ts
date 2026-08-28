// ============================================================
// Typed Notification Dispatcher
// ============================================================
// REQUIREMENTS
// 1. Define a discriminated union `Notification` covering the three
//    kinds below. Each variant MUST have a `kind` literal field.
//    - "task_assigned"  → payload: { taskId: string; assigneeId: string }
//    - "comment_added"  → payload: { taskId: string; commentId: string; preview: string }
//    - "deadline_approaching" → payload: { taskId: string; hoursLeft: number }
//
// 2. Define a template-literal type `Channel` that only permits the
//    exact strings: "email", "sms", or "push".
//    Then define `ChannelTag` as a template literal:
//    `channel:${"email" | "sms" | "push"}` (e.g. "channel:email").
//
// 3. Define a `DeliveryReceipt<N extends Notification>` generic interface
//    containing:
//    - `notificationKind`: the `kind` of N (use a conditional/mapped type
//      or simply the field access — keep it typed, not hardcoded to string)
//    - `channel`: Channel
//    - `channelTag`: ChannelTag
//    - `sentAt`: number   (Unix timestamp ms)
//    - `success`: boolean
//
// 4. Implement `dispatch<N extends Notification>(
//      notification: N,
//      channel: Channel
//    ): DeliveryReceipt<N>`
//    The function must:
//    a. Build a `channelTag` of the form `"channel:<channel>"`.
//    b. Use a switch/if on `notification.kind` to log a channel-specific
//       message string (see TODO comments inside the switch).
//       The switch must be EXHAUSTIVE — include a `default` branch that
//       calls `assertNever` so the compiler catches unhandled variants.
//    c. Return a DeliveryReceipt where `success` is always `true` and
//       `sentAt` is `Date.now()`.
//
// 5. Implement `assertNever(value: never): never` — a standard
//    exhaustiveness-check helper that throws a runtime Error.
//
// 6. Implement `groupReceiptsByChannel(
//      receipts: DeliveryReceipt<Notification>[]
//    ): Record<Channel, DeliveryReceipt<Notification>[]>`
//    Returns an object keyed by every Channel value; channels with no
//    receipts map to an empty array.  The return type must use
//    `Record<Channel, ...>` — not a plain object type.
// ============================================================

// ----- 1. Notification discriminated union -----
// TODO: define TaskAssignedNotification
// TODO: define CommentAddedNotification
// TODO: define DeadlineApproachingNotification
// TODO: export the `Notification` union of all three

// ----- 2. Channel & ChannelTag template literal types -----
// TODO: export type Channel = ...
// TODO: export type ChannelTag = ...

// ----- 3. DeliveryReceipt generic interface -----
// TODO: export interface DeliveryReceipt<N extends Notification> { ... }

// ----- 5. assertNever helper (define before dispatch) -----
// TODO: export function assertNever(value: never): never { ... }

// ----- 4. dispatch -----
// TODO: export function dispatch<N extends Notification>(
//   notification: N,
//   channel: Channel
// ): DeliveryReceipt<N> { ... }
//
// Inside the switch, log one of these strings (console.log is fine):
//   "task_assigned"        → `[email|sms|push] Assigning task ${taskId} to ${assigneeId}`
//   "comment_added"        → `[email|sms|push] New comment on ${taskId}: "${preview}"`
//   "deadline_approaching" → `[email|sms|push] Task ${taskId} due in ${hoursLeft}h`

// ----- 6. groupReceiptsByChannel -----
// TODO: export function groupReceiptsByChannel(
//   receipts: DeliveryReceipt<Notification>[]
// ): Record<Channel, DeliveryReceipt<Notification>[]> { ... }
