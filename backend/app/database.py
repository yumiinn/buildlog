import os
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.exc import ArgumentError
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


BACKEND_ROOT = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_ROOT / ".env")


def read_database_url() -> URL:
    raw_database_url = os.getenv("DATABASE_URL", "").strip()
    if not raw_database_url:
        raise RuntimeError(
            "DATABASE_URL이 없습니다. backend/.env를 만들고 "
            "Supabase Session pooler 연결 정보를 입력해 주세요."
        )

    try:
        database_url = make_url(raw_database_url)
    except ArgumentError as error:
        raise RuntimeError(
            "DATABASE_URL 형식을 읽을 수 없습니다. "
            "Supabase에서 복사한 Session pooler 연결 정보인지 확인해 주세요."
        ) from error

    backend_name = database_url.get_backend_name()
    if backend_name in {"postgres", "postgresql"}:
        return database_url.set(drivername="postgresql+psycopg")
    if backend_name == "sqlite" and os.getenv("BUILDLOG_TESTING") == "1":
        return database_url
    raise RuntimeError("DATABASE_URL은 PostgreSQL 연결 정보여야 합니다.")


DATABASE_URL = read_database_url()
is_sqlite = DATABASE_URL.get_backend_name() == "sqlite"

connect_args = {"check_same_thread": False} if is_sqlite else {"sslmode": "require"}
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=not is_sqlite,
    hide_parameters=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
