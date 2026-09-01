// ============================================================
// challenge.ts — Typed Job Queue with Priority Scheduling & Retry Budgets
// ============================================================
// REQUIREMENTS
// 1. Define a discriminated union `Job` covering at least three job kinds:
//      "email"   → { to: string; subject: string; body: string }
//      "resize"  → { assetId: string; width: number; height: number }
//      "report"  → { reportId: string; format: "pdf" | "csv" }
//    Each variant must include: kind, priority (1=highest → 3=lowest), and its payload fields.
//
// 2. Define `RetryBudget` — a Record that maps every Job["kind"] to a max-retry count (number).
//    The type must be exhaustive: omitting any kind is a compile error.
//
// 3. Define a generic `Worker<K extends Job["kind"]>` interface with:
//      handles: K[]                                   — the job kinds this worker accepts
//      execute(job: Extract<Job, { kind: K }>): Promise<void>   — runs one job
//
// 4. Implement `createQueue(budget: RetryBudget)`:
//      Returns an object with three methods:
//
//      enqueue(job: Job): void
//        — Adds the job to an internal list.
//
//      registerWorker<K extends Job["kind"]>(worker: Worker<K>): void
//        — Associates the worker with the kinds it declares.
//
//      runAll(): Promise<QueueSummary>
//        — Processes every enqueued job, highest priority first (priority 1 before 2 before 3).
//        — Dispatches each job to a registered worker that handles its kind.
//        — If no worker is registered for a kind, the job is skipped and counted as "skipped".
//        — On worker.execute() rejection, retries up to budget[job.kind] additional times.
//        — After exhausting retries, counts the job as "failed".
//        — Successfully completed jobs are counted as "succeeded".
//        — Returns a QueueSummary when all jobs have been processed.
//
// 5. Define `QueueSummary`:
//      { succeeded: number; failed: number; skipped: number }
//
// 6. No `any`, no type assertions (`as`), no non-null assertions (`!`).
// ============================================================

// --- 1. Job discriminated union ---
export type EmailJob = {
  kind: "email";
  priority: 1 | 2 | 3;
  to: string;
  subject: string;
  body: string;
};

export type ResizeJob = {
  kind: "resize";
  priority: 1 | 2 | 3;
  assetId: string;
  width: number;
  height: number;
};

export type ReportJob = {
  kind: "report";
  priority: 1 | 2 | 3;
  reportId: string;
  format: "pdf" | "csv";
};

export type Job = EmailJob | ResizeJob | ReportJob;

// --- 2. RetryBudget — must cover every Job["kind"] ---
export type RetryBudget = Record<Job["kind"], number>;

// --- 3. Worker interface ---
export interface Worker<K extends Job["kind"]> {
  handles: K[];
  execute(job: Extract<Job, { kind: K }>): Promise<void>;
}

// --- 4. QueueSummary ---
export type QueueSummary = {
  succeeded: number;
  failed: number;
  skipped: number;
};

// --- 5. Queue factory ---
// TODO: implement this function
export function createQueue(budget: RetryBudget): {
  enqueue(job: Job): void;
  registerWorker<K extends Job["kind"]>(worker: Worker<K>): void;
  runAll(): Promise<QueueSummary>;
} {
  // TODO: track enqueued jobs
  // TODO: track registered workers per kind
  // TODO: implement enqueue — push to internal list
  // TODO: implement registerWorker — store worker against each kind it handles
  // TODO: implement runAll:
  //   a) sort jobs by priority ascending (1 first)
  //   b) for each job, find a worker for job.kind
  //   c) if none, increment skipped and continue
  //   d) attempt worker.execute(); on failure retry up to budget[job.kind] times
  //   e) track succeeded / failed counts
  //   f) return QueueSummary
  throw new Error("Not implemented");
}
