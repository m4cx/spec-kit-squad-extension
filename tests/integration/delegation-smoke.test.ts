import { writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { checkSquadReadiness } from '../../src/analyzers/readiness/check-squad-readiness.js';
import { adaptSquadMode } from '../../src/analyzers/readiness/mode-adapter.js';
import { buildHandoff } from '../../src/analyzers/handoff/build-handoff.js';
import { normalizeSessionOutcome, type RawSquadOutcome } from '../../src/analyzers/outcomes/normalize-session-outcome.js';
import { detectTaskDrift } from '../../src/analyzers/drift/detect-task-drift.js';
import { appendLearnings, type LearningRecord } from '../../src/learning-store/writer.js';
import { buildLearningIndex } from '../../src/learning-store/indexer.js';
import { buildPlanningContext, formatContextForInjection } from '../../src/learning-store/prompt-injector.js';
import { deriveProjectId } from '../../src/learning-store/project-scope.js';
import { validatePayload, loadSchema } from '../../src/contracts/validators.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMPLEMENT_SESSION_SCHEMA_PATH = resolve(
  __dirname,
  '../../src/contracts/schemas/implement-session.contract.json'
);

describe('end-to-end delegation smoke test', () => {
  let tempDir: string;
  let projectId: string;

  beforeEach(async () => {
    tempDir = resolve(tmpdir(), `test-e2e-${randomUUID()}`);
    await mkdir(resolve(tempDir, '.squad'), { recursive: true });
    projectId = deriveProjectId(tempDir);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('completes full delegation lifecycle', async () => {
    // 1. Check readiness
    const readiness = await checkSquadReadiness(tempDir);
    expect(readiness.is_ready).toBe(true);

    // 2. Adapt mode
    const mode = await adaptSquadMode(tempDir);
    expect(mode.mode).toBe('markdown-first');
    expect(mode.artifacts_ready).toBe(true);

    // 3. Create tasks.md
    const tasksContent = `# Tasks

## Phase 1: Setup

- [ ] T001 Initialize project
- [ ] T002 [P] Configure build

## Phase 2: Core

- [ ] T003 [US1] Implement feature A
- [ ] T004 [P] [US1] Add tests
`;
    const tasksPath = resolve(tempDir, 'tasks.md');
    await writeFile(tasksPath, tasksContent, 'utf-8');

    // 4. Build handoff
    const handoff = await buildHandoff(tasksPath, tempDir);
    expect(handoff.tasks).toHaveLength(4);
    expect(handoff.project_id).toBe(projectId);

    // 5. Simulate Squad outcome
    const rawOutcome: RawSquadOutcome = {
      session_id: handoff.session_id,
      project_id: handoff.project_id,
      tasks_source_path: handoff.tasks_source_path,
      task_manifest_hash: handoff.task_manifest_hash,
      squad_mode: 'markdown-first',
      tasks: [
        { task_id: 'T001', title: 'Initialize project', status: 'completed', details: 'Done' },
        { task_id: 'T002', title: 'Configure build', status: 'completed', details: 'Done' },
        { task_id: 'T003', title: 'Implement feature A', status: 'completed', details: 'Implemented' },
        { task_id: 'T004', title: 'Add tests', status: 'completed', details: 'Tests added' },
      ],
    };

    // 6. Normalize outcome
    const outcome = normalizeSessionOutcome(rawOutcome);
    expect(outcome.status).toBe('completed');
    expect(outcome.completed_tasks).toHaveLength(4);

    // 7. Validate against contract
    const schema = await loadSchema(IMPLEMENT_SESSION_SCHEMA_PATH);
    const validation = validatePayload(schema, outcome);
    expect(validation.valid).toBe(true);

    // 8. Check for drift
    const outcomePath = resolve(tempDir, 'outcome.json');
    await writeFile(outcomePath, JSON.stringify(outcome), 'utf-8');
    const drift = await detectTaskDrift(tasksPath, outcomePath);
    expect(drift.drifted).toBe(false);

    // 9. Persist learnings
    const learnings: LearningRecord[] = [
      {
        learning_id: `learn-${randomUUID()}`,
        project_id: projectId,
        session_id: handoff.session_id,
        captured_at: new Date().toISOString(),
        agent: 'squad-member-1',
        category: 'decision',
        content: 'Used ESM modules throughout',
        tags: ['build', 'esm'],
        source_ref: null,
      },
    ];
    await appendLearnings(tempDir, learnings);

    // 10. Build index
    const index = await buildLearningIndex(tempDir, projectId);
    expect(index.record_count).toBe(1);

    // 11. Build planning context for injection
    const planContext = await buildPlanningContext(tempDir);
    expect(planContext.learning_digest.length).toBeGreaterThan(0);

    const injectionText = formatContextForInjection(planContext);
    expect(injectionText).toContain('Implementation Learnings');
  });
});
