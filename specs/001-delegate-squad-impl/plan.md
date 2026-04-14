# Implementation Plan: Squad Delegation Extension for spec-kit

**Branch**: `001-delegate-squad-impl` | **Date**: 2026-04-14 | **Spec**: `/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/specs/001-delegate-squad-impl/spec.md`
**Input**: Feature specification from `/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/specs/001-delegate-squad-impl/spec.md`

## Summary

Build a Spec-Kit extension that delegates `speckit.implement` orchestration to Squad while preserving Spec-Kit lifecycle compatibility and feeding implementation learnings into `speckit.plan` and `speckit.tasks`. The solution follows the Spec-Kit extension guide command/hook model, but adds deterministic analyzers (TypeScript/Node 20+) for readiness validation, outcome verification, task drift detection, and project-scoped learning indexing. Extension source remains outside `.specify/` in this repository; only installed runtime artifacts are placed by Spec-Kit during installation.

## Technical Context

**Language/Version**: Markdown command surface, Bash 4+/PowerShell 7+ scripts, TypeScript on Node.js 20+ for deterministic analyzers  
**Primary Dependencies**: `specify-cli` extension hooks, `@bradygaster/squad-cli`, optional `@bradygaster/squad-sdk` shape support (`squad.config.ts` + `squad build`), JSON Schema validation tooling for contract files  
**Storage**: Project-local `.squad/squad-kit-memory/` (`learnings.jsonl`, `learnings-index.json`, `sessions.log`)  
**Testing**: `npm test`, `npm run lint`, contract-schema validation tests, cross-platform script smoke tests  
**Target Platform**: macOS/Linux/Windows developer environments running Spec-Kit + Copilot + Squad
**Project Type**: Spec-Kit extension package with deterministic analysis helper modules  
**Performance Goals**: Readiness + contract validation completes in <=2s for <=500 task entries; learning index rebuild <=3s for <=10k learning records  
**Constraints**: No extension-owned planning memory in `.specify/`; no custom task routing logic in extension; graceful failure when Squad configuration is missing; support markdown-first and sdk-first Squad team definitions  
**Scale/Scope**: Single extension repository; one delegated implementation session at a time; supports 1-member through N-member Squad topologies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file at `/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/.specify/memory/constitution.md` is still template placeholders (`[PRINCIPLE_*]`) and does not define enforceable rules.
- Gate result (pre-research): **PASS with warning** (no actionable constitutional constraints to violate).
- Gate result (post-design): **PASS with warning** (design cannot be evaluated against undefined principles).

## Project Structure

### Documentation (this feature)

```text
/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/specs/001-delegate-squad-impl/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── implement-session.contract.json
│   └── learning-record.schema.json
└── tasks.md                          # Generated in /speckit.tasks (Phase 2)
```

### Source Code (repository root)

```text
/Users/maik/workspace/private/m4cx/spec-kit-squad-extension/
├── extension/
│   ├── extension.yml
│   ├── commands/
│   │   ├── speckit.squad.delegate-implement.md
│   │   ├── speckit.squad.inject-plan-learnings.md
│   │   └── speckit.squad.inject-task-learnings.md
│   └── scripts/
│       ├── bash/
│       │   ├── validate-squad-readiness.sh
│       │   ├── run-squad-implement.sh
│       │   └── collect-learnings.sh
│       └── powershell/
│           ├── validate-squad-readiness.ps1
│           ├── run-squad-implement.ps1
│           └── collect-learnings.ps1
├── src/
│   ├── analyzers/
│   │   ├── readiness/
│   │   ├── outcomes/
│   │   └── drift/
│   ├── learning-store/
│   │   ├── indexer.ts
│   │   └── scope-filter.ts
│   └── contracts/
│       ├── validators.ts
│       └── schemas/
└── tests/
    ├── contract/
    ├── integration/
    └── unit/
```

**Structure Decision**: Use a split architecture where extension command/hook assets live in `extension/` (Spec-Kit extension-dev-guide aligned) and deterministic logic lives in typed modules under `src/`. Runtime learning data is written to `.squad/squad-kit-memory/` (project-scoped, outside `.specify/`), while this repository stores only extension source and contracts.

## Complexity Tracking

1. Violation: Dual stack (Markdown+scripts and TypeScript analyzers).
2. Why needed: Need both Spec-Kit-native hook integration and machine-checkable deterministic analysis.
3. Simpler alternative rejected because: Markdown-only hooks cannot provide robust schema validation, drift detection, and reproducible outcome checks.
