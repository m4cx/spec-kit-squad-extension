import { readFile } from 'node:fs/promises';

export interface TaskEntry {
  task_id: string;
  title: string;
  phase: string;
  parallel: boolean;
  user_story: string | null;
}

/**
 * Parse tasks.md and extract structured task entries.
 * Expects lines like: - [ ] T001 [P] [US1] Description in path/to/file
 */
export async function parseTasksMd(tasksPath: string): Promise<TaskEntry[]> {
  const content = await readFile(tasksPath, 'utf-8');
  return parseTasksContent(content);
}

export function parseTasksContent(content: string): TaskEntry[] {
  const tasks: TaskEntry[] = [];
  let currentPhase = 'Unknown';

  for (const line of content.split('\n')) {
    // Detect phase headers: ## Phase N: Name or ## Phase N:
    const phaseMatch = line.match(/^##\s+Phase\s+\d+[^#]*(.*)/);
    if (phaseMatch) {
      currentPhase = phaseMatch[1]?.replace(/^[:\s-]+/, '').trim() || currentPhase;
      continue;
    }

    // Match task lines: - [ ] T### or - [x] T### or - [X] T###
    const taskMatch = line.match(
      /^-\s+\[([ xX])\]\s+(T\d{3})\s+(.+)$/
    );
    if (!taskMatch) continue;

    const taskId = taskMatch[2];
    let remainder = taskMatch[3];

    // Extract [P] marker
    const parallel = /\[P\]/.test(remainder);
    remainder = remainder.replace(/\[P\]\s*/, '');

    // Extract [US#] marker
    const usMatch = remainder.match(/\[US(\d+)\]/);
    const userStory = usMatch ? `US${usMatch[1]}` : null;
    remainder = remainder.replace(/\[US\d+\]\s*/, '');

    const title = remainder.trim();

    tasks.push({
      task_id: taskId,
      title,
      phase: currentPhase,
      parallel,
      user_story: userStory,
    });
  }

  return tasks;
}
