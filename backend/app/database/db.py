from collections.abc import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


database_url = settings.DATABASE_URL

connect_args = {}

if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 15}
    # Anchor relative SQLite database URLs to the canonical backend directory
    # so that the database connection is uniform regardless of whether uvicorn
    # is started from repository root (d:\tripgenius) or from backend\
    db_file = settings.sqlite_database_file
    database_url = f"sqlite:///{db_file.as_posix()}"

engine = create_engine(
    database_url,
    connect_args=connect_args,
    echo=settings.APP_DEBUG,
    future=True,
    pool_pre_ping=True,
)

# Configure SQLite high-concurrency PRAGMAs:
# - WAL (Write-Ahead Logging) allows concurrent readers alongside writers
# - busy_timeout gives concurrent queries a 5-second buffer before timing out
# - synchronous=NORMAL optimizes disk writes without risking database corruption
if database_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.close()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def create_database() -> None:
    Base.metadata.create_all(bind=engine)


def drop_database() -> None:
    Base.metadata.drop_all(bind=engine)
