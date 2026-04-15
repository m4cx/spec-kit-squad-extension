# speckit.squad.inject-task-learnings

## Purpose

Loads project-scoped implementation learnings and injects implementation-derived constraints into `/speckit.tasks` generation context.

## When

`before_tasks` hook — runs automatically before `/speckit.tasks` to provide learning context.

## Flow

1. Derive project ID from the current repository root
2. Load project-scoped learnings from `.squad/squad-kit-memory/learnings.jsonl`
3. Filter for the current project
4. Build a categorized learning digest (constraints, decisions, risks, patterns)
5. Format as a task generation context injection block
6. Output for insertion into task generation context

## Script Entrypoints

- **Bash**: `extension/scripts/bash/inject-task-learnings.sh`
- **PowerShell**: `extension/scripts/powershell/inject-task-learnings.ps1`

## Graceful Degradation

If no learnings exist for the project, the hook outputs nothing and `/speckit.tasks` continues normally.
