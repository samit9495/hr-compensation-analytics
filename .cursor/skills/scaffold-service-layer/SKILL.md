---
name: scaffold-service-layer
description: Scaffold a service class test-first — constructor-injected Session, repository delegation, domain exceptions, structured return. Use when extracting business logic out of a route or adding a new use case.
---

# Scaffold Service Layer (Test-First)

## Trigger

Use when asked to: create service, extract service, new use case, move logic out of a route, add an aggregator (insights, summaries, exports).

## Context

Services are where business logic lives. They:

- Receive a `Session` (and optionally a clock / id generator / external client) via constructor injection.
- Compose repositories.
- Raise domain exceptions (not `HTTPException`).
- Commit at the boundary of a single use case.

The salary insights case is a good example — it computes aggregates, so the service is the natural place for the SQL aggregation calls.

## Step 0 — Write the failing unit test first (RED)

```python
# tests/unit/test_salary_insights_service.py
from decimal import Decimal
from app.models.employee import Employee
from app.services.salary_insights_service import SalaryInsightsService


class TestSalaryInsightsService:
    def test_average_salary_by_country_returns_zero_when_no_employees(self, db):
        service = SalaryInsightsService(db)
        assert service.average_salary_by_country("IN") == Decimal("0.00")

    def test_average_salary_by_country_computes_mean_for_country(self, db):
        db.add_all([
            Employee(full_name="A", job_title="Eng", country="IN", salary=Decimal("100")),
            Employee(full_name="B", job_title="Eng", country="IN", salary=Decimal("300")),
            Employee(full_name="C", job_title="Eng", country="US", salary=Decimal("999")),
        ])
        db.commit()
        assert SalaryInsightsService(db).average_salary_by_country("IN") == Decimal("200.00")
```

Run each test individually as you go through the loop. One RED per behavior. Commit each.

## Step 1 — The service skeleton

```python
# app/services/salary_insights_service.py
from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.employee import Employee


class SalaryInsightsService:
    """Aggregates over the Employee table.

    No HTTP, no Pydantic — pure use cases that operate on a Session.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def average_salary_by_country(self, country: str) -> Decimal:
        stmt = select(func.coalesce(func.avg(Employee.salary), 0)).where(Employee.country == country)
        return Decimal(self.db.scalar(stmt) or 0).quantize(Decimal("0.01"))
```

`coalesce(..., 0)` keeps the "no employees ⇒ zero" branch in SQL rather than Python, but either is fine — the test pins the contract.

## Step 2 — Compose into a route (later, separate commit)

```python
# app/api/routes/insights.py
@router.get("/insights/average-by-country", response_model=AverageSalaryRead)
def average_by_country(country: str, db: Session = Depends(get_db)) -> AverageSalaryRead:
    value = SalaryInsightsService(db).average_salary_by_country(country)
    return AverageSalaryRead(country=country, average_salary=value)
```

Each route addition is its own integration test → impl → commit cycle.

## Step 3 — Domain exceptions for negative cases

```python
# app/core/exceptions.py
class InvalidCountryCode(DomainError):
    def __init__(self, country: str):
        super().__init__(f"country must be a 2-letter ISO code, got {country!r}")
```

Mapped to 400 by an exception handler in `app/main.py`.

## Step 4 — Transactions

If the service does a multi-statement write:

```python
def transfer_employee(self, employee_id: int, new_country: str) -> Employee:
    with self.db.begin():
        employee = self._get_or_raise(employee_id)
        employee.country = new_country
        # any related writes...
    self.db.refresh(employee)
    return employee
```

For aggregations (read-only) no explicit transaction is needed.

## Step 5 — When to introduce a Repository

Inline `select(...)` is fine for the first one or two queries. Extract a repository when:

- More than three query helpers exist in the service.
- The same query is called from two services.
- You want to mock the data access for a unit test that is genuinely about the use case, not the SQL.

## Anti-patterns

- Services importing from `fastapi.*` — they should be reusable by a CLI or another service.
- Services holding a module-level `Session` — kills testability.
- Services swallowing exceptions to "be safe" — let them propagate or translate to domain exceptions.

## Checklist

- [ ] Failing unit test added first
- [ ] Service is a class, depends only on `Session` (and clocks / ids if needed) via `__init__`
- [ ] No `HTTPException` inside the service — domain exceptions only
- [ ] Multi-statement writes wrapped in `with db.begin():` or explicit `db.commit()`
- [ ] No SQLAlchemy strings built via f-strings; bound parameters only
- [ ] Tests added for happy path AND zero/empty/edge cases

## See also

- `.cursor/skills/incubyte-tdd-loop/SKILL.md`
- `.cursor/skills/scaffold-api-endpoint/SKILL.md`
- `.cursor/rules/incubyte-fastapi-core.mdc`
- `.cursor/rules/incubyte-sql-safety.mdc`
- `.cursor/rules/incubyte-error-handling.mdc`
