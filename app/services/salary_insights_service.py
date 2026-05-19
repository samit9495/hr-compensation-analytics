from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.employee import Employee

SALARY_SCALE = Decimal("0.01")


class SalaryInsightsService:
    """Aggregate salary metrics for the Employee aggregate.

    Pure aggregations with SQL `func.*`; safe for empty data sets — every
    metric returns a sensible zero/empty value instead of raising.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def average_salary_by_country(self, country: str) -> Decimal:
        result = self.db.execute(
            select(func.avg(Employee.salary)).where(Employee.country == country)
        ).scalar_one()
        if result is None:
            return Decimal("0.00")
        return Decimal(result).quantize(SALARY_SCALE)

    def min_max_salary_by_country(self, country: str) -> tuple[Decimal, Decimal]:
        row = self.db.execute(
            select(func.min(Employee.salary), func.max(Employee.salary)).where(
                Employee.country == country
            )
        ).one()
        if row[0] is None:
            return (Decimal("0.00"), Decimal("0.00"))
        return (Decimal(row[0]).quantize(SALARY_SCALE), Decimal(row[1]).quantize(SALARY_SCALE))

    def average_salary_by_country_and_title(self, country: str) -> dict[str, Decimal]:
        rows = self.db.execute(
            select(Employee.job_title, func.avg(Employee.salary))
            .where(Employee.country == country)
            .group_by(Employee.job_title)
            .order_by(Employee.job_title)
        ).all()
        return {title: Decimal(avg).quantize(SALARY_SCALE) for title, avg in rows}

    def top_titles_by_count(self, *, limit: int) -> list[tuple[str, int]]:
        rows = self.db.execute(
            select(Employee.job_title, func.count(Employee.id).label("count"))
            .group_by(Employee.job_title)
            .order_by(func.count(Employee.id).desc(), Employee.job_title)
            .limit(limit)
        ).all()
        return [(title, int(count)) for title, count in rows]

    def employee_count_by_country(self, country: str) -> int:
        return int(
            self.db.execute(
                select(func.count(Employee.id)).where(Employee.country == country)
            ).scalar_one()
        )

    def employee_count_by_country_all(self) -> dict[str, int]:
        rows = self.db.execute(
            select(Employee.country, func.count(Employee.id))
            .group_by(Employee.country)
            .order_by(Employee.country)
        ).all()
        return {country: int(count) for country, count in rows}

    def recent_employees(self, *, limit: int) -> list[Employee]:
        return list(
            self.db.scalars(select(Employee).order_by(Employee.id.desc()).limit(limit))
        )

    def global_overview(self) -> dict[str, object]:
        row = self.db.execute(
            select(
                func.count(Employee.id),
                func.avg(Employee.salary),
                func.count(func.distinct(Employee.country)),
                func.count(func.distinct(Employee.job_title)),
            )
        ).one()
        total, avg, country_n, title_n = row
        return {
            "total_employees": int(total or 0),
            "average_salary": Decimal(avg).quantize(SALARY_SCALE)
            if avg is not None
            else Decimal("0.00"),
            "active_countries": int(country_n or 0),
            "active_titles": int(title_n or 0),
        }
