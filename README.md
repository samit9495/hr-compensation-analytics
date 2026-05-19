# Salary Management

A small but production-quality salary management tool for an HR manager of
an organization with 10,000 employees. Built for the Incubyte assessment;
graded on visible TDD evolution in `git log`, software craftsmanship,
and an end-to-end working stack.

> **Spec**: `Salary Management Assessment.pdf` at the repo root.
> **Agent brief**: [`AGENTS.md`](./AGENTS.md).

## Stack

| Layer    | Choice                                                   |
| -------- | -------------------------------------------------------- |
| Backend  | Python 3.11+, FastAPI, SQLAlchemy 2.x, Pydantic v2        |
| Database | SQLite (single file, single tenant)                       |
| Frontend | React 19 + Vite + TypeScript (strict), Tailwind, shadcn/ui, TanStack Query, Recharts |
| Tests    | pytest + httpx `TestClient` (backend), Vitest + RTL (frontend) |
| Seed     | 10k employees, bulk insert, deterministic via `--seed`    |

## Repository layout

```
.
├── app/                      FastAPI backend (routes → services → repositories → models)
├── tests/                    Backend tests (unit + integration + seed)
├── scripts/                  CLI helpers (seed.py)
├── frontend/                 React + Vite SPA
├── data/                     first_names.txt / last_names.txt seed inputs
├── artifacts/                planning notes, prompts, performance log, trade-offs
├── tasks/                    todo, lessons learned, manual test scenarios
└── .cursor/                  rules, skills, agents that drive the AI workflow
```

## Quickstart

### 1. Backend

```bash
# create + activate a Python 3.11+ venv
/opt/homebrew/bin/python3.12 -m venv .venv
source .venv/bin/activate

pip install -e ".[dev]"

# create tables + seed 10k employees deterministically
python -m scripts.seed --count 10000 --seed 42 --reset

# run the API (auto-creates tables on startup via lifespan)
uvicorn app.main:app --reload --port 8000
```

The API listens on <http://localhost:8000>. Interactive docs:
<http://localhost:8000/docs>.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

The frontend talks to <http://localhost:8000> by default. To override,
set `VITE_API_URL` in `frontend/.env.local`.

### 3. Tests

```bash
# Backend (run from repo root with the venv activated)
pytest                                    # 69 tests, ~1s
pytest --cov=app --cov-report=term-missing  # 99% line coverage

# Frontend
cd frontend
npm run test
npm run test:coverage
```

## API surface

| Method | Path                                           | Purpose                                    |
| ------ | ---------------------------------------------- | ------------------------------------------ |
| `GET`  | `/`                                            | Health                                     |
| `POST` | `/employees`                                   | Create                                     |
| `GET`  | `/employees?country=&q=&sort=&limit=&offset=`  | List (`X-Total-Count` header)              |
| `GET`  | `/employees/{id}`                              | Get one (404 if missing)                   |
| `PUT`  | `/employees/{id}`                              | Partial update                             |
| `DELETE` | `/employees/{id}`                            | Delete                                     |
| `GET`  | `/insights/by-country/{country}`               | avg / min / max / count                    |
| `GET`  | `/insights/by-country/{country}/by-title`      | avg salary per job title within a country  |
| `GET`  | `/insights/top-titles?limit=`                  | most common job titles                     |
| `GET`  | `/insights/overview`                           | Org-wide KPIs                              |
| `GET`  | `/insights/recent?limit=`                      | most recently created employees            |
| `GET`  | `/insights/distribution`                       | per-country employee counts                |

Errors share a uniform shape: `{"detail": "...", "code": "..."}` —
`employee_not_found` (404), `duplicate_email` (409), Pydantic validation (422).

## How this was built

This codebase was built test-first. Every behavior change has a
`test:` commit immediately followed by the `feat:` / `fix:` commit that
makes it pass, sometimes followed by a `refactor:` commit. To audit:

```bash
git log --oneline
```

You'll see a clean Red-Green-Refactor evolution, one commit per logical
step. See [`tasks/lessons.md`](./tasks/lessons.md) for things learned
along the way and [`artifacts/tradeoffs.md`](./artifacts/tradeoffs.md)
for design decisions that had real alternatives.

## Performance budget

Seeding 10,000 rows must complete in **under 5 seconds** on a typical
dev laptop. Current measurement: **0.09 s** for 10k, **0.46 s** for 50k
on Apple Silicon. See [`artifacts/performance.md`](./artifacts/performance.md).

## Manual smoke tests

See [`tasks/manual-test-scenarios.md`](./tasks/manual-test-scenarios.md)
for the canonical scenarios to run after deployment.
