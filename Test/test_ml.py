import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

# Since FastAPI is a sub-directory, we need to ensure it's in the path or import directly
import sys
import os

# Add FastAPI to sys.path so we can import its modules
fastapi_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'FastAPI'))
sys.path.insert(0, fastapi_path)

from app.services.ml import MLPredictor
from app.config import settings

def test_ml_predictor_fallback_model_missing(capsys):
    """
    Test that MLPredictor correctly enters fallback mode when the model path does not exist.
    """
    # Create a mock path that returns False for exists()
    mock_path = MagicMock(spec=Path)
    mock_path.exists.return_value = False
    mock_path.__str__.return_value = "mock/path/model.pkl"

    with patch.object(MLPredictor, '_resolve_existing_path', return_value=mock_path):
        # We also want to prevent _load_metadata from doing anything to keep the test isolated
        with patch.object(MLPredictor, '_load_metadata'):
            # Initialize predictor
            predictor = MLPredictor()

            # _load_model is called in __init__
            assert predictor.model is None
            assert predictor.feature_names == []

            # Check if fallback message was printed
            captured = capsys.readouterr()
            assert f"ML model not found at '{mock_path}'. Using fallback prediction mode." in captured.out

def test_ml_predictor_fallback_load_error(capsys):
    """
    Test that MLPredictor handles exceptions during model loading.
    """
    # Create a mock path that returns True for exists()
    mock_path = MagicMock(spec=Path)
    mock_path.exists.return_value = True
    mock_path.__str__.return_value = "mock/path/model.pkl"

    with patch.object(MLPredictor, '_resolve_existing_path', return_value=mock_path):
        with patch.object(MLPredictor, '_load_metadata'):
            # Mock open to raise an exception
            with patch('builtins.open', side_effect=Exception("Simulated load error")):
                predictor = MLPredictor()

                assert predictor.model is None
                assert predictor.feature_names == []

                captured = capsys.readouterr()
                assert f"Failed to load ML model from '{mock_path}': Simulated load error" in captured.out
