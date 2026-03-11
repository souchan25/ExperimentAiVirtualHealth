import pytest
from unittest.mock import patch, AsyncMock

from app.services.llm import predict_disease

@pytest.mark.asyncio
async def test_predict_disease_success():
    """Test predict_disease with a list of symptoms and default target."""
    symptoms = ["headache", "fever"]
    expected_response = "You likely have a common cold."

    with patch('app.services.llm.generate_chat_response', new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = expected_response

        result = await predict_disease(symptoms)

        # Verify the result structure
        assert result["prediction"] == expected_response
        assert result["confidence"] == 0.0
        assert "disclaimer" in result

        # Verify generate_chat_response was called correctly
        mock_generate.assert_called_once()
        call_args = mock_generate.call_args
        messages = call_args[0][0]

        assert len(messages) == 2
        assert messages[0]["role"] == "system"
        assert "medical AI assistant" in messages[0]["content"]
        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "Symptoms: headache, fever"
        assert call_args[1].get("target", "auto") == "auto"

@pytest.mark.asyncio
async def test_predict_disease_empty_symptoms():
    """Test predict_disease with an empty list of symptoms."""
    symptoms = []
    expected_response = "Please provide symptoms."

    with patch('app.services.llm.generate_chat_response', new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = expected_response

        result = await predict_disease(symptoms)

        assert result["prediction"] == expected_response

        mock_generate.assert_called_once()
        call_args = mock_generate.call_args
        messages = call_args[0][0]

        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "Symptoms: "

@pytest.mark.asyncio
async def test_predict_disease_custom_target():
    """Test predict_disease with a custom target."""
    symptoms = ["cough"]
    custom_target = "groq"
    expected_response = "Could be allergies."

    with patch('app.services.llm.generate_chat_response', new_callable=AsyncMock) as mock_generate:
        mock_generate.return_value = expected_response

        result = await predict_disease(symptoms, target=custom_target)

        assert result["prediction"] == expected_response

        mock_generate.assert_called_once()
        assert mock_generate.call_args[1].get("target") == custom_target

@pytest.mark.asyncio
async def test_predict_disease_exception():
    """Test predict_disease handles exceptions from generate_chat_response if they bubble up."""
    symptoms = ["rash"]

    with patch('app.services.llm.generate_chat_response', new_callable=AsyncMock) as mock_generate:
        mock_generate.side_effect = Exception("API failure")

        with pytest.raises(Exception, match="API failure"):
            await predict_disease(symptoms)
