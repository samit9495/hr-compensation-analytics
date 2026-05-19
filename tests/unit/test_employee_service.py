from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate
from app.services.employee_service import EmployeeService


class TestEmployeeServiceCreate:
    def test_create_persists_employee_and_returns_with_id(self, db: Session) -> None:
        payload = EmployeeCreate(
            full_name="Jane Doe",
            job_title="Engineer",
            country="IN",
            salary=Decimal("50000.00"),
        )
        created = EmployeeService(db).create(payload)

        assert created.id is not None
        assert created.full_name == "Jane Doe"
        assert db.get(Employee, created.id).salary == Decimal("50000.00")
