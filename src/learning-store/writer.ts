import { appendFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { learningStorePath } from './project-scope.js';

export interface LearningRecord {
  learning_id: string;
  project_id: string;
  session_id: string;
  captured_at: string;
  agent: string;
  category: 'constraint' | 'decision' | 'risk' | 'pattern';
  content: string;
  tags: string[];
  source_ref: string | null;
}

/**
 * Append learning records to the project-scoped learnings.jsonl file.
 * Creates the directory and file if they don't exist.
 */
export async function appendLearnings(
  repoRoot: string,
  records: LearningRecord[]
): Promise<string> {
  const storePath = learningStorePath(repoRoot);
  await mkdir(storePath, { recursive: true });

  const filePath = resolve(storePath, 'learnings.jsonl');
  const lines = records.map((r) => JSON.stringify(r)).join('\n') + '\n';
  await appendFile(filePath, lines, 'utf-8');

  return filePath;
}

/**
 * Append a session log entry to sessions.log.
 */
export async function appendSessionLog(
  repoRoot: string,
  sessionId: string,
  status: string,
  summary: string
): Promise<void> {
  const storePath = learningStorePath(repoRoot);
  await mkdir(storePath, { recursive: true });

  const logPath = resolve(storePath, 'sessions.log');
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] session=${sessionId} status=${status} ${summary}\n`;
  await appendFile(logPath, entry, 'utf-8');
}
