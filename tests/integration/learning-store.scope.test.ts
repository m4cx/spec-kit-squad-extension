import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { appendLearnings, type LearningRecord } from '../../src/learning-store/writer.js';
import { loadProjectLearnings } from '../../src/learning-store/scope-filter.js';
import { deriveProjectId } from '../../src/learning-store/project-scope.js';

describe('project-scoped learning persistence and retrieval', () => {
  let tempDir: string;
  let projectId: string;

  beforeEach(async () => {
    tempDir = resolve(tmpdir(), `test-learning-store-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });
    projectId = deriveProjectId(tempDir);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('persists and retrieves learning records for a project', async () => {
    const records: LearningRecord[] = [
      {
        learning_id: 'learn-001',
        project_id: projectId,
        session_id: 'sess-001',
        captured_at: '2026-04-15T10:00:00Z',
        agent: 'agent-1',
        category: 'decision',
        content: 'Use PostgreSQL',
        tags: ['database'],
        source_ref: null,
      },
      {
        learning_id: 'learn-002',
        project_id: projectId,
        session_id: 'sess-001',
        captured_at: '2026-04-15T10:01:00Z',
        agent: 'agent-1',
        category: 'constraint',
        content: 'Node 20+ required',
        tags: ['runtime'],
        source_ref: null,
      },
    ];

    await appendLearnings(tempDir, records);

    const loaded = await loadProjectLearnings(tempDir, projectId);
    expect(loaded).toHaveLength(2);
    expect(loaded[0].learning_id).toBe('learn-001');
    expect(loaded[1].category).toBe('constraint');
  });

  it('filters by project_id', async () => {
    const records: LearningRecord[] = [
      {
        learning_id: 'learn-001',
        project_id: projectId,
        session_id: 'sess-001',
        captured_at: '2026-04-15T10:00:00Z',
        agent: 'agent-1',
        category: 'decision',
        content: 'For this project',
        tags: [],
        source_ref: null,
      },
      {
        learning_id: 'learn-002',
        project_id: 'other-project',
        session_id: 'sess-002',
        captured_at: '2026-04-15T10:01:00Z',
        agent: 'agent-2',
        category: 'risk',
        content: 'For other project',
        tags: [],
        source_ref: null,
      },
    ];

    await appendLearnings(tempDir, records);

    const loaded = await loadProjectLearnings(tempDir, projectId);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].content).toBe('For this project');
  });

  it('returns empty array when no learnings exist', async () => {
    const loaded = await loadProjectLearnings(tempDir, projectId);
    expect(loaded).toHaveLength(0);
  });
});
