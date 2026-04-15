import { writeFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { adaptSquadMode } from '../../src/analyzers/readiness/mode-adapter.js';
import { checkSquadReadiness } from '../../src/analyzers/readiness/check-squad-readiness.js';

describe('sdk-first squad build artifact path', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = resolve(tmpdir(), `test-sdk-first-${randomUUID()}`);
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('detects sdk-first mode with squad.config.ts', async () => {
    await writeFile(resolve(tempDir, 'squad.config.ts'), 'export default {};', 'utf-8');
    await mkdir(resolve(tempDir, '.squad'), { recursive: true });

    const result = await adaptSquadMode(tempDir);
    expect(result.mode).toBe('sdk-first');
    expect(result.artifacts_ready).toBe(true);
    expect(result.config_path).toContain('squad.config.ts');
  });

  it('reports not ready when squad.config.ts exists but .squad/ missing', async () => {
    await writeFile(resolve(tempDir, 'squad.config.ts'), 'export default {};', 'utf-8');

    const result = await adaptSquadMode(tempDir);
    expect(result.mode).toBe('sdk-first');
    expect(result.artifacts_ready).toBe(false);
    expect(result.notes[0]).toContain('squad build');
  });

  it('readiness check detects sdk-first mode', async () => {
    await writeFile(resolve(tempDir, 'squad.config.ts'), 'export default {};', 'utf-8');

    const result = await checkSquadReadiness(tempDir);
    expect(result.detected_mode).toBe('sdk-first');
    expect(result.sdk_config_path).toContain('squad.config.ts');
  });
});
