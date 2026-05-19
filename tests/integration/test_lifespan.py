from sqlalchemy import Column, Integer, Table, create_engine, inspect

from app.db.base import Base
from app.db.session import init_db


def test_init_db_creates_registered_tables() -> None:
    Table(
        "_init_db_smoke",
        Base.metadata,
        Column("id", Integer, primary_key=True),
        extend_existing=True,
    )
    eng = create_engine("sqlite:///:memory:", future=True)
    try:
        init_db(eng)
        assert "_init_db_smoke" in set(inspect(eng).get_table_names())
    finally:
        Base.metadata.remove(Base.metadata.tables["_init_db_smoke"])
        eng.dispose()
