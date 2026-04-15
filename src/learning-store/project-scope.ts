import { createHash } from 'node:crypto';
import { resolve, normalize, sep } from 'node:path';

/**
 * Derive a stable project_id from the repository root path.
 * Uses SHA-256 of the normalized absolute path.
 */
export function deriveProjectId(repoRoot: string): string {
  const normalized = normalize(resolve(repoRoot)).replace(/\\/g, '/');
  return createHash('sha256').update(normalized, 'utf-8').digest('hex').slice(0, 16);
}

/**
 * Resolve the .squad/squad-kit-memory directory path.
 */
export function learningStorePath(repoRoot: string): string {
  return resolve(repoRoot, '.squad', 'squad-kit-memory');
}

/**
 * Normalize a file path for cross-platform consistency.
 */
export function normalizePath(filePath: string): string {
  return normalize(filePath).split(sep).join('/');
}
