---
name: address-review-warnings
overview: Address the 4 warnings (W1, W2-downgraded, W3, W4) and 2 actionable info findings (I1, I2) from the code review. All work is small, behavior-preserving (or behavior-locking), TDD-disciplined, and split into one logical change per commit. No critical issues to fix; this is hygiene work.
todos:
  - id: w1-rename-filtered
    content: "W1 + I2: rename EmployeeRepository._filtered -> apply_filters; update CompensationAnalysisService call; cross-ref title_canonical"
    status: completed
  - id: w2-characterize-500
    content: "W2 (downgraded): characterization test that RequestContextMiddleware logs http_request with status=500 when handler raises"
    status: completed
  - id: w3-typed-returns
    content: "W3: TypedDict returns for payroll_by_*, global_overview, salary_outliers; drop route-side # type: ignore"
    status: completed
  - id: w4-2x-delete
    content: "W4: use SQLAlchemy 2.x delete() in tests/seed/test_seed.py"
    status: completed
  - id: i1-drop-unused
    content: "I1: remove unused _ALLOWED_SORT_VALUES from employees route"
    status: completed
isProject: false
---

# Address Code Review Warnings + Info

## What changes (5 commits)

### Commit 1 — W1 + I2: drop the underscore on `_filtered`; cross-ref `title_canonical`

Pure refactor. Existing tests in [tests/unit/test_employee_repository.py](tests/unit/test_employee_repository.py), [tests/integration/test_employees_api.py](tests/integration/test_employees_api.py) (`TestListDistinctCountries`), and [tests/unit/test_compensation_analysis_service.py](tests/unit/test_compensation_analysis_service.py) already cover all four call sites.

- [app/repositories/employee_repository.py](app/repositories/employee_repository.py): rename `_filtered` -> `apply_filters` (drop the leading underscore, drop `@staticmethod` since it's a shared public helper). Update the three in-class callers: `list`, `count`, `distinct_countries`.
- [app/services/compensation_analysis_service.py](app/services/compensation_analysis_service.py): update line 50 call site; add a one-line comment above the local `title_canonical` (line 36) pointing at the shared definition in [app/services/salary_insights_service.py:20](app/services/salary_insights_service.py).

Commit message: `refactor: rename EmployeeRepository._filtered -> apply_filters; cross-ref title_canonical`

### Commit 2 — W2 characterization: lock in the access-log-on-500 behavior

Adds a regression test that proves the existing `http_request` log line still fires when an endpoint raises and the global `Exception` handler converts it to 500. No production code change.

- [tests/integration/test_request_context_middleware.py](tests/integration/test_request_context_middleware.py): add `test_emits_access_log_with_500_when_handler_raises` that registers a `/boom` route inside the `fixture_app`, also registers `register_exception_handlers` on that app, then asserts exactly one `MIDDLEWARE_LOGGER` record with `status_code == 500`, `path == "/boom"`, `duration_ms >= 0`, and a non-empty `request_id`. Test passes today — this is a characterization test, not a fix.

Commit message: `test: characterize RequestContextMiddleware access log when handler raises (status=500)`

### Commit 3 — W3: typed return shapes

Replaces `dict[str, object]` and `list[dict[str, object]]` returns on [app/services/salary_insights_service.py](app/services/salary_insights_service.py) with `TypedDict` shapes so route-side `# type: ignore[arg-type]` comments disappear. No behavior change; existing tests in [tests/unit/test_salary_insights_service.py](tests/unit/test_salary_insights_service.py), [tests/integration/test_insights_api.py](tests/integration/test_insights_api.py) keep them honest.

New top-of-file types in `salary_insights_service.py`:
- `PayrollEntryResult` (`key: str, total: Decimal, percentage: Decimal`)
- `PayrollResult` (`total: Decimal, entries: list[PayrollEntryResult]`)
- `GlobalOverviewResult` (`total_employees, average_salary, active_countries, active_titles`)
- `OutlierResult` (`id, full_name, country, job_title, salary, bucket`)

Methods updated: `payroll_by_country`, `payroll_by_title`, `global_overview`, `salary_outliers` (signature only; `_payroll_response` return type tightens accordingly).

[app/api/routes/insights.py](app/api/routes/insights.py): `_payroll_payload` drops both `# type: ignore[arg-type]` comments; `OutlierEntry(**row)` and `GlobalOverview(**...)` stay the same because they already unpack a dict.

Commit message: `refactor: TypedDict returns for payroll_by_*, global_overview, salary_outliers; drop route-side # type: ignore`

### Commit 4 — W4: SQLAlchemy 2.x delete() in the seed test

Drop the legacy `db.query(Employee).delete()` in [tests/seed/test_seed.py:20](tests/seed/test_seed.py); use `db.execute(delete(Employee))` to match the production-side style.

Commit message: `refactor(test): use SQLAlchemy 2.x delete() in seed determinism test`

### Commit 5 — I1: remove unused `_ALLOWED_SORT_VALUES`

[app/api/routes/employees.py:26-28](app/api/routes/employees.py) defines `_ALLOWED_SORT_VALUES` but nothing references it. Delete the four lines.

Commit message: `chore: remove unused _ALLOWED_SORT_VALUES from employees route`

## What is NOT in scope

- **W2 fix** — verified false positive; status quo is correct. Only added a regression test.
- **I3** — watch-list only; `SalaryInsightsService` is 205 lines, still under the 300-line target; splitting it now would be premature.
- No frontend touched.
- No new tests beyond commit 2.

## Verification gates (run before every commit)

- `pytest -q` -> 127 passing (will become 128 after commit 2).
- `pytest --cov=app` -> coverage stays at >=99%.
- `python -c "from app.main import app"` -> import smoke check after each refactor.
- `tsc --noEmit` not needed (no frontend changes).

## Commit sequence summary

```
refactor: rename EmployeeRepository._filtered -> apply_filters; cross-ref title_canonical
test: characterize RequestContextMiddleware access log when handler raises (status=500)
refactor: TypedDict returns for payroll_by_*, global_overview, salary_outliers; drop route-side # type: ignore
refactor(test): use SQLAlchemy 2.x delete() in seed determinism test
chore: remove unused _ALLOWED_SORT_VALUES from employees route
```