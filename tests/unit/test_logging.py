import json
import logging
import sys
from collections.abc import Iterator

import pytest

from app.core.logging import JsonFormatter, configure_logging, request_id_var


@pytest.fixture(autouse=True)
def _reset_root_logger() -> Iterator[None]:
    """Restore the root logger after each test so module-level state does
    not leak between tests (or into other test modules)."""
    yield
    root = logging.getLogger()
    for handler in list(root.handlers):
        if getattr(handler, "_salary_management_handler", False):
            root.removeHandler(handler)
    root.setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def _make_record(
    *,
    name: str = "app.test",
    level: int = logging.INFO,
    msg: str = "hello",
    exc_info: object = None,
) -> logging.LogRecord:
    return logging.LogRecord(
        name=name,
        level=level,
        pathname="x.py",
        lineno=1,
        msg=msg,
        args=(),
        exc_info=exc_info,  # type: ignore[arg-type]
    )


class TestJsonFormatter:
    @staticmethod
    def _format(record: logging.LogRecord) -> dict[str, object]:
        return json.loads(JsonFormatter().format(record))

    def test_emits_required_fields(self) -> None:
        out = self._format(_make_record(msg="hello"))

        assert out["level"] == "INFO"
        assert out["logger"] == "app.test"
        assert out["message"] == "hello"
        assert "timestamp" in out

    def test_includes_request_id_when_contextvar_set(self) -> None:
        token = request_id_var.set("req-abc")
        try:
            out = self._format(_make_record())
        finally:
            request_id_var.reset(token)

        assert out["request_id"] == "req-abc"

    def test_omits_request_id_when_contextvar_unset(self) -> None:
        out = self._format(_make_record())

        assert "request_id" not in out

    def test_includes_extra_attributes_attached_to_record(self) -> None:
        record = _make_record()
        record.employee_id = 42  # type: ignore[attr-defined]
        record.country = "IN"  # type: ignore[attr-defined]

        out = self._format(record)

        assert out["employee_id"] == 42
        assert out["country"] == "IN"

    def test_serializes_exception_info(self) -> None:
        try:
            raise ValueError("boom")
        except ValueError:
            record = _make_record(level=logging.ERROR, msg="oops", exc_info=sys.exc_info())

        out = self._format(record)

        assert "exc_info" in out
        assert "ValueError" in str(out["exc_info"])
        assert "boom" in str(out["exc_info"])


class TestConfigureLogging:
    def test_installs_a_single_marked_handler_even_if_called_twice(self) -> None:
        configure_logging("INFO")
        configure_logging("INFO")

        marked = [
            h
            for h in logging.getLogger().handlers
            if getattr(h, "_salary_management_handler", False)
        ]
        assert len(marked) == 1

    def test_does_not_remove_unrelated_handlers(self) -> None:
        root = logging.getLogger()
        external = logging.NullHandler()
        root.addHandler(external)
        try:
            configure_logging("INFO")
            assert external in root.handlers
        finally:
            root.removeHandler(external)

    def test_sets_root_level_from_string(self) -> None:
        configure_logging("DEBUG")

        assert logging.getLogger().level == logging.DEBUG

    def test_marked_handler_uses_json_formatter(self) -> None:
        configure_logging("INFO")

        marked = next(
            h
            for h in logging.getLogger().handlers
            if getattr(h, "_salary_management_handler", False)
        )
        assert isinstance(marked.formatter, JsonFormatter)
