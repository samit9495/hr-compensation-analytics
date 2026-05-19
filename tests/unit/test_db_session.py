from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db


def test_get_db_yields_session_and_closes() -> None:
    gen = get_db()
    session = next(gen)

    assert isinstance(session, Session)
    assert session.execute(text("SELECT 1")).scalar() == 1

    next(gen, None)
    assert not session.is_active
