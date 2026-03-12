import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import io
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.mark.asyncio
async def test_upload_document_success(client):
    """
    Test successful document upload.
    Mocks Cloudinary upload and OpenAI extraction.
    """
    # Create a mock file
    file_content = b"fake image content"
    mock_file = ("test_image.png", file_content, "image/png")

    mock_extracted_data = {
        "patient_name": "John Doe",
        "date": "2023-10-27",
        "test_type": "Blood Test",
        "results": [{"key": "Glucose", "value": "90 mg/dL"}],
        "summary": "Normal levels."
    }

    with patch("app.api.documents.cloudinary_upload") as mock_cloudinary_upload:
        mock_cloudinary_upload.return_value = "https://res.cloudinary.com/demo/image/upload/v1234567890/health_assistant/documents/test_image.png"

        # In the endpoint it imports `AsyncOpenAI` from `openai` inside the route function.
        # We need to patch it in the `openai` module directly if possible, or where it's imported.
        # The best way to catch an import inside a function is to patch `sys.modules` or just patch `openai.AsyncOpenAI`.
        with patch("openai.AsyncOpenAI") as mock_openai_class:
            mock_openai_instance = MagicMock()
            mock_openai_class.return_value = mock_openai_instance

            # Setup the nested async mock for chat.completions.create
            mock_create = AsyncMock()
            mock_message = MagicMock()

            import json
            mock_message.content = f"```json\n{json.dumps(mock_extracted_data)}\n```"

            mock_choice = MagicMock()
            mock_choice.message = mock_message

            mock_response = MagicMock()
            mock_response.choices = [mock_choice]

            mock_create.return_value = mock_response
            mock_openai_instance.chat.completions.create = mock_create

            # Ensure the Gemini API key is set so the vision extraction path runs.
            with patch("app.api.documents.settings.GEMINI_API_KEY", "test-key-123"):

                # Make the request
                data = {"document_type": "lab_result"}
                files = {"file": mock_file}

                response = await client.post("/documents/upload", data=data, files=files)

                # Assertions
                assert response.status_code == 200

                # Verify mock calls
                mock_cloudinary_upload.assert_called_once()
                mock_create.assert_called_once()

                # Check response data
                response_data = response.json()
                assert response_data["document_type"] == "lab_result"
                assert response_data["file_name"] == "test_image.png"
                assert response_data["file_path"] == "https://res.cloudinary.com/demo/image/upload/v1234567890/health_assistant/documents/test_image.png"
                assert response_data["status"] == "pending"

                # Verify extracted data is present
                assert response_data["extracted_data"] == mock_extracted_data
                assert response_data["ai_confidence"] == 0.95
                assert response_data["student_id"] == 1 # Based on the mock user in conftest.py
