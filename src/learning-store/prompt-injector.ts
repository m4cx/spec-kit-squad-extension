import { deriveProjectId } from './project-scope.js';
import { loadProjectLearnings, buildLearningDigest } from './scope-filter.js';

export interface PlanningContextPackage {
  project_id: string;
  generated_at: string;
  learning_digest: Array<{ category: string; summary: string; tags: string[] }>;
  source_sessions: string[];
}

/**
 * Build a planning context package for injection into /speckit.plan or /speckit.tasks.
 * Returns the package as JSON string for stdout output.
 */
export async function buildPlanningContext(repoRoot: string): Promise<PlanningContextPackage> {
  const projectId = deriveProjectId(repoRoot);
  const records = await loadProjectLearnings(repoRoot, projectId);

  const digest = buildLearningDigest(records);

  const sourceSessions = [...new Set(records.map((r) => r.session_id))];

  return {
    project_id: projectId,
    generated_at: new Date().toISOString(),
    learning_digest: digest,
    source_sessions: sourceSessions,
  };
}

/**
 * Format the planning context as a markdown-friendly injection block.
 */
export function formatContextForInjection(pkg: PlanningContextPackage): string {
  if (pkg.learning_digest.length === 0) {
    return ''; // No learnings to inject - continue without degradation
  }

  const lines: string[] = [
    '## Implementation Learnings (Auto-Injected)',
    '',
    `Project: ${pkg.project_id}`,
    `Source sessions: ${pkg.source_sessions.length}`,
    '',
  ];

  for (const item of pkg.learning_digest) {
    lines.push(`### ${item.category.charAt(0).toUpperCase() + item.category.slice(1)}s`);
    lines.push('');
    lines.push(item.summary);
    if (item.tags.length > 0) {
      lines.push(`Tags: ${item.tags.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
