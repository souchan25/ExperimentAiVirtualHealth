import pytest
from app.auth import get_current_user
from app.models import User
from app.main import app

@pytest.mark.asyncio
async def test_get_performance_admin_only(client):
    # Override get_current_user to return a regular student
    async def override_get_student():
        return User(id=1, school_id="student", name="Student", role="student")
    
    app.dependency_overrides[get_current_user] = override_get_student
    
    response = await client.get("/staff/performance")
    assert response.status_code == 403
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_performance_success(client):
    # Override get_current_user to return an admin
    async def override_get_admin():
        return User(id=1, school_id="admin", name="Admin", role="admin")
    
    app.dependency_overrides[get_current_user] = override_get_admin
    
    response = await client.get("/staff/performance")
    assert response.status_code == 200
    data = response.json()
    assert "latency_ms" in data
    assert "status" in data
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_optimize_cache(client):
    # Override get_current_user to return an admin
    async def override_get_admin():
        return User(id=1, school_id="admin", name="Admin", role="admin")
    
    app.dependency_overrides[get_current_user] = override_get_admin
    
    response = await client.post("/staff/optimize-cache")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "timestamp" in data
    app.dependency_overrides.clear()
