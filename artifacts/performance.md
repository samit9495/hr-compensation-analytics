# Performance

Append a dated entry every time a perf-sensitive change lands. Keeps the optimization history visible to the assessor.

## 2026-05-20 — Seed 10k validation run (phase-level breakdown)

- **Approach**: re-validated the existing seed at the assessment-required
  10,000 rows after a full `--reset`. Three wall-clock samples plus a
  one-off `scripts/_bench_seed.py` (not committed) that imported
  `app.db.seed` internals to isolate each phase.
- **Host**: macOS 26.5 (Darwin 25.5.0), Apple Silicon (arm64),
  Python 3.12.12, SQLAlchemy 2.0.49, stdlib `sqlite3`.
- **Command**: `python -m scripts.seed --count 10000 --seed 42 --reset`.
- **Wall-clock (CLI)**: 0.089 s / 0.087 s / 0.088 s — mean **0.088 s**,
  spread under 3 ms across 3 runs. ~57x under the 5 s seed budget.
- **Phase breakdown (10k rows, single run via `scripts/_bench_seed.py`)**:

  | Phase                      | Seconds | % of total |
  |----------------------------|--------:|-----------:|
  | `delete` (reset 10k rows)  | 0.0022  |  2.4%      |
  | `read_names` (2 files)     | 0.0007  |  0.8%      |
  | Generate rows in Python    | 0.0246  | 26.5%      |
  | 10 batch inserts (1k each) | 0.0629  | 67.8%      |
  | Final `commit`             | 0.0023  |  2.5%      |
  | **TOTAL**                  | **0.0927** | 100% |

  Per-batch insert cost: min 5.7 ms, median 6.1 ms, max 8.7 ms.
- **Post-state**: 10,000 rows; SQLite file 1.6 MB; 20 distinct countries
  and 20 distinct job titles (full coverage of the configured constants);
  no duplicate accumulation because `--reset` runs `DELETE FROM
  employees; COMMIT;` before the inserts.
- **Determinism**: SHA-256 of `(id, full_name, salary)` over the whole
  table is `cabcb46be85c5a56` on consecutive `--seed 42` runs — bit-for-bit
  reproducible (verified by re-running and re-hashing).
- **Notes**:
  - The SQLAlchemy Core bulk path (`db.execute(insert(Employee), batch)`)
    dominates wall time (68%). ORM `Session.add` would be ~10x slower
    because of per-row attribute instrumentation — not changing.
  - Python row generation is the second-largest cost (27%). Cheap
    enough at 10k that micro-optimization (e.g., pre-resolved `choice`,
    pre-computed name pool) would not be measurable and would hurt
    readability — see craftsmanship rule on YAGNI.
  - `--reset` deletes via `delete(Employee)`; SQLite's
    `INTEGER PRIMARY KEY` (no `AUTOINCREMENT` keyword) restarts the
    rowid at 1 because `sqlite_sequence` is never populated for this
    table — verified by `first 5: [(1, ...), (2, ...), ...]` post-run.
  - DB file is reused; no `VACUUM` because freelist reuse is fine at
    this volume.
  - `PRAGMA journal_mode` left at `delete` (the SQLite default). WAL
    would help concurrent reads but the seed is a single-writer batch
    job and would not move the needle at 10k.

## 2026-05-20 — Seed 10k / 50k employees

- **Approach**: `random.Random(seed)`-driven generator with SQLAlchemy
  Core `insert()` in batches of 1000.
- **Host**: macOS 14 (Darwin 25.5.0), Apple Silicon, Python 3.12.12,
  SQLAlchemy 2.0.49, SQLite via stdlib `sqlite3`.
- **Result**:
  - `--count 10000 --seed 42 --reset` → **0.09 s** wall-clock,
    1.6 MB SQLite file.
  - `--count 50000 --seed 42 --reset` → **0.46 s** wall-clock,
    8.1 MB SQLite file.
  - In-memory perf test (`tests/seed/test_seed_perf.py`,
    `-m perf`) → **~0.12 s** for 10k rows.
- **Notes**:
  - Bulk path: `db.execute(insert(Employee), batch)` per 1000-row chunk.
    ORM `Session.add` was ~10x slower in a prior experiment because of
    per-row attribute instrumentation.
  - Deterministic via constructor-injected `random.Random` instance — no
    global `random.seed()`.
  - Did **not** drop indexes during insert; with this corpus size the
    index maintenance overhead is dwarfed by Python work.
  - PRAGMA `journal_mode` left at the SQLite default (delete) — switching
    to WAL was unnecessary at this volume.

## Template

```markdown
## YYYY-MM-DD — <what was measured>

- **Approach**: <one-line description>
- **Host**: <OS, CPU, Python/Node version>
- **Result**: <numbers with units>
- **Notes**: <alternatives tried, why they were rejected, any PRAGMA / config changes>
```

## Seed budget

Target: **10,000 employees seeded in under 5 seconds** on a typical dev laptop. See `.cursor/skills/incubyte-seed-performance/SKILL.md`.
