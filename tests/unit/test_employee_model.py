from decimal import Decimal

from sqlalchemy import inspect
from sqlalchemy.orm import Session

from app.models.employee import Employee


def test_employee_table_is_named_employees(db: Session) -> None:
    assert "employees" in inspect(db.bind).get_table_names()


def test_employee_persists_required_fields(db: Session) -> None:
    employee = Employee(
        full_name="Jane Doe",
        job_title="Engineer",
        country="IN",
        salary=Decimal("50000.00"),
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)

    assert employee.id is not None
    assert employee.full_name == "Jane Doe"
    assert employee.salary == Decimal("50000.00")
