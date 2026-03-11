import pytest
import uuid
from datetime import date, datetime
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.models import User, Medication
from app.auth import get_current_user
from app.database import get_db

async def override_get_current_user():
    return User(id=1, email="test@example.com")

class MockResult:
    def __init__(self, data):
        self.data = data
    def scalars(self):
        return self
    def all(self):
        return self.data

class MockSession:
    async def execute(self, query):
        med_id = uuid.uuid4()
        return MockResult([Medication(
            id=med_id,
            student_id=1,
            name="Test Med",
            dosage="10mg",
            frequency="Daily",
            schedule_times=["08:00"],
            start_date=date.today(),
            end_date=date.today(),
            instructions="Take with water",
            purpose="Testing",
            is_active=True,
            created_at=datetime.now()
        )])

class MockEmptySession:
    async def execute(self, query):
        return MockResult([])

async def override_get_db():
    yield MockSession()

async def override_get_empty_db():
    yield MockEmptySession()

@pytest.fixture
def mock_dependencies():
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def mock_empty_dependencies():
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_empty_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def mock_unauthorized_dependencies():
    # Only override the database so we don't hit the real one, but leave get_current_user to fail correctly
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_medications_success(mock_dependencies):
    """Test retrieving medications for the current user successfully."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/medications/")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["name"] == "Test Med"
    assert data[0]["dosage"] == "10mg"
    assert data[0]["frequency"] == "Daily"
    assert data[0]["instructions"] == "Take with water"
    assert data[0]["purpose"] == "Testing"
    assert "id" in data[0]

@pytest.mark.asyncio
async def test_get_medications_empty(mock_empty_dependencies):
    """Test retrieving medications when the user has none."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/medications/")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

@pytest.mark.asyncio
async def test_get_medications_unauthorized(mock_unauthorized_dependencies):
    """Test retrieving medications without authentication."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/medications/")

    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}
