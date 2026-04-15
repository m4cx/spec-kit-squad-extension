import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { learningStorePath } from './project-scope.js';
import type { LearningRecord } from './writer.js';

export interface LearningIndex {
  project_id: string;
  generated_at: string;
  record_count: number;
  keyword_map: Record<string, string[]>;
}

/**
 * Build or rebuild the keyword-based learning index from learnings.jsonl.
 */
export async function buildLearningIndex(
  repoRoot: string,
  projectId: string
): Promise<LearningIndex> {
  const storePath = learningStorePath(repoRoot);
  const filePath = resolve(storePath, 'learnings.jsonl');

  let records: LearningRecord[] = [];
  try {
    const content = await readFile(filePath, 'utf-8');
    records = content
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line) as LearningRecord)
      .filter((r) => r.project_id === projectId);
  } catch {
    // No file yet - empty index
  }

  const keywordMap: Record<string, string[]> = {};

  for (const record of records) {
    const keywords = extractKeywords(record);
    for (const keyword of keywords) {
      if (!keywordMap[keyword]) {
        keywordMap[keyword] = [];
      }
      if (!keywordMap[keyword].includes(record.learning_id)) {
        keywordMap[keyword].push(record.learning_id);
      }
    }
  }

  const index: LearningIndex = {
    project_id: projectId,
    generated_at: new Date().toISOString(),
    record_count: records.length,
    keyword_map: keywordMap,
  };

  await mkdir(storePath, { recursive: true });
  const indexPath = resolve(storePath, 'learnings-index.json');
  await writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');

  return index;
}

function extractKeywords(record: LearningRecord): string[] {
  const keywords = new Set<string>();

  // Add tags as keywords
  for (const tag of record.tags) {
    keywords.add(tag.toLowerCase());
  }

  // Add category as keyword
  keywords.add(record.category);

  // Extract significant words from content (simple tokenization)
  const words = record.content
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  for (const word of words) {
    keywords.add(word);
  }

  return Array.from(keywords);
}
