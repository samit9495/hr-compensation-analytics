# Planning

> The single, curated narrative of how this Salary Management tool was
> planned, designed, and built. Reading these documents in order should
> let a reviewer reconstruct the project's engineering thinking without
> ever opening a single source file.

The raw, AI-generated plan files that drove each phase live in
[../../.cursor/plans/](../../.cursor/plans/) as an audit trail. The
documents in this folder are the polished, reviewer-facing distillations
of that planning work.

## Reading order

For a reviewer with 15 minutes:

1. [roadmap.md](roadmap.md) — chronological phases, dates, commit ranges
2. [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) — every
   non-obvious decision, with alternatives and costs
3. [ai-assisted-workflow.md](ai-assisted-workflow.md) — how Cursor's
   rules, skills, agents, and MCPs were used as intentional engineering
   infrastructure

For a reviewer going deep:

4. [implementation-phases.md](implementation-phases.md) — phase-by-phase
   TDD breakdown with micro-task tables
5. [backend-architecture.md](backend-architecture.md) — layering, models,
   error handling, logging
6. [frontend-architecture.md](frontend-architecture.md) — module map,
   state strategy, reusable abstractions
7. [analytics-strategy.md](analytics-strategy.md) — compa-ratio, range
   penetration, payroll burden, NTILE outliers
8. [seed-performance-strategy.md](seed-performance-strategy.md) — 10k
   seed in ~0.09 s + scalability projections
9. [ui-ux-decisions.md](ui-ux-decisions.md) — AnalyticsSection, InfoHint,
   SummaryList, Title-Case sweep
10. [testing-strategy.md](testing-strategy.md) — TDD discipline,
    coverage, manual scenarios, QA agent
11. [scalability-considerations.md](scalability-considerations.md) —
    10k → 50k → 100k → 1M progression

## Index

| Document | One-line purpose |
|---|---|
| [roadmap.md](roadmap.md) | Chronological phase narrative with commit ranges |
| [implementation-phases.md](implementation-phases.md) | Phase-by-phase TDD breakdown (micro-tasks) |
| [backend-architecture.md](backend-architecture.md) | Layered FastAPI + SQLAlchemy 2.x design |
| [frontend-architecture.md](frontend-architecture.md) | React + Vite + TanStack Query module map |
| [analytics-strategy.md](analytics-strategy.md) | Compa-ratio, range penetration, payroll, outliers |
| [seed-performance-strategy.md](seed-performance-strategy.md) | 10k seed strategy + measured numbers |
| [testing-strategy.md](testing-strategy.md) | TDD discipline, coverage, manual scenarios |
| [ui-ux-decisions.md](ui-ux-decisions.md) | Reusable UI primitives + Title Case sweep |
| [ai-assisted-workflow.md](ai-assisted-workflow.md) | Cursor rules, skills, agents, MCPs |
| [scalability-considerations.md](scalability-considerations.md) | Path from 10k to 1M employees |
| [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) | Every decision with alternatives and costs |

## Cross-references

- **Driving prompts** (verbatim) → [../prompts/driving-prompts.md](../prompts/driving-prompts.md)
- **Stitch + Council prompts** → [../prompts/README.md](../prompts/README.md)
- **Performance log** (shim) → [../performance.md](../performance.md) →
  [seed-performance-strategy.md](seed-performance-strategy.md)
- **Architecture overview** (shim) → [../architecture/README.md](../architecture/README.md)
  → [backend-architecture.md](backend-architecture.md) +
  [frontend-architecture.md](frontend-architecture.md)
- **Tradeoffs** (shim) → [../tradeoffs.md](../tradeoffs.md) →
  [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md)
- **Raw Cursor plans** → [../../.cursor/plans/](../../.cursor/plans/)
- **Manual test scenarios** → [../../tasks/manual-test-scenarios.md](../../tasks/manual-test-scenarios.md)

## How this folder is intended to be maintained

- One file per concern. ~80–150 lines each. No raw AI dumps.
- Every WHY is explicit. Every alternative considered is named.
- Cross-references use markdown relative links so they navigate on
  GitHub.
- New decisions land in [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md)
  first, then get summarized in the relevant per-concern document.
