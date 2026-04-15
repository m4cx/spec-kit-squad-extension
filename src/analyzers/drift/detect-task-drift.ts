import { readFile } from 'node:fs/promises';
import { parseTasksMd } from '../handoff/parse-tasks-md.js';
import { computeTaskManifestHash } from '../handoff/task-manifest.js';
import type { ImplementSessionOutcome } from '../outcomes/normalize-session-outcome.js';

export interface DriftResult {
  drifted: boolean;
  hash_match: boolean;
  missing_in_outcome: string[];
  extra_in_outcome: string[];
  details: string;
}

/**
 * Detect drift between tasks.md and a Squad outcome.
 * Compares task IDs and manifest hash to identify:
 * - Tasks in tasks.md not present in the outcome
 * - Tasks in the outcome not present in tasks.md
 * - Hash mismatch indicating tasks.md was modified
 */
export async function detectTaskDrift(
  tasksPath: string,
  outcomePath: string
): Promise<DriftResult> {
  const tasks = await parseTasksMd(tasksPath);
  const outcomeContent = await readFile(outcomePath, 'utf-8');
  const outcome = JSON.parse(outcomeContent) as ImplementSessionOutcome;

  const currentHash = computeTaskManifestHash(tasks);
  const hashMatch = currentHash === outcome.task_manifest_hash;

  const taskIds = new Set(tasks.map((t) => t.task_id));
  const outcomeIds = new Set([
    ...outcome.completed_tasks.map((t) => t.task_id),
    ...outcome.failed_tasks.map((t) => t.task_id),
    ...outcome.unassigned_tasks.map((t) => t.task_id),
  ]);

  const missingInOutcome = [...taskIds].filter((id) => !outcomeIds.has(id));
  const extraInOutcome = [...outcomeIds].filter((id) => !taskIds.has(id));

  const drifted = !hashMatch || missingInOutcome.length > 0 || extraInOutcome.length > 0;

  const detailParts: string[] = [];
  if (!hashMatch) detailParts.push('Task manifest hash mismatch');
  if (missingInOutcome.length > 0)
    detailParts.push(`Tasks missing in outcome: ${missingInOutcome.join(', ')}`);
  if (extraInOutcome.length > 0)
    detailParts.push(`Extra tasks in outcome: ${extraInOutcome.join(', ')}`);
  if (!drifted) detailParts.push('No drift detected');

  return {
    drifted,
    hash_match: hashMatch,
    missing_in_outcome: missingInOutcome,
    extra_in_outcome: extraInOutcome,
    details: detailParts.join('; '),
  };
}
