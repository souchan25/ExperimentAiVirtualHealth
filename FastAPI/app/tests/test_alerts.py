import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime

from app.main import app
from app.api.alerts import get_db, get_optional_user
from app.models import CampusAlert, User

# We don't want tests to block on actually trying to hit the DB
client = TestClient(app)

# Helper mock classes for DB
class MockResult:
    def __init__(self, data):
        self.data = data

    def scalars(self):
        return self

    def all(self):
        return self.data

class MockSession:
    def __init__(self, expected_roles):
        self.expected_roles = expected_roles
        self.executed_query_info = None
        self.stmt_criteria = []

    async def execute(self, stmt):
        # We can extract the where clauses from the statement
        # to verify our filtering logic.

        # Save the WHERE clauses (criteria) of the compiled statement
        # The whereclause is a boolean expression which we can introspect
        if hasattr(stmt, "_where_criteria"):
             self.stmt_criteria = [str(c.compile(compile_kwargs={"literal_binds": True})) for c in stmt._where_criteria]

        # Return some dummy alerts. We don't actually need to filter them here,
        # since the test is whether the correct query was generated.
        return MockResult([
            CampusAlert(id="123e4567-e89b-12d3-a456-426614174000", title="Test Alert", message="Test", severity="Low", target_role="all", is_active=True, created_by_id=1, created_at=datetime.now()),
        ])

def get_mock_db_with_roles(*roles):
    async def _mock_db():
        session = MockSession(roles)
        yield session
    return _mock_db

@pytest.fixture
def mock_db_session():
    return MockSession(expected_roles=["all"])

@pytest.fixture
def clear_overrides():
    app.dependency_overrides = {}
    yield
    app.dependency_overrides = {}

def test_get_active_alerts_unauthenticated(clear_overrides):
    mock_session = MockSession(["all"])

    async def mock_get_db():
        yield mock_session

    async def mock_get_optional_user():
        return None

    app.dependency_overrides[get_db] = mock_get_db
    app.dependency_overrides[get_optional_user] = mock_get_optional_user

    response = client.get("/alerts/")
    assert response.status_code == 200

    # Ensure target_role == 'all' is explicitly in the query
    criteria_str = " ".join(mock_session.stmt_criteria)
    assert "target_role = 'all'" in criteria_str

def test_get_active_alerts_student(clear_overrides):
    mock_session = MockSession(["student", "all"])

    async def mock_get_db():
        yield mock_session

    async def mock_get_optional_user():
        return User(id=1, role="student")

    app.dependency_overrides[get_db] = mock_get_db
    app.dependency_overrides[get_optional_user] = mock_get_optional_user

    response = client.get("/alerts/")
    assert response.status_code == 200

    # Ensure IN ('student', 'all') is in query
    criteria_str = " ".join(mock_session.stmt_criteria)
    assert "target_role IN ('student', 'all')" in criteria_str

def test_get_active_alerts_staff(clear_overrides):
    mock_session = MockSession(["staff", "all"])

    async def mock_get_db():
        yield mock_session

    async def mock_get_optional_user():
        return User(id=2, role="staff")

    app.dependency_overrides[get_db] = mock_get_db
    app.dependency_overrides[get_optional_user] = mock_get_optional_user

    response = client.get("/alerts/")
    assert response.status_code == 200

    # Ensure IN ('staff', 'all') is in query
    criteria_str = " ".join(mock_session.stmt_criteria)
    assert "target_role IN ('staff', 'all')" in criteria_str

def test_get_active_alerts_other_role(clear_overrides):
    mock_session = MockSession(["all"])

    async def mock_get_db():
        yield mock_session

    async def mock_get_optional_user():
        return User(id=3, role="admin")

    app.dependency_overrides[get_db] = mock_get_db
    app.dependency_overrides[get_optional_user] = mock_get_optional_user

    response = client.get("/alerts/")
    assert response.status_code == 200

    # Ensure "all" is queried, falling back to default
    criteria_str = " ".join(mock_session.stmt_criteria)
    assert "target_role = 'all'" in criteria_str
