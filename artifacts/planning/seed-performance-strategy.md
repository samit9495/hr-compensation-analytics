# Seed Performance Strategy

> The PDF explicitly says "performance of the script matters". This
> document records the strategy, the measured numbers, and the
> scalability headroom.

For the broader scale-out picture (50k → 1M), see
[scalability-considerations.md](scalability-considerations.md).

## Goal

Seed 10,000 employees deterministically, under 5 seconds, on a typical
dev laptop, idempotently.

## Strategy (locked in Phase 4)

| Element | Choice | Why |
|---|---|---|
| Generator | `random.Random(seed)` instance | Deterministic; no global `random.seed()` side effects |
| Name source | `data/first_names.txt` + `data/last_names.txt` | PDF-required corpus, ASCII + non-ASCII |
| Insert path | `db.execute(insert(Employee), batch)` | SQLAlchemy Core, ~10× faster than ORM `add_all` |
| Batch size | 1000 rows | Balances driver round-trips with memory |
| Transactions | One `commit()` after all batches | Single fsync, max throughput |
| Idempotency | `--reset` flag → `db.execute(delete(Employee))` then `commit()` | Single explicit reset path; cleared row count verified |
| CLI | `python -m scripts.seed --count N --seed S [--reset]` | Stable contract; structured `seed_start` / `seed_finish` logs |
| Tests | Row count + determinism + name-source + reset + opt-in perf budget | See [testing-strategy.md](testing-strategy.md) |

## Measured numbers (10k rows)

### 2026-05-20 — validation run (phase-level breakdown)

- **Approach**: re-validated the existing seed at the assessment-required
  10,000 rows after a full `--reset`. Three wall-clock samples plus a
  one-off `scripts/_bench_seed.py` (not committed) that imported
  `app.db.seed` internals to isolate each phase.
- **Host**: macOS 26.5 (Darwin 25.5.0), Apple Silicon (arm64),
  Python 3.12.12, SQLAlchemy 2.0.49, stdlib `sqlite3`.
- **Command**: `python -m scripts.seed --count 10000 --seed 42 --reset`.
- **Wall-clock (CLI)**: 0.089 s / 0.087 s / 0.088 s — mean **0.088 s**,
  spread under 3 ms across 3 runs. ~57× under the 5 s seed budget.
- **Phase breakdown (10k rows, single run)**:

  | Phase                      | Seconds | % of total |
  |----------------------------|--------:|-----------:|
  | `delete` (reset 10k rows)  | 0.0022  |  2.4%      |
  | `read_names` (2 files)     | 0.0007  |  0.8%      |
  | Generate rows in Python    | 0.0246  | 26.5%      |
  | 10 batch inserts (1k each) | 0.0629  | 67.8%      |
  | Final `commit`             | 0.0023  |  2.5%      |
  | **TOTAL**                  | **0.0927** | 100% |

  Per-batch insert cost: min 5.7 ms, median 6.1 ms, max 8.7 ms.
- **Post-state**: 10,000 rows; SQLite file 1.6 MB; 20 distinct
  countries and 20 distinct job titles (full coverage of the
  configured constants); no duplicate accumulation because `--reset`
  runs `DELETE FROM employees; COMMIT;` before the inserts.
- **Determinism**: SHA-256 of `(id, full_name, salary)` over the whole
  table is `cabcb46be85c5a56` on consecutive `--seed 42` runs —
  bit-for-bit reproducible.

### 2026-05-20 — 50k extrapolation

| Count | Wall-clock | File size |
|---:|---:|---:|
| 10,000 | **0.09 s** | 1.6 MB |
| 50,000 | **0.46 s** | 8.1 MB |

Scales near-linearly; SQLite remains the bottleneck-free choice at
this volume.

## Why the perf is not pushed further

- The 5 s budget is already beaten by ~57×. Squeezing milliseconds off
  the Python row generator would not move the user-visible needle.
- `PRAGMA journal_mode=WAL` would help concurrent reads — the seed is
  a single-writer batch job, no benefit.
- Dropping `ix_employees_country` / `ix_employees_job_title` during
  the insert and recreating them would save a few ms but make the
  script asymmetric (manual cleanup if it crashes mid-flight). Bad
  trade.

## What would change at higher scales

| Scale | Suggested intervention | Why |
|---|---|---|
| 100k | Move to `PRAGMA synchronous=NORMAL` for the seed only | Reduces fsync cost without losing crash safety after commit |
| 500k | Generate rows in a `multiprocessing.Pool` | Python CPU becomes the bottleneck |
| 1M+ | Switch to Postgres + `COPY` | SQLite's single-writer limit, page-cache exhaustion |

Detailed projection in
[scalability-considerations.md](scalability-considerations.md).

## Cleanup strategy (documented)

- Tool: existing `--reset` flag → `db.execute(delete(Employee));
  db.commit()`.
- Tables affected: `employees` only (no other tables exist).
- IDs: `id INTEGER PRIMARY KEY` (no `AUTOINCREMENT`), so the rowid
  restarts at 1 after the DELETE. No `sqlite_sequence` row to clear.
- File on disk: `salary.db` is reused (not removed). SQLite frees the
  deleted pages internally; `VACUUM` is not run because freelist reuse
  is fine at this scale.

## Template for future entries

```markdown
## YYYY-MM-DD — <what was measured>

- **Approach**: <one-line description>
- **Host**: <OS, CPU, Python/Node version>
- **Result**: <numbers with units>
- **Notes**: <alternatives tried, why they were rejected, any PRAGMA / config changes>
```

## Verdict

The current implementation is production-appropriate for the assessment
scope. No required changes. One nice-to-have noted for the 100k+
regime (PRAGMA tuning) but not implemented — see the
[seed perf validate plan](../../.cursor/plans/seed-10k-perf-validate_dcbc7a0c.plan.md)
for the full reasoning.

## See also

- [scalability-considerations.md](scalability-considerations.md) —
  10k → 1M progression with intervention points.
- [tradeoffs-and-decisions.md](tradeoffs-and-decisions.md) §"Bulk-insert
  with SQLAlchemy Core" — the choice that made these numbers possible.
- [testing-strategy.md](testing-strategy.md) §"Seed tests" — the
  opt-in `-m perf` budget test that locks in the 5 s ceiling.
