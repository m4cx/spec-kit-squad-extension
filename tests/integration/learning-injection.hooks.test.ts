import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { appendLearnings, type LearningRecord } from '../../src/learning-store/writer.js';
import { buildPlanningContext, formatContextForInjection } from '../../src/learning-store/prompt-injector.js';
import { deriveProjectId } from '../../src/learning-store/project-scope.js';

describe('before_plan and before_tasks prompt injection', () => {
  let tempDir: string;
  let projectId: string;

  beforeEach(async () => {
    tempDir = resolve(tmpdir(), `test-injection-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });
    projectId = deriveProjectId(tempDir);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('builds planning context with existing learnings', async () => {
    const records: LearningRecord[] = [
      {
        learning_id: 'learn-001',
        project_id: projectId,
        session_id: 'sess-001',
        captured_at: '2026-04-15T10:00:00Z',
        agent: 'agent-1',
        category: 'decision',
        content: 'Use PostgreSQL for persistence',
        tags: ['database', 'architecture'],
        source_ref: null,
      },
      {
        learning_id: 'learn-002',
        project_id: projectId,
        session_id: 'sess-001',
        captured_at: '2026-04-15T10:01:00Z',
        agent: 'agent-1',
        category: 'constraint',
        content: 'Must support Node 20+',
        tags: ['runtime'],
        source_ref: null,
      },
    ];

    await appendLearnings(tempDir, records);

    const pkg = await buildPlanningContext(tempDir);

    expect(pkg.project_id).toBe(projectId);
    expect(pkg.learning_digest).toHaveLength(2);
    expect(pkg.source_sessions).toContain('sess-001');
  });

  it('formats context as markdown injection block', async () => {
    const records: LearningRecord[] = [
      {
        learning_id: 'learn-001',
        project_id: projectId,
        session_id: 'sess-001',
        captured_at: '2026-04-15T10:00:00Z',
        agent: 'agent-1',
        category: 'decision',
        content: 'Use ESM modules',
        tags: ['build'],
        source_ref: null,
      },
    ];

    await appendLearnings(tempDir, records);

    const pkg = await buildPlanningContext(tempDir);
    const output = formatContextForInjection(pkg);

    expect(output).toContain('## Implementation Learnings');
    expect(output).toContain('Decisions');
    expect(output).toContain('Use ESM modules');
    expect(output).toContain('build');
  });

  it('returns empty string when no learnings exist', async () => {
    const pkg = await buildPlanningContext(tempDir);
    const output = formatContextForInjection(pkg);

    expect(output).toBe('');
  });
});
