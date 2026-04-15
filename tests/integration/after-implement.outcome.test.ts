import { normalizeSessionOutcome, type RawSquadOutcome } from '../../src/analyzers/outcomes/normalize-session-outcome.js';

describe('after_implement outcome normalization', () => {
  it('normalizes a complete raw outcome', () => {
    const raw: RawSquadOutcome = {
      session_id: 'sess-001',
      project_id: 'proj-abc',
      tasks_source_path: 'specs/001/tasks.md',
      task_manifest_hash: 'hash123',
      squad_mode: 'markdown-first',
      tasks: [
        { task_id: 'T001', title: 'Setup', assignee: 'agent-1', status: 'completed', details: 'Created dirs' },
        { task_id: 'T002', title: 'Config', assignee: null, status: 'failed', details: 'Missing dep' },
        { task_id: 'T003', title: 'Test', status: 'skipped', details: 'Blocked' },
      ],
      raw_log_refs: ['.squad/logs/session-001.log'],
    };

    const result = normalizeSessionOutcome(raw);

    expect(result.session_id).toBe('sess-001');
    expect(result.status).toBe('failed'); // has failed tasks
    expect(result.completed_tasks).toHaveLength(1);
    expect(result.failed_tasks).toHaveLength(1);
    expect(result.unassigned_tasks).toHaveLength(1);
    expect(result.raw_log_refs).toEqual(['.squad/logs/session-001.log']);
    expect(result.summary).toContain('failed');
    expect(result.summary).toContain('1 completed');
  });

  it('marks session completed when all tasks succeed', () => {
    const raw: RawSquadOutcome = {
      session_id: 'sess-002',
      project_id: 'proj-abc',
      tasks_source_path: 'specs/001/tasks.md',
      task_manifest_hash: 'hash456',
      squad_mode: 'sdk-first',
      tasks: [
        { task_id: 'T001', title: 'Task A', status: 'done', details: 'OK' },
        { task_id: 'T002', title: 'Task B', status: 'success', details: 'OK' },
      ],
    };

    const result = normalizeSessionOutcome(raw);

    expect(result.status).toBe('completed');
    expect(result.squad_mode).toBe('sdk-first');
    expect(result.completed_tasks).toHaveLength(2);
    expect(result.failed_tasks).toHaveLength(0);
  });

  it('handles missing tasks array gracefully', () => {
    const raw: RawSquadOutcome = {
      session_id: 'sess-003',
      project_id: 'proj-abc',
      tasks_source_path: 'specs/001/tasks.md',
      task_manifest_hash: 'hash789',
      squad_mode: 'markdown-first',
    };

    const result = normalizeSessionOutcome(raw);

    expect(result.status).toBe('interrupted');
    expect(result.completed_tasks).toHaveLength(0);
    expect(result.failed_tasks).toHaveLength(0);
    expect(result.unassigned_tasks).toHaveLength(0);
  });

  it('normalizes unknown status to unassigned', () => {
    const raw: RawSquadOutcome = {
      session_id: 'sess-004',
      project_id: 'proj-abc',
      tasks_source_path: 'specs/001/tasks.md',
      task_manifest_hash: 'hashxyz',
      squad_mode: 'markdown-first',
      tasks: [
        { task_id: 'T001', title: 'Unknown', status: 'pending', details: 'Waiting' },
      ],
    };

    const result = normalizeSessionOutcome(raw);
    expect(result.unassigned_tasks).toHaveLength(1);
    expect(result.unassigned_tasks[0].status).toBe('unassigned');
  });
});
