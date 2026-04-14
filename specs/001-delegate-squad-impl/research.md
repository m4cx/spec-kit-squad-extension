# Research: Squad Delegation Extension for spec-kit

## Decision 1: Extension architecture and hook model

- Decision: Implement using Spec-Kit extension manifest + command/hook model, with hooks on `before_implement`, `after_implement`, `before_plan`, and `before_tasks`.
- Rationale: This is the native Spec-Kit extension path and aligns with `EXTENSION-DEVELOPMENT-GUIDE.md` validation and naming rules. It gives automatic lifecycle integration without patching Spec-Kit core behavior.
- Alternatives considered: A custom Python plugin layer was rejected because it bypasses standard extension packaging and would increase coupling to internals.

## Decision 2: Deterministic analysis layer

- Decision: Add deterministic analyzers in TypeScript/Node 20+ for squad readiness, outcome contract validation, task drift detection, and scoped learning indexing.
- Rationale: User requirement explicitly calls for a solution not based only on markdown input. Schema-backed analyzers produce machine-checkable outputs and reproducible diagnostics.
- Alternatives considered: Markdown-only checklists were rejected because they are not deterministic and cannot be consumed by automation reliably.

## Decision 3: Squad mode support strategy

- Decision: Support both Squad markdown-first and sdk-first definitions; for sdk-first (`squad.config.ts`), run `squad build` and then process generated `.squad/` artifacts through the same deterministic pipeline.
- Rationale: Markdown-first is currently the stable default, while sdk-first is useful but experimental. Converging both paths to `.squad/` artifacts keeps runtime logic simple and resilient.
- Alternatives considered: Requiring only markdown-first was rejected as too restrictive; requiring only sdk-first was rejected due Squad alpha volatility.

## Decision 4: Learning storage location and isolation

- Decision: Persist extension-owned learnings in `.squad/squad-kit-memory/` with project-scoped records (`project_id`) and append-only `learnings.jsonl` plus searchable index.
- Rationale: Keeps solution data out of `.specify/` while colocating with Squad team state. Project scope tags and read-time filters prevent cross-project bleed.
- Alternatives considered: `.specify/` storage was rejected by user requirement; a root-level custom folder was rejected because it fragments Squad-related state.

## Decision 5: Volatility handling for Squad alpha

- Decision: Version-gate parsers, support graceful degradation, and keep an explicit compatibility matrix for Squad CLI ranges.
- Rationale: Squad states alpha status and evolving interfaces; deterministic behavior requires controlled adaptation rather than hard failure on minor format shifts.
- Alternatives considered: Strict exact-version lock was rejected as too brittle; no version checks were rejected as too risky.
