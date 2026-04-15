# Quickstart and Usage Guide: Squad Delegation Extension for spec-kit

## 1. Prerequisites

- `specify` CLI installed and project initialized with Copilot
- Node.js 20+
- `@bradygaster/squad-cli` installed and available on `PATH`
- Squad initialized in the project (`.squad/` exists) or configured through `squad.config.ts`
- A Spec-Kit feature folder with `spec.md`, `plan.md`, and generated `tasks.md`

## 2. Install the extension

For local development installs:

```bash
specify extension add --dev /absolute/path/to/this/extension
specify extension list
```

Expected result: the extension is listed and registers lifecycle hooks for implementation, planning, and task generation.

## 3. Configure Squad for the current project

Use any Squad team topology supported by Squad. The extension does not require a fixed team shape.

Markdown-first setup:

```bash
squad status
```

SDK-first setup:

```bash
squad build
```

Expected result: Squad reports a valid team configuration or generates the `.squad/` artifacts the extension will inspect.

## 4. Validate readiness before implementation

Run the deterministic readiness check before the first delegated implementation run:

```bash
npm run validate:readiness
```

Expected result: JSON diagnostics with `is_ready=true`, or actionable `issues[]` telling the user what to fix, such as missing Squad configuration, missing generated artifacts, or unsupported runtime layout.

## 5. Generate implementation tasks

The extension uses `tasks.md` as the only handoff source for Squad. Generate or refresh tasks first:

```bash
/speckit.tasks
```

Expected result: the current feature folder contains an up-to-date `tasks.md` that reflects the latest plan and any previously captured learnings.

## 6. Run delegated implementation

Execute implementation from the project with Squad configured:

```bash
/speckit.implement
```

What happens during the run:

- `before_implement` validates Squad state and builds a deterministic handoff payload from `tasks.md`
- the extension passes the handoff payload to Squad without doing any in-extension task routing
- Squad owns delegation and execution across the configured team
- `after_implement` normalizes Squad outcomes into a contract-compliant session result
- learnings are appended to `.squad/squad-kit-memory/learnings.jsonl`

## 7. Reuse implementation learnings in planning

After one or more implementation sessions, run planning commands normally:

```bash
/speckit.plan <arguments>
/speckit.tasks
```

Expected result:

- `before_plan` loads project-scoped learnings and injects relevant constraints and decisions into planning context
- `before_tasks` loads the same project-scoped learning digest before task generation
- project isolation is enforced through `project_id` filtering so learnings do not bleed across repositories

## 8. Inspect outputs and stored artifacts

Users should expect these extension-owned artifacts after delegated implementation:

- `.squad/squad-kit-memory/learnings.jsonl` for append-only learning records
- `.squad/squad-kit-memory/learnings-index.json` for lookup acceleration during plan/tasks hooks
- `.squad/squad-kit-memory/sessions.log` for session audit history
- contract-compliant implement session output matching `contracts/implement-session.contract.json`

## 9. Troubleshooting

If no Squad team configuration is found:

- run `squad status` or `squad build`
- verify `.squad/` or `squad.config.ts` exists in the project
- rerun `npm run validate:readiness`

If implementation fails:

- inspect the normalized session outcome for `failed_tasks` or `unassigned_tasks`
- review referenced Squad logs in `raw_log_refs`
- fix the underlying Squad or task-definition issue, then rerun `/speckit.implement`

If learnings are not appearing in plan or tasks output:

- verify `.squad/squad-kit-memory/learnings.jsonl` contains records for the current `project_id`
- rerun contract validation and drift checks
- rerun `/speckit.plan` or `/speckit.tasks` after confirming the previous implementation session completed successfully

## 10. Verification commands

Use these checks to verify the extension behavior end to end:

```bash
npm run analyze:handoff
npm run validate:contracts
npm run analyze:drift
npm run lint
npm test
```

Expected checks:

- `tasks.md` is present and parseable for the current feature
- `task_manifest_hash` in session output matches input `tasks.md`
- all handed-off task IDs are represented in the outcome (`completed`, `failed`, or `unassigned`)
- implement session output conforms to `contracts/implement-session.contract.json`
- learning records conform to `contracts/learning-record.schema.json`
- referenced runtime entrypoints exist under `extension/dist/`
