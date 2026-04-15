# Tasks: Squad Delegation Extension for spec-kit

**Input**: Design documents from `/specs/001-delegate-squad-impl/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize extension packaging, runtime build wiring, and baseline repository layout.

- [X] T001 Create extension command and script directories in extension/commands, extension/scripts/bash, and extension/scripts/powershell
- [X] T002 Initialize Node.js project metadata and scripts in package.json
- [X] T003 Configure TypeScript compiler output to extension/dist in tsconfig.json
- [X] T004 [P] Configure extension packaging excludes/includes for compiled runtime in .extensionignore
- [X] T005 [P] Create deployment artifact manifest scaffold in deployment/manifest.txt
- [X] T006 [P] Add baseline test folder structure and placeholders in tests/unit, tests/integration, and tests/contract

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared deterministic primitives required by all user stories.

**CRITICAL**: Complete this phase before any user story implementation.

- [X] T007 Implement shared JSON schema loader and validator helpers in src/contracts/validators.ts
- [X] T008 [P] Add contract schema copies for runtime validation in src/contracts/schemas/implement-session.contract.json and src/contracts/schemas/learning-record.schema.json
- [X] T009 Implement deterministic task-manifest hashing utility in src/analyzers/handoff/task-manifest.ts
- [X] T010 [P] Implement project identity and path normalization helpers in src/learning-store/project-scope.ts
- [X] T011 Implement extension runtime entrypoint map consumed by scripts in src/analyzers/runtime/entrypoints.ts
- [X] T012 [P] Wire npm scripts for lint, test, readiness, handoff, contracts, and drift checks in package.json
- [X] T013 Add cross-platform script invocation helpers for bash and PowerShell parity in extension/scripts/bash/_common.sh and extension/scripts/powershell/Common.ps1

**Checkpoint**: Foundational runtime and validation primitives are ready for story work.

---

## Phase 3: User Story 1 - Squad-Delegated Implementation (Priority: P1) MVP

**Goal**: Delegate speckit.implement execution to Squad using tasks.md as the canonical handoff and return unified outcomes.

**Independent Test**: With a valid squad team and tasks.md, running speckit.implement produces a contract-valid aggregated session outcome where every input task is represented.

### Tests for User Story 1

- [X] T014 [P] [US1] Add contract validation test for implement session payloads in tests/contract/implement-session.contract.test.ts
- [X] T015 [P] [US1] Add integration test for before_implement handoff generation from tasks.md in tests/integration/before-implement.handoff.test.ts
- [X] T016 [P] [US1] Add integration test for after_implement outcome normalization in tests/integration/after-implement.outcome.test.ts

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement squad readiness analyzer for markdown-first and sdk-first detection in src/analyzers/readiness/check-squad-readiness.ts
- [X] T018 [P] [US1] Implement tasks.md parser for checklist task extraction in src/analyzers/handoff/parse-tasks-md.ts
- [X] T019 [US1] Implement deterministic handoff payload builder in src/analyzers/handoff/build-handoff.ts
- [X] T020 [US1] Implement Squad session outcome normalizer and summary composer in src/analyzers/outcomes/normalize-session-outcome.ts
- [X] T021 [US1] Add before_implement command entrypoint to validate readiness and emit handoff JSON in extension/commands/speckit.squad.delegate-implement.md
- [X] T022 [US1] Add after_implement command entrypoint to validate and publish unified outcome in extension/commands/speckit.squad.collect-outcome.md
- [X] T023 [US1] Implement bash before_implement orchestration script in extension/scripts/bash/build-handoff-from-tasks.sh
- [X] T024 [US1] Implement PowerShell before_implement orchestration script in extension/scripts/powershell/build-handoff-from-tasks.ps1
- [X] T025 [US1] Implement bash Squad runner script without in-extension routing logic in extension/scripts/bash/run-squad-implement.sh
- [X] T026 [US1] Implement PowerShell Squad runner script without in-extension routing logic in extension/scripts/powershell/run-squad-implement.ps1
- [X] T027 [US1] Implement bash outcome collection script with contract validation in extension/scripts/bash/collect-learnings.sh
- [X] T028 [US1] Implement PowerShell outcome collection script with contract validation in extension/scripts/powershell/collect-learnings.ps1

**Checkpoint**: speckit.implement delegation path works end-to-end with contract-valid outcomes.

---

## Phase 4: User Story 2 - Learning Capture and Carry-Forward (Priority: P2)

**Goal**: Persist structured implementation learnings and inject project-scoped digests into speckit.plan and speckit.tasks.

**Independent Test**: After one delegated implementation session with learnings, subsequent speckit.plan and speckit.tasks runs include those constraints/decisions automatically for the same project.

### Tests for User Story 2

- [X] T029 [P] [US2] Add contract validation test for learning record schema in tests/contract/learning-record.schema.test.ts
- [X] T030 [P] [US2] Add integration test for project-scoped learning persistence and retrieval in tests/integration/learning-store.scope.test.ts
- [X] T031 [P] [US2] Add integration test for before_plan and before_tasks prompt injection output in tests/integration/learning-injection.hooks.test.ts

### Implementation for User Story 2

- [X] T032 [P] [US2] Implement append-only learning record writer for .squad/squad-kit-memory in src/learning-store/writer.ts
- [X] T033 [P] [US2] Implement learning index builder and keyword map generation in src/learning-store/indexer.ts
- [X] T034 [US2] Implement project-scoped learning filter and digest assembler in src/learning-store/scope-filter.ts
- [X] T035 [US2] Implement planning context package builder for plan/tasks hooks in src/learning-store/prompt-injector.ts
- [X] T036 [US2] Add before_plan learning injection command in extension/commands/speckit.squad.inject-plan-learnings.md
- [X] T037 [US2] Add before_tasks learning injection command in extension/commands/speckit.squad.inject-task-learnings.md
- [X] T038 [US2] Implement bash plan-learning injector script in extension/scripts/bash/inject-plan-learnings.sh
- [X] T039 [US2] Implement PowerShell plan-learning injector script in extension/scripts/powershell/inject-plan-learnings.ps1
- [X] T040 [US2] Implement bash task-learning injector script in extension/scripts/bash/inject-task-learnings.sh
- [X] T041 [US2] Implement PowerShell task-learning injector script in extension/scripts/powershell/inject-task-learnings.ps1

**Checkpoint**: Learnings persist per project and are automatically reused in planning and task generation.

---

## Phase 5: User Story 3 - Any Squad Team Configuration Support (Priority: P3)

**Goal**: Support any Squad team topology and both markdown-first/sdk-first configuration flows without extension code changes.

**Independent Test**: The same extension build runs successfully with two materially different team topologies (single-member and multi-specialist) while preserving delegation behavior and reporting.

### Tests for User Story 3

- [X] T042 [P] [US3] Add integration test for markdown-first team topology readiness and execution path in tests/integration/topology-markdown-first.test.ts
- [X] T043 [P] [US3] Add integration test for sdk-first squad build artifact path in tests/integration/topology-sdk-first.test.ts
- [X] T044 [P] [US3] Add integration test asserting no extension-side task assignment behavior in tests/integration/no-extension-routing.test.ts

### Implementation for User Story 3

- [X] T045 [P] [US3] Implement squad mode adapter that converges markdown-first and sdk-first artifacts in src/analyzers/readiness/mode-adapter.ts
- [X] T046 [US3] Implement Squad compatibility guardrails and actionable diagnostics in src/analyzers/readiness/compatibility-matrix.ts
- [X] T047 [US3] Implement task drift detection between tasks.md and Squad outcome in src/analyzers/drift/detect-task-drift.ts
- [X] T048 [US3] Add bash readiness validation script for topology-agnostic checks in extension/scripts/bash/validate-squad-readiness.sh
- [X] T049 [US3] Add PowerShell readiness validation script for topology-agnostic checks in extension/scripts/powershell/validate-squad-readiness.ps1
- [X] T050 [US3] Wire extension hook registrations for before_implement, after_implement, before_plan, and before_tasks in extension/extension.yml

**Checkpoint**: Extension supports heterogeneous Squad team setups with deterministic diagnostics and no routing code changes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs, packaging confidence, and end-to-end verification.

- [X] T051 [P] Update installation, flow, and troubleshooting guidance in specs/001-delegate-squad-impl/quickstart.md
- [X] T052 [P] Add implementation notes and command references in README.md
- [X] T053 Validate deployment manifest includes extension/dist runtime assets in deployment/manifest.txt
- [X] T054 [P] Add end-to-end delegation smoke test script in tests/integration/delegation-smoke.test.ts
- [X] T055 Run lint, unit, contract, and integration suites via npm run lint and npm test and capture results in specs/001-delegate-squad-impl/checklists/requirements.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) has no dependencies.
- Foundational (Phase 2) depends on Setup and blocks all user stories.
- User Story phases (Phase 3-5) depend on Foundational completion.
- Polish (Phase 6) depends on completion of the desired user stories.

### User Story Dependencies

- US1 (P1) can start immediately after Foundational and defines the MVP path.
- US2 (P2) depends on US1 outcome artifacts to persist and inject learnings.
- US3 (P3) depends on US1 readiness and outcome flow, and may run alongside late US2 tasks once shared primitives are stable.

### Dependency Graph

- Phase 1 -> Phase 2 -> US1 -> US2 -> Polish
- Phase 1 -> Phase 2 -> US1 -> US3 -> Polish
- US2 and US3 can overlap after US1 checkpoint if team capacity allows.

## Parallel Execution Examples

### User Story 1

Run T014, T015, and T016 in parallel, then run T017 and T018 in parallel before converging on T019-T022.

### User Story 2

Run T029, T030, and T031 in parallel, then run T032 and T033 in parallel before converging on T034-T041.

### User Story 3

Run T042, T043, and T044 in parallel, then run T045 and T048/T049 in parallel before converging on T046, T047, and T050.

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete all US1 tasks (Phase 3).
3. Validate delegated implementation flow and session outcome reporting.

### Incremental Delivery

1. Deliver MVP with US1.
2. Add learning capture/injection with US2.
3. Add topology breadth and drift safeguards with US3.
4. Finish with polish and full verification.

### Parallel Team Strategy

1. One developer owns shared runtime/build setup (Phase 1-2).
2. After US1 checkpoint, one developer drives US2 while another drives US3.
3. Re-converge for Phase 6 verification and documentation.

## Notes

- All tasks follow the required checklist format: checkbox, task ID, optional [P], optional [US#], and explicit file path.
- [P] indicates tasks that touch separate files and can proceed without incomplete-task dependencies.
- Each user story phase contains an independent test criterion for standalone validation.