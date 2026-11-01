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

    # Safe auto-migration for newly added SQLite columns
    if str(engine.url).startswith("sqlite"):
        try:
            with engine.begin() as conn:
                res = conn.exec_driver_sql("PRAGMA table_info(users)")
                existing = {row[1] for row in res.fetchall()}
                user_columns = {
                    "username": "VARCHAR(100)",
                    "date_of_birth": "VARCHAR(50)",
                    "base_location": "VARCHAR(150)",
                    "travel_preferences": "TEXT",
                }
                for col, col_type in user_columns.items():
                    if col not in existing:
                        conn.exec_driver_sql(f"ALTER TABLE users ADD COLUMN {col} {col_type}")
        except Exception as e:
            print(f"Warning: SQLite auto-migration skipped: {e}")


def drop_database() -> None:
    Base.metadata.drop_all(bind=engine)
