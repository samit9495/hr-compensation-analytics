# Demo Recording Script (5–8 minutes)

Recorded against the deployed Fly.io + Vercel pair. Cover the deliverables
listed in `Salary Management Assessment.pdf` in roughly this order.

## 0:00 — 0:30 · Project intro

- "This is the Salary Management tool for the Incubyte assessment.
  Backend on Fly, frontend on Vercel. Single SQLite file, 10k+ rows."
- Show the README header and the `git log --oneline | wc -l` count.

## 0:30 — 1:30 · TDD discipline (commit log)

- `git log --oneline | head -40` — narrate the `test:` → `feat:` →
  `refactor:` cadence.
- Open one pair (e.g. `test: GET /employees/{id} returns 404 …` and
  the following `feat:`) to show the contract-first style.
- Mention: 95 commits, zero "wip" or "fix typo" noise.

## 1:30 — 3:00 · Backend tour

- `pytest --cov=app` — 69 passing tests, 99% line coverage.
- Walk the layering: route → service → repository → model.
- Show `Decimal(12,2)` salary column and the
  `EmployeeNotFound` / `DuplicateEmployeeEmail` domain exceptions.
- Hit `GET /docs` on the deployed backend; expand `/insights/overview`
  and `/employees`.

## 3:00 — 5:00 · Frontend walkthrough

- Dashboard: KPIs, recent hires, country distribution chart.
- Employees page:
  - filter by country IN; show URL state and `X-Total-Count` in DevTools.
  - create a new employee; show the form validation (negative salary
    blocked, country uppercased).
  - edit and delete the same employee; show the toast on duplicate
    email.
- Insights page: type "IN" — KPI cards and bar chart re-render.

## 5:00 — 6:00 · Seed performance

- `python -m scripts.seed --count 10000 --seed 42 --reset` —
  show wall-clock under 0.5s on the deployed Fly machine.
- Open `artifacts/performance.md` and read the benchmark entry.

## 6:00 — 7:00 · AI workflow artifacts

- Open `artifacts/prompts/README.md` — show one Stitch prompt and
  the post-refinement diff.
- Open `artifacts/tradeoffs.md` — talk through the SQLite, Decimal,
  bulk-seed, and `X-Total-Count` decisions.
- Open `tasks/lessons.md` — read the StaticPool lesson as an example
  of the "every gotcha is documented" rule.

## 7:00 — 8:00 · Closing

- Recap: TDD-graded commit log, craftsmanship-graded code, working
  end-to-end with seeded data, documented decisions.
- Drop the repo URL in chat.
