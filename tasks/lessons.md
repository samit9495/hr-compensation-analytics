# Tasks — Lessons Learned

Per `.cursor/rules/ai-workflow.mdc`, append a lesson when:

- A mistake was made and corrected
- An assumption turned out wrong
- A non-obvious pattern was discovered
- A gotcha cost extra time

If a lesson recurs, promote it to a `.cursor/rules/` entry so the rules enforce it.

## Lessons

### 2026-05-20 — pydantic-settings + list[str] env var: use NoDecode
**Context**: Phase 12 — accepting `ALLOWED_ORIGINS=https://a.com,https://b.com`
from the env so the production secret is human-readable.
**Issue**: A plain `@field_validator(..., mode="before")` never fires for a
`list[str]` field. pydantic-settings tries to JSON-decode the env value
*before* calling the model, and a comma-separated string raises a
`SettingsError`.
**Fix/Insight**: Annotate with `NoDecode` to bypass JSON parsing, then add
a `BeforeValidator` to split on commas. JSON-list form still works
because we early-return when the string starts with `[`.

```python
from typing import Annotated
from pydantic import BeforeValidator
from pydantic_settings import BaseSettings, NoDecode

class Settings(BaseSettings):
    allowed_origins: Annotated[list[str], NoDecode, BeforeValidator(_parse)] = [...]
```

### 2026-05-20 — Pydantic blocks the "RED" step for input-validation tests
**Context**: Phase 2.6 — writing a failing test for "POST /employees with
negative salary returns 422".
**Issue**: The test passed immediately. FastAPI's automatic Pydantic
validation returns 422 *before* any of our service code runs.
**Fix/Insight**: That's fine — Pydantic *is* our validator. Commit the
test as the assertion of contract, even if it skips the literal RED
step. Add tests for the *messages* / `loc` paths only when the API
contract needs to expose them.

### 2026-05-20 — IntegrityError fires on flush, not commit
**Context**: Phase 2.15 — converting `IntegrityError` on duplicate email
to a `DuplicateEmployeeEmail` domain exception.
**Issue**: `service.create()` wrapped the `db.commit()` in `try/except
IntegrityError`, but the exception was raised inside
`repo.add(employee)` because `flush()` happens during `add()` in our
repo. The except never fired and the route returned 500.
**Fix/Insight**: Wrap *both* `repo.add()` and `db.commit()` in the
same try block, then rollback in the handler. Pattern: catch the
DB exception at the service boundary where the transaction lives, not
at the repo boundary.

### 2026-05-20 — SQLite `:memory:` + FastAPI TestClient needs StaticPool
**Context**: Phase 2.5 (POST /employees integration test) failed with
`sqlite3.OperationalError: no such table: employees` even though the
in-memory engine had `Base.metadata.create_all` called.
**Issue**: FastAPI's TestClient runs route handlers in a thread pool via
`run_in_threadpool`. SQLite's default `:memory:` database is per-connection;
each new connection (e.g. from a different thread) sees an empty database.
The test session's connection had the table; the handler's connection did
not.
**Fix/Insight**: Use `sqlalchemy.pool.StaticPool` so all connections share a
single in-memory database. Pattern:
`create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False},
poolclass=StaticPool, future=True)`. Promote to `.cursor/rules/` if it bites
again.

## Entry template

```
### YYYY-MM-DD — <short title>
**Context**: What was being done
**Issue**: What went wrong or was surprising
**Fix/Insight**: What to do differently next time
```
