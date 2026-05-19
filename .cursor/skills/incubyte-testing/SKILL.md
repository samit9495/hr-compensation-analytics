---
name: incubyte-testing
description: Short companion for pytest + Vitest patterns. Use when adding tests, writing fixtures, or running the suite.
---

# Incubyte Testing (skill)

Companion to `.cursor/rules/incubyte-testing.mdc`. TDD discipline lives in `.cursor/rules/incubyte-tdd-discipline.mdc`.

## Backend

### Layout

```
tests/
├── conftest.py
├── unit/
└── integration/
```

### Core fixtures (in `conftest.py`)

```python
@pytest.fixture
def engine():
    eng = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)

@pytest.fixture
def db(engine):
    Session = sessionmaker(bind=engine, autoflush=False)
    s = Session()
    try: yield s
    finally: s.close()

@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c: yield c
    app.dependency_overrides.clear()
```

### Test method naming

`test_<action>_<condition>_<expected>` — e.g. `test_create_employee_with_duplicate_email_returns_409`.

### Run

```bash
pytest -v                                              # all tests
pytest tests/unit/test_employee_service.py -v          # single file
pytest -k "average_salary"                             # filter by name
pytest --cov=app --cov-report=term-missing             # with coverage
```

## Frontend

### Vitest config

```ts
test: { environment: "jsdom", globals: true, setupFiles: "./src/test/setup.ts" }
```

### Component test template

```tsx
test("does something user-visible", async () => {
  render(<Component />)
  await userEvent.click(screen.getByRole("button", { name: /save/i }))
  expect(screen.getByText(/saved/i)).toBeInTheDocument()
})
```

### Run

```bash
npm run test               # watch
npm run test -- --run      # single pass (CI mode)
npm run test -- --coverage
```

## Mock policy

- Mock **at the system boundary** only (HTTP, filesystem, time, randomness).
- Do NOT mock your own repository when testing a service. Use the real in-memory DB.
- Frontend: mock at the `api/` layer or use `msw` for integration tests.

## See also

- Rule: `.cursor/rules/incubyte-testing.mdc`
- Rule: `.cursor/rules/incubyte-tdd-discipline.mdc`
- Skill: `.cursor/skills/incubyte-tdd-loop/SKILL.md`
