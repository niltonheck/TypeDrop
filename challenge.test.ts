// ============================================================
// challenge.test.ts — run with: npx ts-node challenge.test.ts
// ============================================================
import {
  ok, err,
  ALLOWED_TRANSITIONS,
  validatePayload,
  StateMachine,
  aggregateRuns,
  type WorkflowState,
  type TransitionError,
  type RunReport,
  type AnyWorkflowState,
} from './challenge';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string): void {
  if (condition) {
    console.log(`  ✅ PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${label}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Helper: build a fresh idle state
// ---------------------------------------------------------------------------
const makeIdle = (): WorkflowState<'idle'> => ({
  kind: 'idle',
  createdAt: Date.now(),
});

// ---------------------------------------------------------------------------
// Test 1: ALLOWED_TRANSITIONS encodes the correct graph
// ---------------------------------------------------------------------------
console.log('\n── Test 1: AllowedTransitions graph ──');
assert(
  ALLOWED_TRANSITIONS.idle.includes('queued'),
  'idle → queued is allowed'
);
assert(
  !ALLOWED_TRANSITIONS.idle.includes('running'),
  'idle → running is NOT allowed'
);
assert(
  ALLOWED_TRANSITIONS.running.includes('succeeded') &&
  ALLOWED_TRANSITIONS.running.includes('failed') &&
  ALLOWED_TRANSITIONS.running.includes('cancelled'),
  'running → succeeded | failed | cancelled'
);
assert(
  ALLOWED_TRANSITIONS.succeeded.length === 0 &&
  ALLOWED_TRANSITIONS.cancelled.length === 0,
  'succeeded and cancelled are terminal states'
);
assert(
  ALLOWED_TRANSITIONS.failed.includes('queued') &&
  ALLOWED_TRANSITIONS.failed.length === 1,
  'failed → queued only (retry)'
);

// ---------------------------------------------------------------------------
// Test 2: validatePayload — valid and invalid payloads
// ---------------------------------------------------------------------------
console.log('\n── Test 2: validatePayload ──');

const validQueued = { queuedAt: 1000, priority: 5 };
const queuedResult = validatePayload('queued', validQueued);
assert(queuedResult.ok === true && queuedResult.value.priority === 5, 'valid queued payload accepted');

const badQueued = validatePayload('queued', { queuedAt: 'oops', priority: 5 });
assert(badQueued.ok === false && badQueued.error.kind === 'PayloadValidationError', 'invalid queued payload rejected');

const validSucceeded = { finishedAt: 2000, durationMs: 1234 };
const succResult = validatePayload('succeeded', validSucceeded);
assert(succResult.ok === true && succResult.value.durationMs === 1234, 'valid succeeded payload accepted');

const missingField = validatePayload('running', { startedAt: 500 }); // missing runnerId
assert(missingField.ok === false && missingField.error.kind === 'PayloadValidationError', 'missing field rejected');

// ---------------------------------------------------------------------------
// Test 3: StateMachine — happy path idle → queued → running → succeeded
// ---------------------------------------------------------------------------
console.log('\n── Test 3: StateMachine happy path ──');

const events: string[] = [];
const sm = new StateMachine('wf-001', makeIdle(), (e) => events.push(e.kind));

const r1 = sm.transition('queued', { queuedAt: 1000, priority: 3 });
assert(r1.ok === true && r1.value.kind === 'queued', 'transitioned idle → queued');

const r2 = sm.transition('running', { startedAt: 1500, runnerId: 'runner-42' });
assert(r2.ok === true && r2.value.kind === 'running', 'transitioned queued → running');

const r3 = sm.transition('succeeded', { finishedAt: 3000, durationMs: 1500 });
assert(r3.ok === true && r3.value.kind === 'succeeded', 'transitioned running → succeeded');

assert(
  events[0] === 'WorkflowQueued' &&
  events[1] === 'WorkflowStarted' &&
  events[2] === 'WorkflowSucceeded',
  'correct events emitted in order'
);

assert(sm.history().length === 4, 'history has 4 entries (idle + 3 transitions)');

// ---------------------------------------------------------------------------
// Test 4: StateMachine — invalid transition returns Err
// ---------------------------------------------------------------------------
console.log('\n── Test 4: StateMachine invalid transition ──');

const sm2 = new StateMachine('wf-002', makeIdle(), () => {});
const bad = sm2.transition('succeeded', { finishedAt: 1, durationMs: 0 });
assert(bad.ok === false && bad.error.kind === 'InvalidTransition', 'idle → succeeded rejected');

// ---------------------------------------------------------------------------
// Test 5: StateMachine — guard rejection
// ---------------------------------------------------------------------------
console.log('\n── Test 5: Guard rejection ──');

const sm3 = new StateMachine('wf-003', makeIdle(), () => {});
sm3.transition('queued', { queuedAt: 1000, priority: 1 });

const rejectingGuard = () =>
  err<TransitionError>({ kind: 'GuardRejected', guardName: 'priorityCheck', reason: 'priority too low' });

const guarded = sm3.transition('running', { startedAt: 500, runnerId: 'r-1' }, rejectingGuard);
assert(guarded.ok === false && guarded.error.kind === 'GuardRejected', 'guard rejection propagated');

// ---------------------------------------------------------------------------
// Test 6: StateMachine — failed → queued retry path
// ---------------------------------------------------------------------------
console.log('\n── Test 6: Retry via failed → queued ──');

const sm4 = new StateMachine('wf-004', makeIdle(), () => {});
sm4.transition('queued',  { queuedAt: 100, priority: 2 });
sm4.transition('running', { startedAt: 200, runnerId: 'r-9' });
const failResult = sm4.transition('failed', { finishedAt: 300, reason: 'OOM' });
assert(failResult.ok === true && failResult.value.kind === 'failed', 'transitioned to failed');

const retryResult = sm4.transition('queued', { queuedAt: 400, priority: 2 });
assert(retryResult.ok === true && retryResult.value.kind === 'queued', 'retried: failed → queued');

// ---------------------------------------------------------------------------
// Test 7: aggregateRuns — single-pass report
// ---------------------------------------------------------------------------
console.log('\n── Test 7: aggregateRuns ──');

const run1: ReadonlyArray<AnyWorkflowState> = [
  { kind: 'idle', createdAt: 0 },
  { kind: 'queued', queuedAt: 1, priority: 1 },
  { kind: 'running', startedAt: 2, runnerId: 'r1' },
  { kind: 'succeeded', finishedAt: 3, durationMs: 800 },
];

const run2: ReadonlyArray<AnyWorkflowState> = [
  { kind: 'idle', createdAt: 0 },
  { kind: 'queued', queuedAt: 1, priority: 2 },
  { kind: 'running', startedAt: 2, runnerId: 'r2' },
  { kind: 'failed', finishedAt: 3, reason: 'OOM' },
];

const run3: ReadonlyArray<AnyWorkflowState> = [
  { kind: 'idle', createdAt: 0 },
  { kind: 'queued', queuedAt: 1, priority: 3 },
  { kind: 'cancelled', cancelledAt: 2, requestedBy: 'alice' },
];

const run4: ReadonlyArray<AnyWorkflowState> = [
  { kind: 'idle', createdAt: 0 },
  { kind: 'queued', queuedAt: 1, priority: 1 },
  { kind: 'running', startedAt: 2, runnerId: 'r3' },
  { kind: 'succeeded', finishedAt: 5, durationMs: 1200 },
];

const report: RunReport = aggregateRuns([run1, run2, run3, run4]);

assert(report.total === 4, 'total = 4 runs');
assert(report.byFinalState['succeeded'] === 2, 'byFinalState.succeeded = 2');
assert(report.byFinalState['failed'] === 1,    'byFinalState.failed = 1');
assert(report.byFinalState['cancelled'] === 1, 'byFinalState.cancelled = 1');
assert(report.avgDurationMs === 1000, 'avgDurationMs = (800+1200)/2 = 1000');
assert(
  report.failureReasons.length === 1 && report.failureReasons[0] === 'OOM',
  'failureReasons = ["OOM"]'
);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log(`\n══════════════════════════════════`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('🎉 All tests passed!');
