"""Structured JSON logging for the Salary Management backend.

Provides:

* ``request_id_var`` — a :class:`contextvars.ContextVar` populated by the
  request-context middleware so every log emitted while handling a
  request carries the same correlation id.
* :class:`JsonFormatter` — renders :class:`logging.LogRecord` to a single
  JSON line. Standard fields plus any "extras" attached via
  ``logger.info("...", extra={...})`` and the current ``request_id``.
* :func:`configure_logging` — idempotent root-logger configuration.
  Installs (or replaces) a single stdout handler with the JSON formatter,
  without touching unrelated handlers (so pytest's ``caplog`` keeps
  working).
"""
from __future__ import annotations

import json
import logging
import sys
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any

request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)

_HANDLER_MARKER = "_salary_management_handler"

# All standard ``LogRecord`` attributes; anything else on a record is an
# "extra" and gets surfaced in the JSON payload.
_RESERVED_LOG_RECORD_ATTRS: frozenset[str] = frozenset(
    logging.LogRecord("", 0, "", 0, "", None, None).__dict__
) | {"message", "asctime"}


class JsonFormatter(logging.Formatter):
    """Render a log record as a single line of JSON."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(
                record.created, tz=timezone.utc
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        request_id = request_id_var.get()
        if request_id is not None:
            payload["request_id"] = request_id

        for key, value in record.__dict__.items():
            if key in _RESERVED_LOG_RECORD_ATTRS or key.startswith("_"):
                continue
            payload[key] = value

        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str, sort_keys=False)


def configure_logging(level: str | int = "INFO") -> None:
    """Configure the root logger to emit JSON to stdout.

    Idempotent: re-running replaces our handler (identified by the
    ``_salary_management_handler`` marker) without disturbing unrelated
    handlers such as pytest's ``caplog`` capture handler.
    """
    root = logging.getLogger()

    for handler in list(root.handlers):
        if getattr(handler, _HANDLER_MARKER, False):
            root.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    setattr(handler, _HANDLER_MARKER, True)
    root.addHandler(handler)

    root.setLevel(level)
