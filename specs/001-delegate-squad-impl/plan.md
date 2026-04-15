# Implementation Plan: Squad Delegation Extension for spec-kit

**Branch**: `001-delegate-squad-impl` | **Date**: 2026-04-15 | **Spec**: `/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/specs/001-delegate-squad-impl/spec.md`
**Input**: Feature specification from `/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/specs/001-delegate-squad-impl/spec.md`

## Summary

Build a Spec-Kit extension that delegates `speckit.implement` orchestration to Squad using `tasks.md` as the handoff source of truth. Squad session outcomes and learnings are normalized into deterministic artifacts and automatically injected into `/speckit.plan` and `/speckit.tasks` via `before_plan` and `before_tasks` hooks. The implementation follows the Spec-Kit extension development guide, while adding TypeScript analyzers for reproducible validation, drift detection, and scoped learning retrieval. Planning artifacts also include markdown usage documentation for extension users, covering installation, configuration, command flow, and troubleshooting.

## Technical Context

**Language/Version**: Markdown command surface, Bash 4+/PowerShell 7+ scripts, TypeScript on Node.js 20+ for deterministic analyzers  
**Primary Dependencies**: Spec-Kit extension hooks (`before_implement`, `after_implement`, `before_plan`, `before_tasks`), `@bradygaster/squad-cli`, optional `@bradygaster/squad-sdk` shape support (`squad.config.ts` + `squad build`), JSON Schema validation tooling for contract files  
**Storage**: Project-local `.squad/squad-kit-memory/` (`learnings.jsonl`, `learnings-index.json`, `sessions.log`)  
**Testing**: `npm test`, `npm run lint`, contract validation, and script integration checks for Bash/PowerShell parity  
**Target Platform**: macOS/Linux/Windows developer environments using Spec-Kit + Copilot + Squad
**Project Type**: Spec-Kit extension package with deterministic analysis modules  
**Performance Goals**: Parse and validate `tasks.md` handoff <=2s for <=500 tasks; learning lookup for plan/tasks <=2s for <=10k learning records  
**Constraints**: Handoff must be based on `tasks.md`; extension must not implement custom task routing; learnings must be injected into `/speckit.plan` and `/speckit.tasks`; extension-owned planning memory must stay outside `.specify/`; runtime entrypoints must be compiled into `extension/dist/`, script-linked, and present in the shipped extension artifact  
**Scale/Scope**: One feature delegation session at a time; supports 1-member to N-member Squad team topologies without extension code changes

## TypeScript Integration Steps

1. Source ownership: Keep analyzer sources in `src/` and never execute TypeScript directly from hook scripts.
2. Build step: Compile TypeScript with Node.js 20+ tooling into `extension/dist/` using project-local `package.json` and `tsconfig.json`.
3. Runtime handoff: `extension/scripts/bash/*.sh` and `extension/scripts/powershell/*.ps1` execute Node entrypoints from `extension/dist/` only.
4. Script linking rule: All script entrypoint paths must resolve from script location to sibling `extension/dist/` runtime assets with deterministic, cross-platform relative path handling (no hardcoded absolute paths).
5. Packaging rule: Distribution must ship compiled runtime inside `extension/dist/`; it must not rely on build-at-install behavior from `specify extension add`.
6. Deployment completeness rule: Packaging validation must fail if referenced `extension/dist/` entrypoints are missing or if `extension/dist/` is omitted from release artifact.
7. Extension ignore rule: `.extensionignore` must exclude TypeScript source/test/dev artifacts but explicitly keep required runtime files in `extension/dist/`.
8. Quality gate: Run `npm run lint`, `npm test`, and contract validation against compiled output before local dev install and release packaging.

## Handoff and Learning Feedback Flow

