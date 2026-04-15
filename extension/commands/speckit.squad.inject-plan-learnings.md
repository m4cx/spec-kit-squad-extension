# speckit.squad.inject-plan-learnings

## Purpose

Loads project-scoped implementation learnings and injects relevant constraints and decisions into `/speckit.plan` context.

## When

`before_plan` hook — runs automatically before `/speckit.plan` to provide learning context.

## Flow

1. Derive project ID from the current repository root
2. Load project-scoped learnings from `.squad/squad-kit-memory/learnings.jsonl`
3. Filter for the current project
4. Build a categorized learning digest (constraints, decisions, risks, patterns)
5. Format as a planning context injection block
6. Output for insertion into planning context

## Script Entrypoints

- **Bash**: `extension/scripts/bash/inject-plan-learnings.sh`
- **PowerShell**: `extension/scripts/powershell/inject-plan-learnings.ps1`

## Graceful Degradation

If no learnings exist for the project, the hook outputs nothing and `/speckit.plan` continues normally.
