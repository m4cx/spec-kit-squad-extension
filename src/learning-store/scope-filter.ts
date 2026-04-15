import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { learningStorePath } from './project-scope.js';
import type { LearningRecord } from './writer.js';

/**
 * Load and filter learning records for a specific project.
 */
export async function loadProjectLearnings(
  repoRoot: string,
  projectId: string
): Promise<LearningRecord[]> {
  const storePath = learningStorePath(repoRoot);
  const filePath = resolve(storePath, 'learnings.jsonl');

  try {
    const content = await readFile(filePath, 'utf-8');
    return content
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as LearningRecord)
      .filter((r) => r.project_id === projectId);
  } catch {
    return [];
  }
}

/**
 * Build a digest of learnings suitable for prompt injection.
 * Groups by category and returns normalized summaries.
 */
export function buildLearningDigest(
  records: LearningRecord[]
): Array<{ category: string; summary: string; tags: string[] }> {
  const grouped = new Map<string, LearningRecord[]>();

  for (const record of records) {
    const existing = grouped.get(record.category) ?? [];
    existing.push(record);
    grouped.set(record.category, existing);
  }

  const digest: Array<{ category: string; summary: string; tags: string[] }> = [];

  for (const [category, categoryRecords] of grouped) {
    const allTags = new Set<string>();
    const contentParts: string[] = [];

    for (const r of categoryRecords) {
      contentParts.push(r.content);
      for (const tag of r.tags) {
        allTags.add(tag);
      }
    }

    digest.push({
      category,
      summary: contentParts.join('; '),
      tags: Array.from(allTags),
    });
  }

  return digest;
}
