from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.employee import Employee


class EmployeeRepository:
    """Data access for the Employee aggregate.

    No business logic, no HTTP. Returns ORM instances or plain values.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def add(self, employee: Employee) -> Employee:
        self.db.add(employee)
        self.db.flush()
        return employee

    def get(self, employee_id: int) -> Employee | None:
        return self.db.get(Employee, employee_id)

    def list(
        self,
        *,
        country: str | None,
        q: str | None,
        limit: int,
        offset: int,
    ) -> list[Employee]:
        stmt = select(Employee).order_by(Employee.id).limit(limit).offset(offset)
        if country is not None:
            stmt = stmt.where(Employee.country == country)
        if q:
            stmt = stmt.where(func.lower(Employee.full_name).like(f"%{q.lower()}%"))
        return list(self.db.scalars(stmt))

    def delete(self, employee: Employee) -> None:
        self.db.delete(employee)
        self.db.flush()
