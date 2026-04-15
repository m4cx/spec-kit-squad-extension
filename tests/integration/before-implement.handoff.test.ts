import { writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { buildHandoff } from '../../src/analyzers/handoff/build-handoff.js';

describe('before_implement handoff generation', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = resolve(tmpdir(), `test-handoff-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('generates a valid handoff payload from tasks.md', async () => {
    const tasksContent = `# Tasks

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create extension directories
- [ ] T002 [P] Initialize package.json
- [ ] T003 [US1] Implement feature
`;
    const tasksPath = resolve(tempDir, 'tasks.md');
    await writeFile(tasksPath, tasksContent, 'utf-8');

    const handoff = await buildHandoff(tasksPath, tempDir);

    expect(handoff.session_id).toBeTruthy();
    expect(handoff.project_id).toBeTruthy();
    expect(handoff.task_manifest_hash).toBeTruthy();
    expect(handoff.tasks).toHaveLength(3);
    expect(handoff.tasks[0].task_id).toBe('T001');
    expect(handoff.tasks[1].parallel).toBe(true);
    expect(handoff.tasks[2].user_story).toBe('US1');
  });

  it('throws when tasks.md has no tasks', async () => {
    const tasksPath = resolve(tempDir, 'tasks.md');
    await writeFile(tasksPath, '# Empty\n\nNo tasks here.', 'utf-8');

    await expect(buildHandoff(tasksPath, tempDir)).rejects.toThrow('No tasks found');
  });

  it('produces a deterministic hash for the same tasks', async () => {
    const tasksContent = `# Tasks

## Phase 1: Setup

- [ ] T001 Task A
- [ ] T002 Task B
`;
    const tasksPath = resolve(tempDir, 'tasks.md');
    await writeFile(tasksPath, tasksContent, 'utf-8');

    const h1 = await buildHandoff(tasksPath, tempDir);
    const h2 = await buildHandoff(tasksPath, tempDir);

    expect(h1.task_manifest_hash).toBe(h2.task_manifest_hash);
    // Session IDs should differ (random)
    expect(h1.session_id).not.toBe(h2.session_id);
  });
});
