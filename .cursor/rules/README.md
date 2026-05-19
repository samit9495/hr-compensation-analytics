# Incubyte Cursor Rules

Project-specific rules for the Salary-Management-Assessment Incubyte assessment.

## Related project AI assets

| Location | Purpose |
|----------|---------|
| [`../skills/`](../skills/) | Task-focused **skills** (`SKILL.md` per folder) aligned with these rules |
| [`../agents/`](../agents/) | **Agent personas** (code reviewer, QA automation) |
| [`../../AGENTS.md`](../../AGENTS.md) | Project overview, stack, agent roles |
| [`../../tasks/lessons.md`](../../tasks/lessons.md) | Team **lessons learned** (promote stable items into rules/skills) |
| [`../../artifacts/`](../../artifacts/) | PDF-required deliverables: planning, design, prompts, trade-offs, perf |

## Always-Apply Rules (read first, top-to-bottom)

### Craftsmanship — THE values Incubyte hires on

| Rule | Purpose |
|------|---------|
| **incubyte-tdd-discipline** | Uncle Bob's Three Laws of TDD. The primary rule. Failing test before any production code. |
| **incubyte-craftsmanship** | SOLID, Clean Code, Simple Design, YAGNI/DRY/KISS — sourced from `incubyte.co/inspiration`. |
| **incubyte-commit-hygiene** | Conventional Commits; one TDD step per commit; the git log tells the story. |

### Tech conventions

| Rule | Purpose |
|------|---------|
| **incubyte-fastapi-core** | Stack (FastAPI + SQLAlchemy 2 + Pydantic v2 + SQLite); layered architecture (routes → services → repositories → models) |
| **incubyte-error-handling** | Domain exceptions, FastAPI exception handlers, structured error payloads |
| **incubyte-code-quality** | Concrete smell catalog and edge-case guards (companion to craftsmanship) |
| **incubyte-testing** | pytest + Vitest, TDD-first, ≥ 90% coverage on changed modules, characterization tests before legacy refactor |

### AI behavior

| Rule | Purpose |
|------|---------|
| **ai-workflow** | Planning, task tracking via `tasks/todo.md`, subagent strategy, lessons |
| **ai-standards** | Response style, verification before done, elegance, core principles |
| **ai-shortcuts** | Keyword triggers (TDD, RED, GREEN, REFACTOR, AUDIT, TESTS, BUG, SEC, ULTRA, DELPHI, COUNCIL, etc.) |

## File-Scoped Rules (apply when matching files are edited)

| Rule | Globs | Purpose |
|------|-------|---------|
| **incubyte-api-routes** | `app/api/**/*.py`, `app/main.py` | FastAPI router patterns, response_model, HTTPException |
| **incubyte-sql-safety** | `app/repositories/**/*.py`, `app/db/**/*.py`, `app/services/**/*.py`, `app/models/**/*.py` | Parameterized SQL only, ORM by default |
| **incubyte-frontend-react** | `frontend/**/*.{ts,tsx,js,jsx,...}` | React 18 + Vite + Tailwind + shadcn/ui + TanStack Query/Table + Recharts; Stitch MCP for UI generation |
| **incubyte-project-map** | `app/**`, `frontend/**`, `tests/**`, `scripts/**` | Where things live (skeleton; update as the build progresses) |

## Reading order

If you only read one section before writing code:

1. **`incubyte-tdd-discipline`** — the loop.
2. **`incubyte-commit-hygiene`** — how the loop becomes commits.
3. **`incubyte-craftsmanship`** — the principles that make the code clean.
4. Then the tech rule that matches what you are editing.

## Cross-references

- TDD ↔ commit hygiene ↔ testing form a triangle. Each one references the other two.
- Craftsmanship is the why; code-quality is the concrete how.
- Error handling defers to FastAPI core for layering; FastAPI core defers to error handling for exception strategy.
- Project map is a skeleton — keep it current as files are added.
