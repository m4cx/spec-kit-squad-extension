import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { parseTasksMd } from './parse-tasks-md.js';
import { computeTaskManifestHash, type TaskEntry } from './task-manifest.js';
import { deriveProjectId, normalizePath } from '../../learning-store/project-scope.js';

export interface TaskHandoffPayload {
  session_id: string;
  project_id: string;
  tasks_source_path: string;
  task_manifest_hash: string;
  tasks: TaskEntry[];
}

/**
 * Build a deterministic handoff payload from tasks.md.
 * This is the canonical input that gets passed to Squad.
 */
export async function buildHandoff(
  tasksPath: string,
  repoRoot: string
): Promise<TaskHandoffPayload> {
  const absoluteTasksPath = resolve(repoRoot, tasksPath);
  const tasks = await parseTasksMd(absoluteTasksPath);

  if (tasks.length === 0) {
    throw new Error(`No tasks found in ${tasksPath}. Run /speckit.tasks to generate tasks.`);
  }

  const projectId = deriveProjectId(repoRoot);
  const taskManifestHash = computeTaskManifestHash(tasks);
  const sessionId = randomUUID();

  return {
    session_id: sessionId,
    project_id: projectId,
    tasks_source_path: normalizePath(tasksPath),
    task_manifest_hash: taskManifestHash,
    tasks,
  };
}
