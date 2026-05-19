from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db


def test_get_db_yields_session_and_closes() -> None:
    gen = get_db()
    session = next(gen)

    assert isinstance(session, Session)
    assert session.execute(text("SELECT 1")).scalar() == 1

    closed = {"called": False}
    original_close = session.close

    def _spy() -> None:
        closed["called"] = True
        original_close()

    session.close = _spy  # type: ignore[method-assign]
    next(gen, None)
    assert closed["called"] is True
