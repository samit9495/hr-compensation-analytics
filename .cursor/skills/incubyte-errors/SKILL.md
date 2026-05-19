---
name: incubyte-errors
description: Short companion for FastAPI error handling — domain exceptions, exception handlers, response shape. Use when writing try/except, raising HTTPException, or returning error payloads.
---

# Incubyte Errors (skill)

Companion to `.cursor/rules/incubyte-error-handling.mdc`.

## Layered responsibility

| Layer | Action |
|-------|--------|
| Repository | Lets `sqlalchemy.exc.*` bubble. Does not translate. |
| Service | Translates DB / domain conditions to project exceptions (`EmployeeNotFound`, `DuplicateEmployeeEmail`). |
| Route | Does nothing — the handler maps. |
| `main.py` | `@app.exception_handler(DomainError)` returns JSON. |

## Domain exception template

```python
# app/core/exceptions.py
class DomainError(Exception): ...
class EmployeeNotFound(DomainError):
    def __init__(self, employee_id: int):
        super().__init__(f"employee {employee_id} not found")
        self.employee_id = employee_id
```

## Handler template

```python
@app.exception_handler(EmployeeNotFound)
async def handle_not_found(_, exc: EmployeeNotFound):
    return JSONResponse(
        status_code=404,
        content={"detail": str(exc), "code": "employee_not_found"},
    )
```

## Response shape

```json
{ "detail": "human message", "code": "machine_code" }
```

## Don'ts

- No bare `except Exception` in services or routes.
- No `print` for errors. Use `logger.exception(...)`.
- No silent swallow. Re-raise or translate.

## See also

- Rule: `.cursor/rules/incubyte-error-handling.mdc`
- Rule: `.cursor/rules/incubyte-api-routes.mdc` (HTTP status semantics)
