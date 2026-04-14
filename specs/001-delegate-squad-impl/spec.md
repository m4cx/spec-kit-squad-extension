# Feature Specification: Squad Delegation Extension for spec-kit

**Feature Branch**: `001-delegate-squad-impl`  
**Created**: 2026-04-14  
**Status**: Draft  
**Input**: User description: "I want to create a github spec-kit extension that enables spec-kit (https://github.com/github/spec-kit) to during the speckit.implement command to delegate the implementation to the casted squad team. The Squad team is provided by https://github.com/bradygaster/squad. This should be possible for any kind of team setup in squad. Learnings the team made during implementation phase should also be regarded in planning during speckit.plan and speckit.tasks commands."

## Clarifications

### Session 2026-04-14

- Q: Which system owns task delegation and squad execution flow during `speckit.implement`? → A: Squad owns the full delegation and execution process; the extension only forwards context to Squad and reports resulting outcomes back to spec-kit.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Squad-Delegated Implementation (Priority: P1)

A developer runs `speckit.implement` on a project that has a squad team configured. Instead of a single agent executing all tasks, the extension invokes Squad with the implementation context, and Squad handles all delegation and execution internally. The extension only reports Squad's resulting outcomes back into the spec-kit workflow.

**Why this priority**: This is the core value proposition — without this, the entire extension has no purpose. All other stories build on this foundation.

**Independent Test**: Can be fully tested by configuring a squad team, defining tasks in `tasks.md`, and running `speckit.implement`. Delivers value as soon as Squad executes the task set and the extension returns Squad outcomes to spec-kit.

**Acceptance Scenarios**:

1. **Given** a project with a configured squad team and a `tasks.md` file with pending tasks, **When** the user runs `speckit.implement`, **Then** Squad performs delegation and execution internally and returns a complete session outcome.
2. **Given** a squad team with two specialized members (e.g., backend and frontend), **When** `speckit.implement` runs with mixed tasks, **Then** Squad determines internal routing according to its own team orchestration rules.
3. **Given** a Squad implementation session completes, **When** the extension receives the session outcome, **Then** it reports the aggregated results back into the spec-kit workflow.

---

### User Story 2 - Learning Capture and Carry-Forward (Priority: P2)

During implementation, squad members discover domain insights, technical constraints, architectural decisions, and other learnings. These learnings are captured and persisted as structured notes. When the developer subsequently runs `speckit.plan` or `speckit.tasks`, those accumulated learnings are automatically surfaced and incorporated into the planning output.

**Why this priority**: Without this, teams lose the institutional knowledge built during implementation and must rediscover the same things on every cycle. The feedback loop is what differentiates this extension from a simple delegation adapter.

**Independent Test**: Can be tested by completing a squad implementation session, then running `speckit.tasks` and verifying that the generated tasks reference or account for previously captured learnings (e.g., a constraint discovered by a squad member).

**Acceptance Scenarios**:

1. **Given** a squad member captures a learning during implementation (e.g., "the external API does not support batch requests"), **When** the user runs `speckit.plan` for a related feature, **Then** the plan reflects that constraint without requiring the user to re-enter it.
2. **Given** multiple squad members each capture learnings in a session, **When** the user runs `speckit.tasks`, **Then** the generated tasks account for all accumulated learnings from all squad members.
3. **Given** no learnings have been captured yet, **When** `speckit.plan` or `speckit.tasks` runs, **Then** the commands execute normally without errors or degraded output.

---

### User Story 3 - Any Squad Team Configuration Support (Priority: P3)

The extension works with any squad team configuration supported by the squad framework — whether the team has two members or ten, generalist or highly specialized roles. No code changes to the extension are required to support a different team topology.

**Why this priority**: Flexibility is a prerequisite for broad adoption. Without this, the extension would only work for one team structure and require forking for any other setup.

**Independent Test**: Can be tested by defining two structurally different squad configurations (e.g., a 2-member team vs. a 5-member team) and verifying that Squad handles execution correctly in both cases without extension code changes.

**Acceptance Scenarios**:

1. **Given** a squad team with a single generalist member, **When** `speckit.implement` runs, **Then** Squad executes all tasks through that team and returns completion results.
2. **Given** a squad team with five specialized members, **When** `speckit.implement` runs, **Then** Squad orchestrates task execution across its members according to its team setup.
3. **Given** the user updates the squad team configuration (e.g., adds a new member), **When** `speckit.implement` next runs, **Then** Squad uses the updated team automatically and the extension continues to only report final outcomes.

