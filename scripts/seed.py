"""CLI entry-point for the deterministic Employee seed.

Usage:

    python -m scripts.seed --count 10000 --seed 42 --reset

The seed reuses the production engine (env DATABASE_URL or the SQLite
default) and the same `app.db.seed.run` function exercised by the tests.
"""
from __future__ import annotations

import argparse
import logging
import time

from app.core.logging import configure_logging
from app.db.seed import run as seed_run
from app.db.session import SessionLocal, engine, init_db

logger = logging.getLogger(__name__)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="scripts.seed",
        description="Deterministic bulk-insert seed for the Employee table.",
    )
    parser.add_argument("--count", type=int, default=10_000, help="rows to insert (default 10000)")
    parser.add_argument("--seed", type=int, default=42, help="RNG seed (default 42)")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="delete all employees before inserting new rows",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="root log level for the seed run (default INFO)",
    )
    return parser.parse_args()


def main() -> int:
    args = _parse_args()
    configure_logging(args.log_level)

    init_db(engine)

    logger.info(
        "seed_start",
        extra={
            "event": "seed_start",
            "count": args.count,
            "rng_seed": args.seed,
            "reset": args.reset,
        },
    )

    session = SessionLocal()
    try:
        started = time.perf_counter()
        inserted = seed_run(session, count=args.count, rng_seed=args.seed, reset=args.reset)
        elapsed = time.perf_counter() - started
    finally:
        session.close()

    logger.info(
        "seed_finish",
        extra={
            "event": "seed_finish",
            "inserted": inserted,
            "elapsed_s": round(elapsed, 3),
        },
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
