import os
import subprocess
import sys
from pathlib import Path

import pytest

from app.database import read_database_url


BACKEND_ROOT = Path(__file__).resolve().parents[1]


def test_missing_database_url_does_not_fall_back_to_sqlite():
    environment = os.environ.copy()
    environment["DATABASE_URL"] = ""

    result = subprocess.run(
        [sys.executable, "-c", "import app.database"],
        cwd=BACKEND_ROOT,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode != 0
    assert "DATABASE_URL이 없습니다" in result.stderr


def test_postgres_connection_uses_psycopg(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgres://example-host/example-database")

    database_url = read_database_url()

    assert database_url.drivername == "postgresql+psycopg"


def test_unsupported_database_type_is_rejected(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "mysql://example-host/example-database")

    with pytest.raises(RuntimeError, match="PostgreSQL"):
        read_database_url()


def test_sqlite_is_rejected_outside_automated_tests(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "sqlite:///local.sqlite3")
    monkeypatch.delenv("BUILDLOG_TESTING", raising=False)

    with pytest.raises(RuntimeError, match="PostgreSQL"):
        read_database_url()
