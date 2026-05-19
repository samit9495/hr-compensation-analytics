import logging

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import register_exception_handlers


class TestUnhandledException:
    @staticmethod
    def _make_app() -> FastAPI:
        app = FastAPI()
        register_exception_handlers(app)

        @app.get("/boom")
        def boom() -> None:
            raise RuntimeError("kaboom")

        return app

    def test_returns_500_with_internal_error_code(self) -> None:
        response = TestClient(self._make_app(), raise_server_exceptions=False).get(
            "/boom"
        )

        assert response.status_code == 500
        assert response.json() == {
            "detail": "Internal server error",
            "code": "internal_error",
        }

    def test_is_logged_at_error_with_traceback(
        self,
        caplog: pytest.LogCaptureFixture,
    ) -> None:
        caplog.set_level(logging.ERROR)

        TestClient(self._make_app(), raise_server_exceptions=False).get("/boom")

        errors = [r for r in caplog.records if r.levelno == logging.ERROR]
        assert errors, "expected at least one ERROR log"

        record = errors[-1]
        assert record.exc_info is not None
        exc_type, exc_value, _tb = record.exc_info
        assert exc_type is RuntimeError
        assert "kaboom" in str(exc_value)
