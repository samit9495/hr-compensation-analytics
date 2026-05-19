import logging

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.exceptions import DomainError, EmployeeNotFound
from app.main import register_exception_handlers


def test_domainerror_is_mapped_to_500_with_code() -> None:
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/boom")
    def boom() -> None:
        raise DomainError("something failed")

    client = TestClient(app, raise_server_exceptions=False)
    response = client.get("/boom")

    assert response.status_code == 500
    body = response.json()
    assert body == {"detail": "something failed", "code": "domain_error"}


def test_domainerror_is_logged_at_warning_with_code(
    caplog: pytest.LogCaptureFixture,
) -> None:
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/missing")
    def missing() -> None:
        raise EmployeeNotFound(99)

    caplog.set_level(logging.WARNING)
    TestClient(app, raise_server_exceptions=False).get("/missing")

    domain_records = [
        r
        for r in caplog.records
        if r.levelno == logging.WARNING
        and getattr(r, "code", None) == "employee_not_found"
    ]
    assert domain_records, "expected one WARNING with code=employee_not_found"
    assert domain_records[0].status_code == 404
