import pytest
from unittest.mock import patch, MagicMock
from app.services.email_service import send_email, send_reset_password_email
from app.config import settings

@patch("app.services.email_service.smtplib.SMTP")
def test_send_email_success_plain_text(mock_smtp):
    # Arrange
    mock_server = MagicMock()
    mock_smtp.return_value.__enter__.return_value = mock_server

    to_email = "test@example.com"
    subject = "Test Subject"
    body = "Test Body"

    # Act
    result = send_email(to_email, subject, body, is_html=False)

    # Assert
    assert result is True
    mock_smtp.assert_called_once_with(settings.SMTP_SERVER, settings.PORT)
    mock_server.starttls.assert_called_once()
    mock_server.login.assert_called_once_with(settings.LOGIN, settings.SMTP_KEY)
    mock_server.send_message.assert_called_once()

    # Check the message payload
    sent_msg = mock_server.send_message.call_args[0][0]
    assert sent_msg['To'] == to_email
    assert sent_msg['Subject'] == subject
    assert sent_msg['From'] == f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    assert sent_msg.get_payload()[0].get_content_type() == "text/plain"
    # Depending on Python version, MIMEText payload might or might not have a trailing newline
    assert sent_msg.get_payload()[0].get_payload().strip() == "Test Body"

@patch("app.services.email_service.smtplib.SMTP")
def test_send_email_success_html(mock_smtp):
    # Arrange
    mock_server = MagicMock()
    mock_smtp.return_value.__enter__.return_value = mock_server

    to_email = "test@example.com"
    subject = "Test Subject"
    body = "<p>Test Body</p>"

    # Act
    result = send_email(to_email, subject, body, is_html=True)

    # Assert
    assert result is True
    sent_msg = mock_server.send_message.call_args[0][0]
    assert sent_msg.get_payload()[0].get_content_type() == "text/html"
    assert sent_msg.get_payload()[0].get_payload().strip() == "<p>Test Body</p>"

@patch("app.services.email_service.smtplib.SMTP")
def test_send_email_failure_catches_exception(mock_smtp):
    # Arrange
    # Configure SMTP mock to raise an exception when entering the context manager
    mock_smtp.side_effect = Exception("SMTP connection failed")

    to_email = "test@example.com"
    subject = "Test Subject"
    body = "Test Body"

    # Act
    result = send_email(to_email, subject, body)

    # Assert
    assert result is False

@patch("app.services.email_service.send_email")
def test_send_reset_password_email(mock_send_email):
    # Arrange
    mock_send_email.return_value = True
    to_email = "test@example.com"
    token = "dummy-token"

    # Act
    result = send_reset_password_email(to_email, token)

    # Assert
    assert result is True
    mock_send_email.assert_called_once()

    # Check what was passed to send_email
    args, kwargs = mock_send_email.call_args
    assert args[0] == to_email
    assert "Reset Your Password" in args[1]
    assert "localhost:3000/reset-password?token=dummy-token" in args[2]
    assert kwargs.get("is_html") is True
