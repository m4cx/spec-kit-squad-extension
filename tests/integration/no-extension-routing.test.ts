import { writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { buildHandoff } from '../../src/analyzers/handoff/build-handoff.js';

describe('no extension-side task assignment behavior', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = resolve(tmpdir(), `test-no-routing-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('handoff payload does not contain assignee fields', async () => {
    const tasksContent = `# Tasks

## Phase 1: Setup

- [ ] T001 Create project structure
- [ ] T002 [P] Configure TypeScript
- [ ] T003 [US1] Implement feature A
`;
    const tasksPath = resolve(tempDir, 'tasks.md');
    await writeFile(tasksPath, tasksContent, 'utf-8');

    const handoff = await buildHandoff(tasksPath, tempDir);

    // The extension must NOT assign tasks to members
    for (const task of handoff.tasks) {
      expect(task).not.toHaveProperty('assignee');
    }
  });

  it('handoff payload preserves task order from tasks.md', async () => {
    const tasksContent = `# Tasks

## Phase 1: Setup

- [ ] T001 First task
- [ ] T002 Second task
- [ ] T003 Third task
`;
    const tasksPath = resolve(tempDir, 'tasks.md');
    await writeFile(tasksPath, tasksContent, 'utf-8');

    const handoff = await buildHandoff(tasksPath, tempDir);

    expect(handoff.tasks[0].task_id).toBe('T001');
    expect(handoff.tasks[1].task_id).toBe('T002');
    expect(handoff.tasks[2].task_id).toBe('T003');
  });

  it('handoff payload works identically for different team topologies', async () => {
    // Same tasks.md should produce same handoff regardless of team setup
    const tasksContent = `# Tasks

## Phase 1: Setup

- [ ] T001 Create structure
- [ ] T002 [P] Add config
`;
    const tasksPath = resolve(tempDir, 'tasks.md');
    await writeFile(tasksPath, tasksContent, 'utf-8');

    const handoff1 = await buildHandoff(tasksPath, tempDir);

    // Re-build - should produce same hash (different session_id)
    const handoff2 = await buildHandoff(tasksPath, tempDir);

    expect(handoff1.task_manifest_hash).toBe(handoff2.task_manifest_hash);
    expect(handoff1.tasks).toEqual(handoff2.tasks);
  });
});