1. `before_implement`: Parse `tasks.md`, validate schema/order, and create a deterministic handoff payload (`session_id`, `project_id`, `task_manifest_hash`, `tasks[]`) for Squad.
2. Squad execution: Extension passes handoff payload to Squad without member assignment logic in the extension.
3. `after_implement`: Normalize Squad output into contract-compliant outcome + learning records and append to `.squad/squad-kit-memory/`.
4. `before_plan`: Load project-scoped learning digest and inject relevant constraints/decisions into `/speckit.plan` context.
5. `before_tasks`: Load project-scoped learning digest and inject implementation-derived constraints into `/speckit.tasks` generation context.
6. Guardrail: If `tasks.md` is missing/invalid, handoff stops with actionable diagnostics; if no learnings exist, plan/tasks continue without degradation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file at `/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/.specify/memory/constitution.md` is still template placeholders (`[PRINCIPLE_*]`) and does not define enforceable rules.
- Gate result (pre-research): PASS with warning (no actionable constitutional constraints to violate).
- Gate result (post-design): PASS with warning (design cannot be evaluated against undefined principles).

## Project Structure

### Documentation (this feature)

```text
/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/specs/001-delegate-squad-impl/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md                     # Quickstart plus user-facing usage guide for the extension
├── contracts/
│   ├── implement-session.contract.json
│   └── learning-record.schema.json
└── tasks.md                          # Handoff source for /speckit.implement (generated in /speckit.tasks)
```

### Source Code (repository root)

```text
/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/
├── package.json
├── tsconfig.json
├── .extensionignore
├── extension/
│   ├── extension.yml
│   ├── commands/
│   │   ├── speckit.squad.delegate-implement.md
│   │   ├── speckit.squad.inject-plan-learnings.md
│   │   └── speckit.squad.inject-task-learnings.md
│   └── scripts/
│       ├── bash/
│       │   ├── validate-squad-readiness.sh
│       │   ├── build-handoff-from-tasks.sh
│       │   ├── run-squad-implement.sh
│       │   ├── collect-learnings.sh
│       │   ├── inject-plan-learnings.sh
│       │   └── inject-task-learnings.sh
│       └── powershell/
│           ├── validate-squad-readiness.ps1
│           ├── build-handoff-from-tasks.ps1
│           ├── run-squad-implement.ps1
│           ├── collect-learnings.ps1
│           ├── inject-plan-learnings.ps1
│           └── inject-task-learnings.ps1
│   ├── dist/
│   │   ├── analyzers/
│   │   ├── learning-store/
│   │   └── contracts/
├── src/
│   ├── analyzers/
│   │   ├── readiness/
│   │   ├── handoff/
│   │   ├── outcomes/
│   │   └── drift/
│   ├── learning-store/
│   │   ├── indexer.ts
│   │   ├── scope-filter.ts
│   │   └── prompt-injector.ts
│   └── contracts/
│       ├── validators.ts
│       └── schemas/
├── deployment/
│   └── manifest.txt                 # Must include extension/dist/** and referenced script/runtime assets
└── tests/
    ├── contract/
    ├── integration/
    └── unit/
```

**Structure Decision**: Use a split architecture where extension command/hook assets and compiled runtime both live in `extension/` (Spec-Kit extension-dev-guide aligned), deterministic logic is authored in `src/`, and runtime execution consumes compiled JavaScript from `extension/dist/` via explicit script entrypoint mapping in both Bash and PowerShell. `tasks.md` is the canonical handoff input to Squad implementation, and project-scoped learnings from Squad sessions are fed back into `/speckit.plan` and `/speckit.tasks` through dedicated pre-hooks.

## Complexity Tracking

1. Violation: Dual stack (Markdown/scripts + TypeScript analyzers).
2. Why needed: Need Spec-Kit-native hook integration and machine-checkable, deterministic processing of `tasks.md` handoff and learning feedback.
3. Simpler alternative rejected because: Markdown-only logic cannot reliably validate handoff integrity, provide stable cross-platform parsing, or enforce repeatable learning injection.
