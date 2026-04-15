#!/usr/bin/env node

/**
 * Runtime entrypoint dispatcher for extension/dist/.
 * Scripts call: node extension/dist/analyzers/runtime/entrypoints.js <command>
 */

const command = process.argv[2];

async function main(): Promise<void> {
  switch (command) {
    case 'readiness': {
      const { checkSquadReadiness } = await import('../readiness/check-squad-readiness.js');
      const result = await checkSquadReadiness(process.cwd());
      console.log(JSON.stringify(result, null, 2));
      if (!result.is_ready) process.exitCode = 1;
      break;
    }
    case 'handoff': {
      const { buildHandoff } = await import('../handoff/build-handoff.js');
      const tasksPath = process.argv[3];
      if (!tasksPath) {
        console.error('Usage: entrypoints.js handoff <tasks.md path>');
        process.exitCode = 1;
        return;
      }
      const result = await buildHandoff(tasksPath, process.cwd());
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    case 'contracts': {
      const { validateAgainstBundledSchema } = await import('../../contracts/validators.js');
      const payloadPath = process.argv[3];
      if (!payloadPath) {
        console.error('Usage: entrypoints.js contracts <payload.json path>');
        process.exitCode = 1;
        return;
      }
      const { readFile } = await import('node:fs/promises');
      const data = JSON.parse(await readFile(payloadPath, 'utf-8'));
      const schemaName = process.argv[4] ?? 'implement-session.contract.json';
      const result = await validateAgainstBundledSchema(schemaName, data);
      console.log(JSON.stringify(result, null, 2));
      if (!result.valid) process.exitCode = 1;
      break;
    }
    case 'drift': {
      const { detectTaskDrift } = await import('../drift/detect-task-drift.js');
      const tasksPath = process.argv[3];
      const outcomePath = process.argv[4];
      if (!tasksPath || !outcomePath) {
        console.error('Usage: entrypoints.js drift <tasks.md path> <outcome.json path>');
        process.exitCode = 1;
        return;
      }
      const result = await detectTaskDrift(tasksPath, outcomePath);
      console.log(JSON.stringify(result, null, 2));
      if (result.drifted) process.exitCode = 1;
      break;
    }
    case 'normalize': {
      const { normalizeSessionOutcome } = await import('../outcomes/normalize-session-outcome.js');
      const rawPath = process.argv[3];
      if (!rawPath) {
        console.error('Usage: entrypoints.js normalize <raw-outcome.json path>');
        process.exitCode = 1;
        return;
      }
      const { readFile } = await import('node:fs/promises');
      const raw = JSON.parse(await readFile(rawPath, 'utf-8'));
      const result = normalizeSessionOutcome(raw);
      console.log(JSON.stringify(result, null, 2));
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Available: readiness, handoff, contracts, drift, normalize');
      process.exitCode = 1;
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
