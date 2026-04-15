export interface TaskOutcome {
  task_id: string;
  title: string;
  assignee: string | null;
  status: 'completed' | 'failed' | 'unassigned' | 'skipped';
  details: string;
}

export interface ImplementSessionOutcome {
  session_id: string;
  project_id: string;
  tasks_source_path: string;
  task_manifest_hash: string;
  squad_mode: 'markdown-first' | 'sdk-first';
  status: 'completed' | 'failed' | 'interrupted';
  completed_tasks: TaskOutcome[];
  failed_tasks: TaskOutcome[];
  unassigned_tasks: TaskOutcome[];
  summary: string;
  raw_log_refs: string[];
}

export interface RawSquadOutcome {
  session_id: string;
  project_id: string;
  tasks_source_path: string;
  task_manifest_hash: string;
  squad_mode: string;
  tasks?: Array<{
    task_id: string;
    title?: string;
    assignee?: string | null;
    status?: string;
    details?: string;
  }>;
  raw_log_refs?: string[];
  [key: string]: unknown;
}

/**
 * Normalize raw Squad output into a contract-compliant session outcome.
 */
export function normalizeSessionOutcome(raw: RawSquadOutcome): ImplementSessionOutcome {
  const tasks = raw.tasks ?? [];

  const completed: TaskOutcome[] = [];
  const failed: TaskOutcome[] = [];
  const unassigned: TaskOutcome[] = [];

  for (const task of tasks) {
    const outcome: TaskOutcome = {
      task_id: task.task_id,
      title: task.title ?? task.task_id,
      assignee: task.assignee ?? null,
      status: normalizeTaskStatus(task.status),
      details: task.details ?? '',
    };

    switch (outcome.status) {
      case 'completed':
        completed.push(outcome);
        break;
      case 'failed':
        failed.push(outcome);
        break;
      case 'unassigned':
      case 'skipped':
        unassigned.push(outcome);
        break;
    }
  }

  const overallStatus = deriveOverallStatus(completed, failed, tasks.length);

  const summary = buildSummary(completed.length, failed.length, unassigned.length, overallStatus);

  return {
    session_id: raw.session_id,
    project_id: raw.project_id,
    tasks_source_path: raw.tasks_source_path,
    task_manifest_hash: raw.task_manifest_hash,
    squad_mode: normalizeSquadMode(raw.squad_mode),
    status: overallStatus,
    completed_tasks: completed,
    failed_tasks: failed,
    unassigned_tasks: unassigned,
    summary,
    raw_log_refs: raw.raw_log_refs ?? [],
  };
}

function normalizeTaskStatus(status: string | undefined): TaskOutcome['status'] {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'done':
    case 'success':
      return 'completed';
    case 'failed':
    case 'error':
      return 'failed';
    case 'skipped':
      return 'skipped';
    default:
      return 'unassigned';
  }
}

function normalizeSquadMode(mode: string): 'markdown-first' | 'sdk-first' {
  if (mode === 'sdk-first') return 'sdk-first';
  return 'markdown-first';
}

function deriveOverallStatus(
  completed: TaskOutcome[],
  failed: TaskOutcome[],
  totalCount: number
): 'completed' | 'failed' | 'interrupted' {
  if (failed.length > 0) return 'failed';
  if (completed.length === totalCount && totalCount > 0) return 'completed';
  return 'interrupted';
}

function buildSummary(
  completedCount: number,
  failedCount: number,
  unassignedCount: number,
  status: string
): string {
  const parts: string[] = [];
  parts.push(`Session ${status}`);
  parts.push(`${completedCount} completed`);
  if (failedCount > 0) parts.push(`${failedCount} failed`);
  if (unassignedCount > 0) parts.push(`${unassignedCount} unassigned`);
  return parts.join(', ');
}
