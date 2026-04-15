import { createHash } from 'node:crypto';

export interface TaskEntry {
  task_id: string;
  title: string;
  phase: string;
  parallel: boolean;
  user_story: string | null;
}

/**
 * Compute a deterministic SHA-256 hash of a task manifest.
 * The hash covers task IDs and titles in order, providing a
 * stable fingerprint for drift detection.
 */
export function computeTaskManifestHash(tasks: TaskEntry[]): string {
  const canonical = tasks
    .map((t) => `${t.task_id}:${t.title}`)
    .join('\n');
  return createHash('sha256').update(canonical, 'utf-8').digest('hex');
}
