---
name: scaffold-api-endpoint
description: Scaffold a new FastAPI endpoint test-first — Pydantic schemas, service injection, APIRouter, response_model, and pytest coverage. Use when creating any new REST endpoint.
---

# Scaffold FastAPI Endpoint (Test-First)

## Trigger

Use when asked to: create endpoint, add API route, new REST endpoint, new FastAPI route, expose a resource.

## Context

Every endpoint in this project follows the same shape: thin route → service → repository → model. Every endpoint is built test-first per `.cursor/rules/incubyte-tdd-discipline.mdc`.

The pattern below is exemplified for an `Employee` resource — adapt to the resource you are building.

## Step 0 — Write the failing test first (RED)

```python
# tests/integration/test_employees_api.py
import pytest
from fastapi import status

@pytest.mark.usefixtures("client")
class TestEmployeesAPI:
    def test_create_employee_returns_201_with_persisted_row(self, client, db):
        payload = {
            "full_name": "Jane Doe",
            "job_title": "Engineer",
            "country": "IN",
            "salary": "50000.00",
        }
        resp = client.post("/employees", json=payload)
        assert resp.status_code == status.HTTP_201_CREATED
        body = resp.json()
        assert body["id"] > 0
        assert body["full_name"] == "Jane Doe"
```

Run it. Confirm 404 / import error. Commit with `test: ...`.

## Step 1 — Pydantic schemas

```python
# app/schemas/employee.py
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class EmployeeBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=200)
    job_title: str = Field(min_length=1, max_length=100)
    country: str = Field(min_length=2, max_length=2, examples=["IN"])
    salary: Decimal = Field(ge=0, max_digits=12, decimal_places=2)


class EmployeeCreate(EmployeeBase): ...

class EmployeeUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=200)
    job_title: str | None = Field(default=None, min_length=1, max_length=100)
    country: str | None = Field(default=None, min_length=2, max_length=2)
    salary: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)


class EmployeeRead(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
```

## Step 2 — Repository (data access only)

```python
# app/repositories/employee_repository.py
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.employee import Employee


class EmployeeRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, employee: Employee) -> Employee:
        self.db.add(employee)
        self.db.flush()
        return employee

    def get(self, employee_id: int) -> Employee | None:
        return self.db.get(Employee, employee_id)

    def list(self, country: str | None, limit: int, offset: int) -> list[Employee]:
        stmt = select(Employee).order_by(Employee.id).limit(limit).offset(offset)
        if country is not None:
            stmt = stmt.where(Employee.country == country)
        return list(self.db.scalars(stmt))
```

## Step 3 — Service (use cases)

```python
# app/services/employee_service.py
from sqlalchemy.orm import Session
from app.core.exceptions import EmployeeNotFound
from app.models.employee import Employee
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


class EmployeeService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = EmployeeRepository(db)

    def create(self, payload: EmployeeCreate) -> Employee:
        employee = Employee(**payload.model_dump())
        self.repo.add(employee)
        self.db.commit()
        self.db.refresh(employee)
        return employee

    def get(self, employee_id: int) -> Employee:
        employee = self.repo.get(employee_id)
        if employee is None:
            raise EmployeeNotFound(employee_id)
        return employee
```

## Step 4 — Route (thin)

```python
# app/api/routes/employees.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.employee import EmployeeCreate, EmployeeRead
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
) -> EmployeeRead:
    employee = EmployeeService(db).create(payload)
    return EmployeeRead.model_validate(employee)
```

Include the router in `app/main.py`:

```python
from app.api.routes import employees
app.include_router(employees.router)
```

## Step 5 — Make the test green

Run the test. Fix the smallest thing until green. Paste the pass.

## Step 6 — Commit GREEN

```bash
git add app/api/routes/employees.py app/schemas/employee.py app/services/employee_service.py app/repositories/employee_repository.py app/models/employee.py app/main.py
git commit -m "feat: implement POST /employees endpoint"
```

(If the test required a new model column or migration, those go in their own preceding `feat:` commits driven by their own tests.)

## Step 7 — Add the next RED for the next behavior

Next behaviors to test, one per cycle:

- `test_create_employee_with_invalid_country_returns_422`
- `test_create_employee_with_negative_salary_returns_422`
- `test_list_employees_filters_by_country`
- `test_list_employees_paginates_with_limit_and_offset`
- `test_get_employee_returns_404_when_not_found`

Each one drives a small RED → GREEN → REFACTOR triple.

## Checklist

- [ ] Failing integration test first (RED), committed as `test: ...`
- [ ] Pydantic schemas: separate Create / Update / Read
- [ ] Repository methods are query-only, return models or values
- [ ] Service holds the use case; depends on the repo via constructor
- [ ] Route uses `Depends(get_db)`, declares `response_model=` and `status_code=`
- [ ] Domain exceptions raised in the service map to HTTP via handlers
- [ ] Tests cover happy path, validation, not-found, edge cases

## See also

- `.cursor/skills/incubyte-tdd-loop/SKILL.md` — exact RED→GREEN→REFACTOR steps
- `.cursor/skills/scaffold-service-layer/SKILL.md` — when the service needs more than CRUD
- `.cursor/rules/incubyte-api-routes.mdc`, `.cursor/rules/incubyte-fastapi-core.mdc`
