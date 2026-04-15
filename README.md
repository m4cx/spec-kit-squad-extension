# spec-kit-squad-extension

A Spec-Kit extension that delegates `speckit.implement` orchestration to Squad, with structured learning capture and carry-forward into planning and task generation.

## Features

- **Squad-Delegated Implementation**: Builds deterministic handoff payloads from `tasks.md` and delegates to Squad without in-extension task routing
- **Learning Capture**: Persists structured implementation learnings to `.squad/squad-kit-memory/`
- **Planning Feedback**: Automatically injects project-scoped learnings into `/speckit.plan` and `/speckit.tasks` via `before_plan` and `before_tasks` hooks
- **Topology Support**: Works with both markdown-first and sdk-first Squad configurations
- **Contract Validation**: All payloads validated against JSON Schema contracts
- **Task Drift Detection**: Detects discrepancies between `tasks.md` and Squad outcomes

## Prerequisites

- Node.js 20+
- `specify` CLI installed with a Spec-Kit project
- `@bradygaster/squad-cli` on PATH
- Squad initialized (`.squad/` or `squad.config.ts`)

## Installation

```bash
npm install
npm run build
specify extension add --dev /path/to/this/extension
```

## Commands

| Command | Hook | Description |
|---------|------|-------------|
| `speckit.squad.delegate-implement` | `before_implement` | Validate readiness and build handoff payload |
| `speckit.squad.collect-outcome` | `after_implement` | Normalize outcomes and persist learnings |
| `speckit.squad.inject-plan-learnings` | `before_plan` | Inject learnings into planning context |
| `speckit.squad.inject-task-learnings` | `before_tasks` | Inject learnings into task generation |

## Verification

```bash
npm run validate:readiness   # Check Squad setup
npm run validate:contracts    # Validate payloads against schemas
npm run analyze:handoff       # Verify tasks.md handoff
npm run analyze:drift         # Detect task drift
npm run lint                  # Lint source
npm test                      # Run all tests
```

## Architecture

```
src/                    # TypeScript analyzers (compiled to extension/dist/)
  analyzers/            # Readiness, handoff, outcomes, drift detection
  learning-store/       # Learning persistence, indexing, prompt injection
  contracts/            # JSON Schema validators and bundled schemas
extension/              # Spec-Kit extension package
  commands/             # Markdown command entrypoints
  scripts/              # Cross-platform Bash/PowerShell scripts
  dist/                 # Compiled runtime (from src/)
tests/                  # Contract, integration, and unit tests
```

## License

See [LICENSE](LICENSE).
