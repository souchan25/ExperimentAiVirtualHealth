import unittest
from unittest.mock import patch
from app.services.email_service import send_reset_password_email

class TestEmailService(unittest.TestCase):
    @patch('app.services.email_service.send_email')
    def test_send_reset_password_email(self, mock_send_email):
        # Arrange
        mock_send_email.return_value = True
        to_email = "test@example.com"
        token = "test_token_123"
        expected_reset_link = f"http://localhost:3000/reset-password?token={token}"

        # Act
        result = send_reset_password_email(to_email, token)

        # Assert
        self.assertTrue(result)

        # Verify send_email was called once
        mock_send_email.assert_called_once()

        # Get the arguments passed to send_email
        args, kwargs = mock_send_email.call_args

        self.assertEqual(args[0], to_email)
        self.assertEqual(args[1], "Reset Your Password - CPSU Health Assistant")

        # Verify the HTML body contains the correct token and link
        body = args[2]
        self.assertIn("<html>", body)
        self.assertIn("Reset Your Password", body)
        self.assertIn(f'<a href="{expected_reset_link}">{expected_reset_link}</a>', body)

        # Verify keyword arguments
        self.assertTrue(kwargs.get('is_html'))
        self.assertEqual(kwargs['is_html'], True)

if __name__ == '__main__':
    unittest.main()
