import logging

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.middleware.request_context import (
    REQUEST_ID_HEADER,
    RequestContextMiddleware,
)
from app.core.logging import request_id_var
from app.main import register_exception_handlers

MIDDLEWARE_LOGGER = "app.api.middleware.request_context"


@pytest.fixture
def fixture_app() -> FastAPI:
    test_app = FastAPI()
    test_app.add_middleware(RequestContextMiddleware)

    @test_app.get("/echo-id")
    def echo_id() -> dict[str, str | None]:
        return {"request_id": request_id_var.get()}

    @test_app.get("/")
    def root() -> dict[str, str]:
        return {"status": "ok"}

    return test_app


def test_generates_request_id_when_inbound_header_absent(
    fixture_app: FastAPI,
) -> None:
    response = TestClient(fixture_app).get("/echo-id")

    assert response.status_code == 200
    request_id = response.headers.get(REQUEST_ID_HEADER)
    assert request_id
    assert response.json()["request_id"] == request_id


def test_echoes_inbound_request_id_header(fixture_app: FastAPI) -> None:
    response = TestClient(fixture_app).get(
        "/echo-id", headers={REQUEST_ID_HEADER: "trace-123"}
    )

    assert response.headers[REQUEST_ID_HEADER] == "trace-123"
    assert response.json()["request_id"] == "trace-123"


def test_emits_one_info_access_log_per_request(
    fixture_app: FastAPI,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.DEBUG)

    response = TestClient(fixture_app).get("/echo-id")

    records = [r for r in caplog.records if r.name == MIDDLEWARE_LOGGER]
    assert len(records) == 1
    record = records[0]
    assert record.levelno == logging.INFO
    assert record.method == "GET"
    assert record.path == "/echo-id"
    assert record.status_code == 200
    assert isinstance(record.duration_ms, float)
    assert record.duration_ms >= 0
    assert record.request_id == response.headers[REQUEST_ID_HEADER]


def test_health_check_logs_at_debug_not_info(
    fixture_app: FastAPI,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.DEBUG)

    TestClient(fixture_app).get("/")

    middleware_records = [r for r in caplog.records if r.name == MIDDLEWARE_LOGGER]
    assert len(middleware_records) == 1
    assert middleware_records[0].levelno == logging.DEBUG
    assert middleware_records[0].path == "/"


def test_emits_access_log_with_500_when_handler_raises(
    caplog: pytest.LogCaptureFixture,
) -> None:
    """The access log must still fire when the route raises.

    Starlette's ``ServerErrorMiddleware`` sits *outside* this user
    middleware, so an unhandled exception bubbles past
    :meth:`RequestContextMiddleware.dispatch` before any post-call code
    runs. Without an emit-on-error path the middleware silently drops
    the request from the structured access log, leaving operators
    blind to the very requests that need most attention.

    Locks that contract in so the error path is observable end-to-end.
    """
    app = FastAPI()
    app.add_middleware(RequestContextMiddleware)
    register_exception_handlers(app)

    @app.get("/boom")
    def boom() -> None:
        raise RuntimeError("kaboom")

    caplog.set_level(logging.DEBUG)

    response = TestClient(app, raise_server_exceptions=False).get("/boom")

    assert response.status_code == 500

    records = [r for r in caplog.records if r.name == MIDDLEWARE_LOGGER]
    assert len(records) == 1
    record = records[0]
    assert record.levelno == logging.INFO
    assert record.method == "GET"
    assert record.path == "/boom"
    assert record.status_code == 500
    assert isinstance(record.duration_ms, float)
    assert record.duration_ms >= 0
    # ``ServerErrorMiddleware`` wraps the response *above* this
    # middleware on the error path, so no ``X-Request-ID`` header reaches
    # the client. The log record is the only correlation handle, so it
    # must still carry a non-empty request id.
    assert isinstance(record.request_id, str) and record.request_id
