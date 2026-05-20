from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.services.compensation_analysis_service import CompensationAnalysisService


def _add(db: Session, *, country: str, title: str, salary: str, name: str = "X") -> Employee:
    employee = Employee(
        full_name=name,
        job_title=title,
        country=country,
        salary=Decimal(salary),
    )
    db.add(employee)
    db.flush()
    return employee


class TestCompensationAnalysisService:
    def test_returns_empty_dict_when_no_employees(self, db: Session) -> None:
        assert CompensationAnalysisService(db).analyze() == {}

    def test_compa_ratio_is_one_when_peer_group_is_single_employee(self, db: Session) -> None:
        e = _add(db, country="IN", title="Engineer", salary="100")
        db.commit()

        result = CompensationAnalysisService(db).analyze()

        assert result[e.id]["compa_ratio"] == Decimal("1.0000")
        assert result[e.id]["range_penetration"] == Decimal("0.0000")

    def test_compa_ratio_is_salary_divided_by_peer_average(self, db: Session) -> None:
        underpaid = _add(db, country="IN", title="Engineer", salary="80")
        midpoint = _add(db, country="IN", title="Engineer", salary="100")
        top = _add(db, country="IN", title="Engineer", salary="120")
        db.commit()

        result = CompensationAnalysisService(db).analyze()

        # peer avg = 100, so compa = salary / 100
        assert result[underpaid.id]["compa_ratio"] == Decimal("0.8000")
        assert result[midpoint.id]["compa_ratio"] == Decimal("1.0000")
        assert result[top.id]["compa_ratio"] == Decimal("1.2000")

    def test_range_penetration_is_position_within_peer_min_max(self, db: Session) -> None:
        bottom = _add(db, country="IN", title="Engineer", salary="50")
        mid = _add(db, country="IN", title="Engineer", salary="100")
        ceiling = _add(db, country="IN", title="Engineer", salary="150")
        db.commit()

        result = CompensationAnalysisService(db).analyze()

        # (salary - min) / (max - min)
        assert result[bottom.id]["range_penetration"] == Decimal("0.0000")
        assert result[mid.id]["range_penetration"] == Decimal("0.5000")
        assert result[ceiling.id]["range_penetration"] == Decimal("1.0000")

    def test_peer_group_is_case_insensitive_on_title(self, db: Session) -> None:
        a = _add(db, country="IN", title="Engineer", salary="100")
        b = _add(db, country="IN", title="engineer", salary="200")
        db.commit()

        result = CompensationAnalysisService(db).analyze()

        # peer avg = 150 across both case variants
        assert result[a.id]["compa_ratio"] == Decimal("0.6667")
        assert result[b.id]["compa_ratio"] == Decimal("1.3333")

    def test_filters_restrict_returned_keys(self, db: Session) -> None:
        in_engineer = _add(db, country="IN", title="Engineer", salary="100")
        _add(db, country="US", title="Engineer", salary="200")
        db.commit()

        result = CompensationAnalysisService(db).analyze(country="IN")

        assert set(result.keys()) == {in_engineer.id}
