# speckit.squad.collect-outcome

## Purpose

Validates and normalizes Squad implementation outcomes into a contract-compliant session result, then persists learnings.

## When

`after_implement` hook — runs automatically after Squad completes implementation work.

## Flow

1. Read raw Squad outcome from the session output
2. Normalize task statuses and categorize into completed/failed/unassigned
3. Validate the normalized outcome against `implement-session.contract.json`
4. Append structured learning records to `.squad/squad-kit-memory/learnings.jsonl`
5. Update the learning index at `.squad/squad-kit-memory/learnings-index.json`
6. Log session summary to `.squad/squad-kit-memory/sessions.log`
7. Output the validated, normalized session outcome

## Script Entrypoints

- **Bash**: `extension/scripts/bash/collect-learnings.sh`
- **PowerShell**: `extension/scripts/powershell/collect-learnings.ps1`

## Runtime Dependencies

- `extension/dist/analyzers/outcomes/normalize-session-outcome.js`
- `extension/dist/contracts/validators.js`
- `extension/dist/learning-store/writer.js`
- `extension/dist/learning-store/indexer.js`

## Error Handling

- If raw outcome is missing or unparseable, output error with guidance
- If normalized outcome fails contract validation, output schema errors
- If learning store write fails, warn but do not block outcome reporting

## Output

JSON session outcome conforming to `implement-session.contract.json`, written to stdout.
