# Quickstart: Squad Delegation Extension for spec-kit

## 1. Prerequisites

- `specify` CLI installed and project initialized with Copilot
- Node.js 20+
- `@bradygaster/squad-cli` installed
- Squad initialized in project (`.squad/` exists)

## 2. Install extension locally (dev flow)

```bash
specify extension add --dev /absolute/path/to/this/extension
specify extension list
```

Expected: extension is listed with registered hooks for implement/plan/tasks lifecycle integration.

## 3. Validate Squad readiness deterministically

Run readiness checks before implementation:

```bash
# markdown-first
squad status

# sdk-first (if squad.config.ts is used)
squad build
```

Then run extension analyzer entrypoint (example):

```bash
npm run validate:readiness
```

Expected output: JSON diagnostics including `is_ready=true` or actionable `issues[]`.

## 4. Run delegated implementation

```bash
/speckit.implement
```

Expected behavior:

- `before_implement` hook validates Squad state and builds deterministic handoff payload from `tasks.md`
- extension delegates run to Squad (no in-extension task routing)
- `after_implement` hook normalizes outcome into contract-compliant JSON
- learning records are persisted to `.squad/squad-kit-memory/learnings.jsonl`

## 5. Inject learnings into plan/tasks phases

```bash
/speckit.plan <arguments>
/speckit.tasks
```

Expected behavior:

- `before_plan` and `before_tasks` hooks load project-scoped learnings and prepare prompt-safe learning digest
- deterministic filters enforce `project_id` isolation
- generated artifacts include surfaced constraints/decisions from prior implementation sessions

## 6. Handoff integrity checks

```bash
npm run analyze:handoff
```

Expected checks:

- `tasks.md` is present and parseable for current feature
- `task_manifest_hash` in session output matches input `tasks.md`
- all handed-off task IDs are represented in outcome (`completed`, `failed`, or `unassigned`)

## 7. Verify contracts and drift checks

```bash
npm test
npm run lint
npm run validate:contracts
npm run analyze:drift
```

Expected checks:

- implement session output conforms to `contracts/implement-session.contract.json`
- learning records conform to `contracts/learning-record.schema.json`
- all tasks in `tasks.md` are accounted for in session outcome (no silent drops)
