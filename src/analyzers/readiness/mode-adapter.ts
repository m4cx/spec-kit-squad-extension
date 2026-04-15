import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

export type SquadMode = 'markdown-first' | 'sdk-first';

export interface ModeAdapterResult {
  mode: SquadMode;
  squad_dir: string | null;
  config_path: string | null;
  artifacts_ready: boolean;
  notes: string[];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Converge markdown-first and sdk-first Squad configurations
 * into a unified artifact state that downstream analyzers consume.
 *
 * For sdk-first: expects `squad build` to have generated .squad/ artifacts.
 * For markdown-first: expects .squad/ with team configuration.
 * Both paths produce .squad/ artifacts for downstream consumption.
 */
export async function adaptSquadMode(repoRoot: string): Promise<ModeAdapterResult> {
  const notes: string[] = [];
  const squadDir = resolve(repoRoot, '.squad');
  const sdkConfig = resolve(repoRoot, 'squad.config.ts');

  const squadDirExists = await fileExists(squadDir);
  const sdkConfigExists = await fileExists(sdkConfig);

  if (sdkConfigExists) {
    // SDK-first mode
    if (!squadDirExists) {
      notes.push('squad.config.ts found but .squad/ missing. Run "squad build" to generate artifacts.');
      return {
        mode: 'sdk-first',
        squad_dir: null,
        config_path: sdkConfig,
        artifacts_ready: false,
        notes,
      };
    }

    notes.push('SDK-first mode: using squad.config.ts with generated .squad/ artifacts.');
    return {
      mode: 'sdk-first',
      squad_dir: squadDir,
      config_path: sdkConfig,
      artifacts_ready: true,
      notes,
    };
  }

  if (squadDirExists) {
    notes.push('Markdown-first mode: using .squad/ directory directly.');
    return {
      mode: 'markdown-first',
      squad_dir: squadDir,
      config_path: null,
      artifacts_ready: true,
      notes,
    };
  }

  notes.push('No Squad configuration found. Run "squad init" or create squad.config.ts.');
  return {
    mode: 'markdown-first',
    squad_dir: null,
    config_path: null,
    artifacts_ready: false,
    notes,
  };
}