---

### Edge Cases

- What happens when no squad team configuration is found in the project? The command must fail gracefully with a clear, actionable error message.
- What happens when Squad reports a member/task failure? The extension must surface the failure details clearly in spec-kit output.
- What happens when Squad cannot resolve a task assignment internally? The extension must surface Squad's unresolved-assignment outcome and guidance.
- What happens when learnings from one project are accidentally available in another? Learnings must be scoped to the project they were captured in.
- What happens when a squad session is interrupted mid-run? Completed tasks must be preserved; incomplete tasks must be resumable.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST integrate with the spec-kit `speckit.implement` command lifecycle via the existing hook mechanism.
- **FR-002**: When `speckit.implement` executes, the extension MUST invoke Squad with the implementation context and let Squad own task delegation and execution.
- **FR-003**: The extension MUST NOT implement its own per-task member matching or assignment logic; orchestration is fully delegated to Squad.
- **FR-004**: The extension MUST support any squad team topology by relying on Squad's native team orchestration behavior without requiring extension code changes per configuration.
- **FR-005**: Squad members MUST be able to capture structured learnings during their assigned implementation tasks.
- **FR-006**: Captured learnings MUST be persisted in a project-scoped store that survives across spec-kit command invocations.
- **FR-007**: The `speckit.plan` command MUST have access to all accumulated project learnings when generating planning artifacts.
- **FR-008**: The `speckit.tasks` command MUST incorporate accumulated project learnings when generating task lists.
- **FR-009**: The extension MUST report Squad's implementation session outcomes back to the spec-kit implement workflow as a unified outcome.
- **FR-010**: When no squad configuration is present, the extension MUST fail with a clear error message that tells the user how to configure a squad team.
- **FR-011**: When Squad reports execution failures, the extension MUST surface those failures without suppressing Squad-provided detail.
- **FR-012**: Learnings MUST be scoped to the project in which they were captured and MUST NOT bleed into other projects.

### Key Entities

- **Squad Team**: A configured set of agents, sourced from the squad framework, defining member roles and specializations.
- **Squad Member**: An individual agent within the team, with a declared specialization and the ability to execute assigned tasks and capture learnings.
- **Task**: A unit of implementation work from `tasks.md` provided to Squad for internal orchestration.
- **Learning**: A structured insight, constraint, decision, or finding captured by a squad member during implementation, persisted for use in future planning.
- **Delegation Session**: A single run of `speckit.implement` where Squad performs orchestration and execution and returns consolidated outcomes.
- **Learning Store**: A project-scoped persistent store that accumulates learnings across delegation sessions.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All tasks defined in `tasks.md` are handled by Squad during a single `speckit.implement` run, with zero tasks silently skipped in the reported outcome.
- **SC-002**: Learnings captured during an implementation session are available to `speckit.plan` and `speckit.tasks` in the same project within the same run without any manual steps by the user.
- **SC-003**: The extension operates correctly with at least two structurally different squad configurations (e.g., a 1-member generalist team and a 3-member specialist team) without any extension code changes between runs.
- **SC-004**: When a squad member fails on a task, the failure is reported to the user with sufficient detail to act on it, within the same session output.
- **SC-005**: The end-to-end delegation flow (from `speckit.implement` invocation to aggregated results) adds no more than a proportional overhead compared to single-agent implementation for the same number of tasks.

---

## Assumptions

- The spec-kit extension hook mechanism supports `before_implement`, `after_implement`, `before_plan`, `before_tasks` (or equivalent) entry points that this extension can register with.
- The squad framework (https://github.com/bradygaster/squad) exposes a stable, documented interface to run end-to-end team orchestration and return session outcomes.
- Squad team configurations are stored within the project directory (e.g., a `.squad/` folder or equivalent as defined by the squad framework).
- The extension is installed as a spec-kit extension and requires both spec-kit and squad to be present in the environment.
- Learnings are stored in a human-readable format (e.g., Markdown or JSON) within the project's `.specify/` directory or a dedicated extension memory directory.
- Task-to-member matching and delegation decisions are performed by Squad; the extension does not perform routing decisions.
- Squad members are AI agents capable of receiving a task description and returning a result; the extension does not manage the internal execution model of squad members.
- Multi-project isolation of learnings is handled by storing them relative to the project root, not in a shared global location.
