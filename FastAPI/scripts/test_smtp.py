import asyncio
import os
import sys

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.email_service import send_email

async def test_smtp():
    print("Testing SMTP connection...")
    test_email = input("Enter an email address to send a test message to: ")
    if not test_email:
        print("Email address required.")
        return

    success = send_email(
        to_email=test_email,
        subject="SMTP Test - CPSU Health Assistant",
        body="If you received this, your SMTP settings are working correctly!",
        is_html=False
    )

    if success:
        print("\n✅ Success! Test email sent.")
    else:
        print("\n❌ Failed to send test email. Check the console for error logs.")

if __name__ == "__main__":
    asyncio.run(test_smtp())
