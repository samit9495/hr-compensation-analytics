---
name: seed-10k-perf-validate
overview: Reset the SQLite DB, run the existing seed at 10,000 rows, capture phase-level timings via a one-off measurement script, then write a dated performance entry and a structured report. No production-code changes proposed; this is a validation-and-document pass.
todos:
  - id: baseline-state
    content: Capture pre-run DB state (row count, file size)
    status: completed
  - id: reset-and-run
    content: Run python -m scripts.seed --count 10000 --seed 42 --reset (3 samples)
    status: completed
  - id: phase-breakdown
    content: Write throwaway scripts/_bench_seed.py to measure name-read / generate / insert / commit / delete phases
    status: completed
  - id: post-state
    content: Verify final row count, file size, and determinism hash
    status: completed
  - id: perf-doc
    content: Append dated entry to artifacts/performance.md and commit as docs(perf)
    status: completed
  - id: final-report
    content: Produce structured performance report in chat (Execution Summary, Architecture, Scalability, Optimizations, Recommendations, Verdict)
    status: in_progress
isProject: false
---

# Seed 10k — Performance Validation

## Goal

Validate the current seed implementation against the assessment-required 10,000 rows, capture a phase-level timing breakdown, and produce a structured performance report. Cleanup is via the documented `--reset` flag; no production code is expected to change unless a real regression is found.

## Why no architectural changes are pre-planned

The existing implementation already meets and exceeds the recorded budget (10k in ~0.09 s vs the 5-second budget). The user explicitly asked to avoid premature optimization and "explicitly state" when performance is already acceptable. The work below is measurement and reporting, not refactoring.

## Steps (all executed in Agent mode after plan approval)

1. Capture baseline DB state: row count and file size of [salary.db](salary.db).
2. Cold reset + seed:
   ```bash
   source .venv/bin/activate
   python -m scripts.seed --count 10000 --seed 42 --reset
   ```
   Grab the structured `seed_finish` log (`elapsed_s`).
3. Repeat the same command 2 more times so we have 3 wall-clock samples (best/median/worst).
4. Phase-level breakdown via a throwaway script saved to `scripts/_bench_seed.py` (deleted after the run — not committed). It will import [app/db/seed.py](app/db/seed.py) internals and measure:
   - name-file read time (`_read_lines`)
   - row generation only (loop without `db.execute`)
   - per-batch insert time (every 1000-row chunk individually)
   - the final `db.commit()`
   - the `--reset` `DELETE` time on a populated DB
5. Capture final DB state: row count and file size; spot-check determinism by hashing a `SELECT id, full_name, salary FROM employees ORDER BY id` sample.
6. Update [artifacts/performance.md](artifacts/performance.md) with a fresh dated entry that includes the timing table, host metadata, and notes. One commit:
   `docs(perf): record 10k seed validation run (timings + phase breakdown)`.
7. Produce the structured report in the chat response with the required sections (Execution Summary, Architecture Review, Scalability Analysis, Optimization Opportunities, Recommendations, Final Verdict).

## Cleanup strategy (documented)

- Tool: existing `--reset` flag → `db.execute(delete(Employee)); db.commit()`.
- Tables affected: `employees` only (no other tables exist).
- IDs: `id INTEGER PRIMARY KEY` (no `AUTOINCREMENT`), so the rowid restarts at 1 after the DELETE. No `sqlite_sequence` row to clear. This is confirmed by [app/models/employee.py](app/models/employee.py) line 13.
- File on disk: `salary.db` is reused (not removed). SQLite frees the deleted pages internally; `VACUUM` is not run because freelist reuse is fine at this scale.

## Files touched

- New / appended: [artifacts/performance.md](artifacts/performance.md) — one new dated section.
- Throwaway (not committed): `scripts/_bench_seed.py` for the phase breakdown, deleted after the report is finalized.

## What this plan deliberately does NOT do

- No changes to [app/db/seed.py](app/db/seed.py), [scripts/seed.py](scripts/seed.py), or models.
- No PRAGMA tweaks (WAL, synchronous=OFF). Both unnecessary at 10k.
- No index drop/recreate. The two indexed columns (`job_title`, `country`) plus the unique partial index on `email` are cheap at 10k.
- No 50k / 100k / 1M *runs*. The user only asked for 10k execution; bigger scales are discussed in the Scalability Analysis section of the report.
- No commit if measured numbers match the recorded baseline within ~25% noise — the perf doc entry is still useful, but no other change is justified.

## Expected outcome

- 10k insert wall-clock in the ~0.1–0.5 s range, consistent with [artifacts/performance.md](artifacts/performance.md) line 12.
- Verdict: implementation is production-appropriate for the assessment scope; no required changes; one nice-to-have recommendation about WAL mode at 100k+ to be documented but not implemented.