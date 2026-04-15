import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePayload } from '../../src/contracts/validators.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, '../../src/contracts/schemas/implement-session.contract.json');

let schema: Record<string, unknown>;

beforeAll(async () => {
  schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf-8'));
});

describe('implement-session contract validation', () => {
  it('accepts a valid complete session payload', () => {
    const valid = {
      session_id: 'sess-001',
      project_id: 'proj-abc',
      tasks_source_path: 'specs/001/tasks.md',
      task_manifest_hash: 'abc123def456',
      squad_mode: 'markdown-first',
      status: 'completed',
      completed_tasks: [
        { task_id: 'T001', title: 'Setup', assignee: 'agent-1', status: 'completed', details: 'Done' },
      ],
      failed_tasks: [],
      unassigned_tasks: [],
      summary: 'Session completed, 1 completed',
      raw_log_refs: [],
    };
    const result = validatePayload(schema, valid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects payload missing required fields', () => {
    const invalid = {
      session_id: 'sess-001',
      // missing project_id, tasks_source_path, etc.
    };
    const result = validatePayload(schema, invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid squad_mode value', () => {
    const invalid = {
      session_id: 'sess-001',
      project_id: 'proj-abc',
      tasks_source_path: 'specs/001/tasks.md',
      task_manifest_hash: 'abc123',
      squad_mode: 'invalid-mode',
      status: 'completed',
      completed_tasks: [],
      failed_tasks: [],
      unassigned_tasks: [],
      summary: 'Done',
    };
    const result = validatePayload(schema, invalid);
    expect(result.valid).toBe(false);
  });

  it('rejects task outcome with invalid status', () => {
    const invalid = {
      session_id: 'sess-001',
      project_id: 'proj-abc',
      tasks_source_path: 'specs/001/tasks.md',
      task_manifest_hash: 'abc123',
      squad_mode: 'markdown-first',
      status: 'completed',
      completed_tasks: [
        { task_id: 'T001', title: 'Setup', status: 'invalid-status', details: 'Done' },
      ],
      failed_tasks: [],
      unassigned_tasks: [],
      summary: 'Done',
    };
    const result = validatePayload(schema, invalid);
    expect(result.valid).toBe(false);
  });

  it('rejects additional properties on task outcome', () => {
    const invalid = {
      session_id: 'sess-001',
      project_id: 'proj-abc',
      tasks_source_path: 'specs/001/tasks.md',
      task_manifest_hash: 'abc123',
      squad_mode: 'markdown-first',
      status: 'completed',
      completed_tasks: [
        { task_id: 'T001', title: 'Setup', status: 'completed', details: 'Done', extra: 'field' },
      ],
      failed_tasks: [],
      unassigned_tasks: [],
      summary: 'Done',
    };
    const result = validatePayload(schema, invalid);
    expect(result.valid).toBe(false);
  });
});
