# Data Model: Squad Delegation Extension for spec-kit

## Entity: SquadReadiness

- Purpose: Deterministic preflight result consumed by `before_implement`
- Fields:
  - `project_id` (string, required)
  - `detected_mode` (enum: `markdown-first` | `sdk-first`, required)
  - `squad_dir_exists` (boolean, required)
  - `team_file_path` (string, nullable)
  - `routing_file_path` (string, nullable)
  - `sdk_config_path` (string, nullable)
  - `issues` (array of `ReadinessIssue`, required)
  - `is_ready` (boolean, required)
- Validation:
  - `is_ready = false` if any issue severity is `error`
  - `detected_mode = sdk-first` requires `sdk_config_path` to exist

## Entity: ReadinessIssue

- Purpose: Actionable diagnostics for setup failures
- Fields:
  - `code` (string, required)
  - `severity` (enum: `error` | `warning`, required)
  - `message` (string, required)
  - `suggested_fix` (string, required)

## Entity: DelegationSession

- Purpose: One `speckit.implement` run delegated to Squad
- Fields:
  - `session_id` (string, required)
  - `project_id` (string, required)
  - `started_at` (ISO-8601 datetime, required)
  - `completed_at` (ISO-8601 datetime, nullable)
  - `input_tasks_count` (integer >= 0, required)
  - `squad_mode` (enum: `markdown-first` | `sdk-first`, required)
  - `status` (enum: `running` | `completed` | `failed` | `interrupted`, required)
  - `outcome` (`SquadOutcome`, nullable)

## Entity: SquadOutcome

- Purpose: Unified result reported back into spec-kit workflow
- Fields:
  - `session_id` (string, required)
  - `completed_tasks` (array of `TaskOutcome`, required)
  - `failed_tasks` (array of `TaskOutcome`, required)
  - `unassigned_tasks` (array of `TaskOutcome`, required)
  - `summary` (string, required)
  - `raw_log_refs` (array of string paths, required)

## Entity: TaskOutcome

- Purpose: Task-level accountability and drift detection
- Fields:
  - `task_id` (string, required)
  - `title` (string, required)
  - `assignee` (string, nullable)
  - `status` (enum: `completed` | `failed` | `unassigned` | `skipped`, required)
  - `details` (string, required)

## Entity: LearningRecord

- Purpose: Persisted learning captured during implementation
- Fields:
  - `learning_id` (string, required)
  - `project_id` (string, required)
  - `session_id` (string, required)
  - `captured_at` (ISO-8601 datetime, required)
  - `agent` (string, required)
  - `category` (enum: `constraint` | `decision` | `risk` | `pattern`, required)
  - `content` (string, required)
  - `tags` (array of string, required)
  - `source_ref` (string path, nullable)

## Entity: LearningIndex

- Purpose: Fast lookup for `before_plan` and `before_tasks`
- Fields:
  - `project_id` (string, required)
  - `generated_at` (ISO-8601 datetime, required)
  - `record_count` (integer >= 0, required)
  - `keyword_map` (object: keyword -> array of learning IDs, required)

## Relationships

- One `DelegationSession` has one optional `SquadOutcome`.
- One `DelegationSession` has many `LearningRecord` entries.
- One `project_id` has many `DelegationSession` records and many `LearningRecord` records.
- One `LearningIndex` summarizes many `LearningRecord` entries for a single `project_id`.

## State transitions

- `DelegationSession.status`: `running` -> `completed` | `failed` | `interrupted`
- `TaskOutcome.status`: `unassigned` may transition to `completed` or `failed` only in a later session (never mutates in-place for historical session snapshots).

## Storage mapping

- `LearningRecord` entries are append-only lines in `.squad/squad-kit-memory/learnings.jsonl`.
- `LearningIndex` persists in `.squad/squad-kit-memory/learnings-index.json`.
- Session audit lines persist in `.squad/squad-kit-memory/sessions.log`.
