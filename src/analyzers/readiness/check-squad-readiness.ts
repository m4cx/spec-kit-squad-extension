import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { deriveProjectId } from '../../learning-store/project-scope.js';

export interface ReadinessIssue {
  code: string;
  severity: 'error' | 'warning';
  message: string;
  suggested_fix: string;
}

export interface SquadReadiness {
  project_id: string;
  detected_mode: 'markdown-first' | 'sdk-first';
  squad_dir_exists: boolean;
  team_file_path: string | null;
  routing_file_path: string | null;
  sdk_config_path: string | null;
  issues: ReadinessIssue[];
  is_ready: boolean;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function checkSquadReadiness(repoRoot: string): Promise<SquadReadiness> {
  const projectId = deriveProjectId(repoRoot);
  const issues: ReadinessIssue[] = [];

  const squadDir = resolve(repoRoot, '.squad');
  const squadDirExists = await fileExists(squadDir);

  const sdkConfigPath = resolve(repoRoot, 'squad.config.ts');
  const sdkConfigExists = await fileExists(sdkConfigPath);

  // Determine mode
  let detectedMode: 'markdown-first' | 'sdk-first' = 'markdown-first';
  if (sdkConfigExists) {
    detectedMode = 'sdk-first';
  }

  // Check Squad directory
  if (!squadDirExists && !sdkConfigExists) {
    issues.push({
      code: 'NO_SQUAD_CONFIG',
      severity: 'error',
      message: 'No .squad/ directory or squad.config.ts found',
      suggested_fix: 'Run "squad init" or create squad.config.ts for sdk-first mode',
    });
  }

  // Check for team file in markdown-first mode
  let teamFilePath: string | null = null;
  if (detectedMode === 'markdown-first' && squadDirExists) {
    const candidateTeamFile = resolve(squadDir, 'team.md');
    if (await fileExists(candidateTeamFile)) {
      teamFilePath = candidateTeamFile;
    } else {
      issues.push({
        code: 'NO_TEAM_FILE',
        severity: 'warning',
        message: 'No team.md found in .squad/ directory',
        suggested_fix: 'Create .squad/team.md with your squad team definition',
      });
    }
  }

  // Check for routing file
  let routingFilePath: string | null = null;
  if (squadDirExists) {
    const candidateRouting = resolve(squadDir, 'routing.md');
    if (await fileExists(candidateRouting)) {
      routingFilePath = candidateRouting;
    }
  }

  // Check squad CLI availability
  // We just note it as a warning; the actual check happens at script invocation
  // to keep this analyzer deterministic and side-effect-free.

  const isReady = !issues.some((i) => i.severity === 'error');

  return {
    project_id: projectId,
    detected_mode: detectedMode,
    squad_dir_exists: squadDirExists,
    team_file_path: teamFilePath,
    routing_file_path: routingFilePath,
    sdk_config_path: sdkConfigExists ? sdkConfigPath : null,
    issues,
    is_ready: isReady,
  };
}
