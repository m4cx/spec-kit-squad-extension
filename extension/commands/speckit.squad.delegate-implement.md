# speckit.squad.delegate-implement

## Purpose

Validates Squad readiness and builds a deterministic handoff payload from `tasks.md` before Squad implementation begins.

## When

`before_implement` hook — runs automatically before `/speckit.implement` delegates work to Squad.

## Flow

1. Run squad readiness check against the current project
2. Parse `tasks.md` to extract the full task manifest
3. Compute a deterministic `task_manifest_hash` for drift detection
4. Build the handoff payload with session ID, project ID, and ordered tasks
5. Validate the handoff payload against the implement session contract schema
6. Output the handoff JSON for Squad consumption

## Script Entrypoints

- **Bash**: `extension/scripts/bash/build-handoff-from-tasks.sh`
- **PowerShell**: `extension/scripts/powershell/build-handoff-from-tasks.ps1`

## Runtime Dependencies

- `extension/dist/analyzers/readiness/check-squad-readiness.js`
- `extension/dist/analyzers/handoff/build-handoff.js`
- `extension/dist/contracts/validators.js`

## Error Handling

- If Squad is not ready (`is_ready=false`), halt with actionable diagnostics
- If `tasks.md` is missing or has no parseable tasks, halt with guidance to run `/speckit.tasks`
- If handoff payload fails contract validation, halt with schema errors

## Output

JSON handoff payload conforming to `TaskHandoffPayload` schema, written to stdout.
