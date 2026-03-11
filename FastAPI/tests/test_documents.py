import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

# Add the parent directory to sys.path if needed or run pytest from FastAPI dir
from app.main import app
from app.database import get_db
from app.auth import get_current_user
from app.models import User

# Create a mock user
mock_user = User(
    id=1,
    school_id="12345",
    name="Test User",
    email="test@example.com",
    role="student"
)

# Mock the dependency to return the mock user
async def override_get_current_user():
    return mock_user

# Mock the database dependency
async def override_get_db():
    session = MagicMock(spec=AsyncSession)
    yield session

# Apply overrides
app.dependency_overrides[get_current_user] = override_get_current_user
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_upload_document_cloudinary_error():
    """
    Test that when Cloudinary upload fails, the endpoint returns a 500 error
    with the appropriate error detail.
    """
    # Create a dummy file for the upload
    files = {"file": ("test.pdf", b"dummy content", "application/pdf")}
    data = {"document_type": "medical_certificate"}

    # Patch the cloudinary_upload function where it's imported in documents.py
    with patch("app.api.documents.cloudinary_upload") as mock_upload:
        # Configure the mock to raise an exception
        mock_upload.side_effect = Exception("Mock Cloudinary Error")

        # Call the endpoint
        response = client.post("/documents/upload", files=files, data=data)

        # Assert the expected behavior
        assert response.status_code == 500
        assert response.json() == {"detail": "Cloudinary upload failed: Mock Cloudinary Error"}

        # Verify the mock was called
        mock_upload.assert_called_once()
