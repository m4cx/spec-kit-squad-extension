import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePayload } from '../../src/contracts/validators.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = resolve(__dirname, '../../src/contracts/schemas/learning-record.schema.json');

let schema: Record<string, unknown>;

beforeAll(async () => {
  schema = JSON.parse(await readFile(SCHEMA_PATH, 'utf-8'));
});

describe('learning-record schema validation', () => {
  it('accepts a valid learning record', () => {
    const valid = {
      learning_id: 'learn-001',
      project_id: 'proj-abc',
      session_id: 'sess-001',
      captured_at: '2026-04-15T10:00:00Z',
      agent: 'squad-member-1',
      category: 'decision',
      content: 'Chose PostgreSQL over SQLite for concurrent access',
      tags: ['database', 'architecture'],
      source_ref: 'src/db/config.ts',
    };
    const result = validatePayload(schema, valid);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts a learning record with null source_ref', () => {
    const valid = {
      learning_id: 'learn-002',
      project_id: 'proj-abc',
      session_id: 'sess-001',
      captured_at: '2026-04-15T10:00:00Z',
      agent: 'squad-member-1',
      category: 'constraint',
      content: 'Must use Node 20+ for ESM support',
      tags: ['runtime'],
      source_ref: null,
    };
    const result = validatePayload(schema, valid);
    expect(result.valid).toBe(true);
  });

  it('rejects invalid category value', () => {
    const invalid = {
      learning_id: 'learn-003',
      project_id: 'proj-abc',
      session_id: 'sess-001',
      captured_at: '2026-04-15T10:00:00Z',
      agent: 'squad-member-1',
      category: 'invalid-category',
      content: 'Some content',
      tags: [],
    };
    const result = validatePayload(schema, invalid);
    expect(result.valid).toBe(false);
  });

  it('rejects missing required fields', () => {
    const invalid = {
      learning_id: 'learn-004',
      // missing many required fields
    };
    const result = validatePayload(schema, invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects additional properties', () => {
    const invalid = {
      learning_id: 'learn-005',
      project_id: 'proj-abc',
      session_id: 'sess-001',
      captured_at: '2026-04-15T10:00:00Z',
      agent: 'squad-member-1',
      category: 'pattern',
      content: 'Some pattern',
      tags: ['test'],
      extra_field: 'not allowed',
    };
    const result = validatePayload(schema, invalid);
    expect(result.valid).toBe(false);
  });
});
