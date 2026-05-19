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
