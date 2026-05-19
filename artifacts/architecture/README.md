# Architecture

```
+----------------+        HTTPS         +----------------------+
|  React + Vite  | -------------------> |  FastAPI (uvicorn)   |
|  TanStack Q.   | <------------------- |  routes → services   |
|  shadcn / RTL  |                      |     ↓ repositories   |
+----------------+                      |     ↓   SQLAlchemy   |
                                        |     ↓     SQLite     |
                                        +----------------------+
                                                 ↑
                                                 |  one-shot CLI
                                        +----------------------+
                                        | scripts/seed.py      |
                                        | Faker-style names    |
                                        | bulk insert + reset  |
                                        +----------------------+
```

## Layering (backend)

```
app/api/routes/        thin: parse, dispatch, return Pydantic
        ↓
app/services/          use-case orchestration, transactions
        ↓
app/repositories/      SQLAlchemy queries
        ↓
app/models/            ORM (Numeric(12,2), unique email)
        ↓
app/db/                engine, SessionLocal, create_all on startup
```

Rules:

- Routes don't import SQLAlchemy. Services don't import FastAPI.
- One service call = one logical transaction.
- Domain exceptions (`EmployeeNotFound`, `DuplicateEmployeeEmail`) are
  raised by services and mapped to HTTP by global handlers in
  `app/main.py`.

## Frontend module layout

```
src/
├── components/   AppShell, EmployeesTable, EmployeeForm, KpiCard, ...
├── pages/        DashboardPage, EmployeesPage, InsightsPage
├── hooks/        useEmployees, useInsights  (TanStack Query wrappers)
├── services/     employees.ts, insights.ts  (typed fetch + types)
└── lib/          api.ts (fetch wrapper), queryClient.ts, utils.ts
```

The `api.ts` wrapper raises a typed `ApiError` with `status`, `detail`,
and `code`, which the form components surface to the user as a
submit-error banner.

## Data model

```
Employee
├── id          int, PK
├── full_name   str(120)
├── job_title   str(120),  index
├── country     str(2),    index
├── salary      Numeric(12,2),  index
├── email       str(255)?, unique-index when present
├── department  str(120)?
├── hire_date   date?
└── is_active   bool, default True
```

## Performance posture

- Seeded 10k rows in ~0.09s on Apple Silicon; budget is 5s.
- Indexes on `country`, `job_title`, `salary`, and `email`.
- `X-Total-Count` header on list endpoint to support real pagination.

## Where the AI artifacts live

- `tasks/todo.md`, `tasks/lessons.md`, `tasks/manual-test-scenarios.md`
- `artifacts/prompts/` — Stitch + LLM Council prompts
- `artifacts/tradeoffs.md` — decisions with real alternatives
- `artifacts/performance.md` — measured numbers, dated
