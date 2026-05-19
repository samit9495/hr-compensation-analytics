---
name: incubyte-seed-performance
description: Build a deterministic, fast seed script for 10,000 employees on SQLite. Directly addresses the PDF requirement "performance of the script matters."
---

# Incubyte Seed Performance

## Trigger

Use when asked to: write/optimize/benchmark the seed script, fill the database, generate fake employees, or load test data.

## Context

The PDF says:

> Assume that engineers run this script regularly, and performance of the script matters.

Full names must be composed from `first_names.txt` and `last_names.txt` (the PDF provides these). The target volume is 10,000 employees. SQLite is the default DB.

## Goals

1. **Correctness**: 10,000 rows inserted, all fields valid, names sampled from the provided files.
2. **Speed**: < 5s on a dev laptop (benchmark in `artifacts/performance.md`).
3. **Determinism**: same `--seed` argument → same dataset.
4. **Idempotency**: a `--reset` flag truncates first; without it, the script either appends or skips per a documented policy.
5. **No PII in `git`**: do not commit a populated `salary.db`; gitignore it.

## TDD-first

This skill does NOT bypass TDD. The seed script gets tests too:

1. RED: `test_seed_inserts_expected_row_count` — `seed(count=10)` ⇒ `db.scalar(select(func.count(Employee.id))) == 10`.
2. RED: `test_seed_is_deterministic_with_seed` — same `--seed` ⇒ same first/last/full name on row 1.
3. RED: `test_seed_uses_only_provided_first_names` — every row's first name is in `first_names.txt`.
4. RED: `test_seed_performance_budget` (optional) — `seed(count=10_000)` completes in < 5.0s (skip with `pytest -m perf` opt-in).

Each test commits separately as described in `.cursor/skills/incubyte-tdd-loop/SKILL.md`.

## Reference layout

```
data/
  first_names.txt
  last_names.txt
app/db/seed.py
scripts/seed.py            # CLI: python -m scripts.seed --count 10000 --seed 42
scripts/benchmark_seed.py  # timing harness; writes to artifacts/performance.md
```

## Bulk insert patterns (fastest → slowest)

| Approach | When |
|----------|------|
| `Session.execute(insert(Employee), [dict, dict, ...])` | **Recommended.** SQLAlchemy 2.x, ORM-friendly, parameterized, fast. |
| `Session.bulk_insert_mappings(Employee, [...])` | Legacy 1.x style; still works. Slightly faster, skips ORM events. |
| `engine.execute(insert(employees_table), [...])` | Core-level, bypasses ORM entirely. Fastest when you do not need ORM features. |
| `Session.add_all([...]) + session.commit()` | OK for small batches; slow for 10k. |
| `for row in rows: session.add(row); session.commit()` | **Bad.** 10,000 commits, autoflush on every row. Do not. |

## Recommended reference implementation (sketch — write tests first!)

```python
# app/db/seed.py
from __future__ import annotations

import random
from decimal import Decimal
from pathlib import Path
from sqlalchemy import insert
from sqlalchemy.orm import Session

from app.models.employee import Employee

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

JOB_TITLES = ["Engineer", "Senior Engineer", "Manager", "Designer", "QA", "Analyst"]
COUNTRIES = ["IN", "US", "GB", "DE", "BR", "ZA", "JP", "FR", "AU", "CA"]


def _load(name: str) -> list[str]:
    return [line.strip() for line in (DATA_DIR / name).read_text(encoding="utf-8").splitlines() if line.strip()]


def seed(db: Session, count: int = 10_000, seed: int | None = None, reset: bool = False) -> int:
    if seed is not None:
        random.seed(seed)
    if reset:
        db.query(Employee).delete()

    first_names = _load("first_names.txt")
    last_names = _load("last_names.txt")

    rows = [
        {
            "full_name": f"{random.choice(first_names)} {random.choice(last_names)}",
            "job_title": random.choice(JOB_TITLES),
            "country": random.choice(COUNTRIES),
            "salary": Decimal(random.randint(30_000, 250_000)).quantize(Decimal("0.01")),
        }
        for _ in range(count)
    ]

    db.execute(insert(Employee), rows)
    db.commit()
    return count
```

## SQLite tuning (optional, only if benchmark says you need it)

```python
from sqlalchemy import event

@event.listens_for(engine, "connect")
def _pragma(dbapi_conn, _):
    cur = dbapi_conn.cursor()
    cur.execute("PRAGMA journal_mode=WAL")
    cur.execute("PRAGMA synchronous=NORMAL")
    cur.close()
```

Document any PRAGMA change in `artifacts/tradeoffs.md` with the measured speedup.

## Idempotency strategy

Default: `--reset` truncates `employees` first. Without it: raise if the table is non-empty (do not silently double-seed). Document this in the CLI help text.

## Benchmarking

```python
# scripts/benchmark_seed.py
import time
from app.db.session import SessionLocal
from app.db.seed import seed

start = time.perf_counter()
with SessionLocal() as db:
    seed(db, count=10_000, seed=42, reset=True)
elapsed = time.perf_counter() - start
print(f"seeded 10,000 in {elapsed:.2f}s")
```

Append the result to `artifacts/performance.md` with date, host (`uname -a`), Python version, and the elapsed time. Re-run after any seed change.

## Checklist

- [ ] `first_names.txt` and `last_names.txt` checked into `data/`
- [ ] Failing test for row count before any seed code
- [ ] `seed()` accepts `count`, `seed`, `reset` parameters
- [ ] Uses bulk insert (one execute, one commit)
- [ ] Deterministic when `seed=` is provided
- [ ] CLI at `scripts/seed.py` (`python -m scripts.seed --count 10000 --seed 42`)
- [ ] Benchmark recorded in `artifacts/performance.md`
- [ ] `salary.db` is gitignored

## See also

- `.cursor/rules/incubyte-sql-safety.mdc` — bulk insert is parameterized; no f-strings.
- `.cursor/rules/incubyte-fastapi-core.mdc` — `Decimal` for money; SQLite layout.
- `.cursor/skills/incubyte-tdd-loop/SKILL.md` — TDD steps for the seed tests.
