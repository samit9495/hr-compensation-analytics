"""Deterministic, bulk-insert seed for the Employee table.

Optimizes for the PDF requirement that the seed script's performance
matters. Reads names from `data/first_names.txt` and `data/last_names.txt`
and uses a seeded RNG so the same `--seed` produces the same dataset.
"""
from __future__ import annotations

import random
from decimal import Decimal
from pathlib import Path

from sqlalchemy import delete, insert
from sqlalchemy.orm import Session

from app.models.employee import Employee

DATA_DIR = Path(__file__).resolve().parents[2] / "data"

COUNTRIES = [
    "IN", "US", "GB", "DE", "FR", "JP", "CN", "BR", "CA", "AU",
    "MX", "IT", "ES", "NL", "SE", "PL", "ZA", "AE", "SG", "ID",
]
JOB_TITLES = [
    "Engineer", "Senior Engineer", "Staff Engineer", "Engineering Manager",
    "Product Manager", "Designer", "Data Analyst", "Data Scientist",
    "QA Engineer", "DevOps Engineer", "Security Engineer", "Tech Lead",
    "Director of Engineering", "VP Engineering", "Recruiter", "HR Manager",
    "Sales Executive", "Account Manager", "Marketing Manager", "Finance Analyst",
]
DEPARTMENTS = [
    "Engineering", "Product", "Design", "Data", "Security",
    "HR", "Finance", "Marketing", "Sales", "Operations",
]
MIN_SALARY = Decimal("30000.00")
MAX_SALARY = Decimal("250000.00")
BATCH_SIZE = 1000


def _read_lines(path: Path) -> list[str]:
    return [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def _random_salary(rng: random.Random) -> Decimal:
    cents = rng.randint(int(MIN_SALARY * 100), int(MAX_SALARY * 100))
    return (Decimal(cents) / Decimal(100)).quantize(Decimal("0.01"))


def run(
    db: Session,
    *,
    count: int,
    rng_seed: int,
    reset: bool = False,
    data_dir: Path = DATA_DIR,
) -> int:
    """Insert ``count`` Employee rows using a seeded RNG.

    Returns the number of inserted rows. When ``reset=True``, deletes all
    existing rows before inserting.
    """
    if reset:
        db.execute(delete(Employee))
        db.commit()

    first_names = _read_lines(data_dir / "first_names.txt")
    last_names = _read_lines(data_dir / "last_names.txt")
    if not first_names or not last_names:
        raise RuntimeError("name lists are empty; check data/first_names.txt and data/last_names.txt")

    rng = random.Random(rng_seed)

    batch: list[dict[str, object]] = []
    inserted = 0
    for i in range(count):
        first = rng.choice(first_names)
        last = rng.choice(last_names)
        batch.append(
            {
                "full_name": f"{first} {last}",
                "job_title": rng.choice(JOB_TITLES),
                "country": rng.choice(COUNTRIES),
                "salary": _random_salary(rng),
                "department": rng.choice(DEPARTMENTS),
                "is_active": True,
                "email": f"seed.{i+1}@example.com",
            }
        )
        if len(batch) >= BATCH_SIZE:
            db.execute(insert(Employee), batch)
            inserted += len(batch)
            batch = []
    if batch:
        db.execute(insert(Employee), batch)
        inserted += len(batch)

    db.commit()
    return inserted
