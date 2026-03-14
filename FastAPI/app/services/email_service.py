import smtplib
import cloudinary.uploader
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings

def send_email(to_email: str, subject: str, body: str, is_html: bool = False):
    """
    Sends an email using Brevo SMTP.
    """
    msg = MIMEMultipart()
    msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html' if is_html else 'plain'))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.LOGIN, settings.SMTP_KEY)
            server.send_message(msg)
        return True
    except smtplib.SMTPException as e:
        print(f"SMTP error occurred: {e}")
        return False
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def upload_file(file, folder="documents", resource_type="auto"):
    """
    Uploads a file to Cloudinary.
    'file' can be a path, a file-like object, or a URL.
    """
    response = cloudinary.uploader.upload(
        file,
        folder=f"health_assistant/{folder}",
        resource_type=resource_type
    )
    return response.get("secure_url")

def send_reset_password_email(to_email: str, token: str):
    """
    Sends a password reset email.
    """
    # Use configured frontend URL
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "Reset Your Password - CPSU Health Assistant"
    body = f"""
    <html>
        <body>
            <h2>Reset Your Password</h2>
            <p>You requested a password reset for your account at CPSU Health Assistant.</p>
            <p>Click the link below to set a new password:</p>
            <a href="{reset_link}">{reset_link}</a>
            <p>If you did not request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        </body>
    </html>
    """
    return send_email(to_email, subject, body, is_html=True)
