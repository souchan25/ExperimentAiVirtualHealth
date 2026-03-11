import pytest
from app.services.llm import _extract_json_from_text

def test_extract_json_from_text_dict():
    text = "```json\n{\"symptoms\": [\"fever\"], \"duration_days\": 3, \"severity\": 1}\n```"
    result = _extract_json_from_text(text)
    assert result == {"symptoms": ["fever"], "duration_days": 3, "severity": 1}

def test_extract_json_from_text_list():
    text = "Here is your data: [1, 2, 3] enjoy!"
    result = _extract_json_from_text(text)
    assert result == [1, 2, 3]

def test_extract_json_from_text_no_json():
    text = "Just a plain string without any JSON"
    result = _extract_json_from_text(text)
    assert result is None

def test_extract_json_from_text_nested():
    text = "Prefix {\"data\": {\"nested\": [1,2,3]}} Suffix"
    result = _extract_json_from_text(text)
    assert result == {"data": {"nested": [1,2,3]}}

def test_extract_json_from_text_malformed():
    text = "Prefix {\"data\": \"unterminated string} Suffix"
    result = _extract_json_from_text(text)
    assert result is None
