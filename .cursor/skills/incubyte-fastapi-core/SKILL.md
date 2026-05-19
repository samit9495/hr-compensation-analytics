---
name: incubyte-fastapi-core
description: Short companion to incubyte-fastapi-core.mdc — quick reference for layering, dependencies, and imports when adding any backend file.
---

# Incubyte FastAPI Core (skill)

Companion to the rule at `.cursor/rules/incubyte-fastapi-core.mdc`. Use this skill when you need a quick lookup, not a full re-read of the rule.

## Layers

```
app/api/routes/      <- thin handlers (parse, delegate, return)
app/services/        <- use cases, business logic
app/repositories/    <- SQLAlchemy queries
app/models/          <- ORM models
app/schemas/         <- Pydantic v2 request/response models
app/db/              <- engine, session, get_db dependency
app/core/            <- config, domain exceptions
```

A route imports a service. A service imports a repository. A repository imports a model. Never the other way.

## Get the DB session

```python
from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

def my_route(db: Session = Depends(get_db)): ...
```

## Constructor injection in services

```python
class EmployeeService:
    def __init__(self, db: Session) -> None:
        self.repo = EmployeeRepository(db)
```

Tests pass an in-memory session; production passes the FastAPI-managed session. Same class.

## Pydantic v2 patterns

```python
from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal

class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    job_title: str
    country: str = Field(min_length=2, max_length=2)
    salary: Decimal
```

## Decimal for money

`Numeric(12, 2)` on the model, `Decimal` everywhere in Python, format at the edge.

## See also

- Rule: `.cursor/rules/incubyte-fastapi-core.mdc`
- Skill: `.cursor/skills/scaffold-api-endpoint/SKILL.md`
- Skill: `.cursor/skills/scaffold-service-layer/SKILL.md`
