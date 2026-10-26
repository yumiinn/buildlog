import os
import secrets
import sys
import tempfile
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient


TEST_DATABASE_PATH = Path(tempfile.gettempdir()) / f"buildlog_test_{uuid4().hex}.sqlite3"
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DATABASE_PATH.as_posix()}"
os.environ["APP_SECRET_KEY"] = secrets.token_urlsafe(32)
os.environ["BUILDLOG_TESTING"] = "1"

from app.database import Base, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session", autouse=True)
def remove_test_database():
    yield
    engine.dispose()
    TEST_DATABASE_PATH.unlink(missing_ok=True)
