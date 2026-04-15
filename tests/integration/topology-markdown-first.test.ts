import { mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { adaptSquadMode } from '../../src/analyzers/readiness/mode-adapter.js';
import { checkSquadReadiness } from '../../src/analyzers/readiness/check-squad-readiness.js';

describe('markdown-first team topology readiness', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = resolve(tmpdir(), `test-markdown-first-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('detects markdown-first mode with .squad/ directory', async () => {
    await mkdir(resolve(tempDir, '.squad'), { recursive: true });

    const result = await adaptSquadMode(tempDir);
    expect(result.mode).toBe('markdown-first');
    expect(result.artifacts_ready).toBe(true);
    expect(result.config_path).toBeNull();
  });

  it('reports not ready when no squad config exists', async () => {
    const result = await adaptSquadMode(tempDir);
    expect(result.artifacts_ready).toBe(false);
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it('readiness check reports error when no Squad config', async () => {
    const result = await checkSquadReadiness(tempDir);
    expect(result.is_ready).toBe(false);
    expect(result.issues.some((i) => i.code === 'NO_SQUAD_CONFIG')).toBe(true);
  });

  it('readiness check passes with .squad/ directory', async () => {
    await mkdir(resolve(tempDir, '.squad'), { recursive: true });

    const result = await checkSquadReadiness(tempDir);
    expect(result.is_ready).toBe(true);
    expect(result.detected_mode).toBe('markdown-first');
  });
});
