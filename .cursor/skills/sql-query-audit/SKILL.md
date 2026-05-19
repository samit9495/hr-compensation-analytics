---
name: sql-query-audit
description: Audit SQLAlchemy queries and raw SQL for injection risk and ORM safety. Use when asked to audit SQL, fix unsafe queries, or before touching app/repositories or app/db.
---

# SQL Query Audit (SQLAlchemy + SQLite)

## Trigger

Use when asked to: SQL audit, SQL injection, parameterized queries, raw SQL, fix unsafe SQL, review repositories.

## Context

The project uses SQLAlchemy 2.x ORM by default. Raw SQL is only used when the ORM is genuinely awkward. This skill systematically finds and fixes unsafe patterns and reviews ORM usage.

## Step 1 — Search for unsafe patterns

```bash
# f-strings or .format() near SQL primitives
rg -n 'text\(f["\x27]' app/ tests/
rg -n 'text\(.+\.format\(' app/ tests/

# raw execute with string concatenation
rg -n 'execute\(.+\+.+\)' app/ tests/

# direct string interpolation into select / insert / update / delete strings
rg -n 'f"SELECT|f"INSERT|f"UPDATE|f"DELETE|f"CREATE|f"DROP|f"ALTER' app/ tests/
```

(Use Cursor's Grep tool rather than `grep` when inside the agent.)

## Step 2 — Classify each hit

For every match decide:

- **Value parameter** ⇒ must use a bound parameter.
- **Identifier (table/column)** ⇒ never user-controlled; if dynamic, validate against an allow-list and use SQLAlchemy `bindparam(..., literal_execute=True)` or `sqlalchemy.sql.quoted_name`.
- **Static SQL fragment** ⇒ safe, but consider converting to ORM.

## Step 3 — Fix patterns

### Pattern A — f-string with values ⇒ bound params

```python
# BAD
db.execute(text(f"SELECT * FROM employees WHERE country = '{country}'"))

# GOOD (raw text)
db.execute(text("SELECT * FROM employees WHERE country = :country"), {"country": country})

# BETTER (ORM)
db.scalars(select(Employee).where(Employee.country == country)).all()
```

### Pattern B — `.format()` ⇒ same fix

```python
# BAD
db.execute(text("SELECT * FROM employees WHERE id = {}".format(employee_id)))

# GOOD
db.execute(text("SELECT * FROM employees WHERE id = :id"), {"id": employee_id})
```

### Pattern C — `IN (...)` with tuple interpolation

```python
# BAD
db.execute(text(f"SELECT * FROM employees WHERE id IN {tuple(ids)}"))

# GOOD (ORM)
db.scalars(select(Employee).where(Employee.id.in_(ids))).all()

# GOOD (raw text with expanding bindparam)
from sqlalchemy import text, bindparam
stmt = text("SELECT * FROM employees WHERE id IN :ids").bindparams(bindparam("ids", expanding=True))
db.execute(stmt, {"ids": ids})
```

### Pattern D — Dynamic ORDER BY / column names

Never accept a raw column name from the client.

```python
ALLOWED_SORT = {"id": Employee.id, "salary": Employee.salary, "full_name": Employee.full_name}

def list_sorted(self, sort_by: str = "id"):
    column = ALLOWED_SORT.get(sort_by)
    if column is None:
        raise InvalidSortField(sort_by)
    return self.db.scalars(select(Employee).order_by(column)).all()
```

### Pattern E — Bulk insert

```python
# GOOD (parameterized, fast)
db.execute(insert(Employee), [{"full_name": ..., "country": ..., ...} for ... in ...])
db.commit()
```

The list-of-dicts form goes through `executemany` with bound parameters. See `.cursor/skills/incubyte-seed-performance/SKILL.md`.

## Step 4 — Detect ORM smells

- **N+1**: a list endpoint iterating models that lazy-load a relationship. Add `selectinload(Employee.relation)` to the select.
- **Implicit conversions**: comparing `Decimal` to a `float`. Always pass `Decimal` into the query.
- **Hard-coded `LIMIT 1000`** when the API contract is `LIMIT 50`. Push the value to the query parameter.

## Step 5 — Add a test for any fix

Each fix gets a RED test first:

```python
def test_list_employees_does_not_break_on_apostrophe_in_country(db, client):
    # country = "X'); DROP TABLE employees;--"  -- if it gets past Pydantic, the parameterized query is still safe
    db.add(Employee(full_name="A", job_title="x", country="IN", salary=Decimal("1")))
    db.commit()
    resp = client.get("/employees", params={"country": "X'); DROP TABLE employees;--"})
    assert resp.status_code == 200
    assert resp.json() == []
    # Sanity: the table still exists
    assert db.scalar(select(func.count(Employee.id))) == 1
```

## Checklist

- [ ] No f-strings or `.format()` around SQL text
- [ ] All values use bound parameters
- [ ] All identifiers come from an allow-list (or the ORM)
- [ ] Bulk operations use executemany via `insert(Model), [dict, ...]`
- [ ] One regression test per fix
- [ ] No `text(...)` call introduces a new injection surface

## See also

- `.cursor/rules/incubyte-sql-safety.mdc`
- `.cursor/skills/incubyte-seed-performance/SKILL.md`
