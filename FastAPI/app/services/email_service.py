import smtplib
import json
import urllib.request
import urllib.error
import cloudinary.uploader
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..config import settings

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_email_smtp(to_email: str, subject: str, body: str, is_html: bool = False):
    """
    Sends an email using Brevo SMTP.
    """
    msg = MIMEMultipart()
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(body, "html" if is_html else "plain"))

    try:
        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.LOGIN, settings.SMTP_KEY)
            server.send_message(msg)
        return True
    except smtplib.SMTPException as e:
        print(f"SMTP error occurred: {e}")
        return False
    except Exception as e:
        print(f"Error sending email via SMTP: {e}")
        return False


def send_email_via_brevo_api(
    to_email: str, subject: str, body: str, is_html: bool = False
):
    """
    Sends an email using Brevo HTTP API (recommended for Railway).
    """
    if not settings.BREVO_API_KEY:
        print("BREVO_API_KEY is not configured; skipping Brevo API send.")
        return False

    payload = {
        "sender": {
            "name": settings.EMAILS_FROM_NAME,
            "email": settings.EMAILS_FROM_EMAIL,
        },
        "to": [{"email": to_email}],
        "subject": subject,
        "htmlContent" if is_html else "textContent": body,
    }

    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json",
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        BREVO_API_URL, data=data, headers=headers, method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.getcode()
            if status in (200, 201, 202):
                return True
            print(f"Brevo API returned unexpected status: {status}")
            return False
    except urllib.error.HTTPError as e:
        print(f"Brevo API HTTP error: {e.code} {e.reason}")
        return False
    except Exception as e:
        print(f"Error sending email via Brevo API: {e}")
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
      <head>
        <meta charset="UTF-8" />
        <title>Reset Your Password</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:24px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#16a34a,#22c55e);padding:20px 24px;color:#ecfdf3;">
                    <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:0.02em;">
                      CPSU Virtual Health Assistant
                    </h1>
                    <p style="margin:4px 0 0;font-size:13px;opacity:0.9;">
                      Secure password reset request
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 24px 8px 24px;color:#111827;">
                    <h2 style="margin:0 0 8px 0;font-size:18px;font-weight:700;">
                      Reset your password
                    </h2>
                    <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#4b5563;">
                      We received a request to reset the password for your CPSU Health Assistant account.
                    </p>
                    <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#4b5563;">
                      Click the button below to choose a new password. For your security, this link will only be valid for
                      <strong>1 hour</strong>.
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 20px auto;">
                      <tr>
                        <td align="center" bgcolor="#16a34a" style="border-radius:999px;">
                          <a href="{reset_link}" style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ecfdf3;text-decoration:none;border-radius:999px;background-color:#16a34a;">
                            Reset password
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0 0 4px 0;font-size:12px;line-height:1.6;color:#6b7280;">
                      If the button does not work, copy and paste this link into your browser:
                    </p>
                    <p style="margin:0 0 16px 0;font-size:11px;line-height:1.5;color:#16a34a;word-break:break-all;">
                      {reset_link}
                    </p>
                    <p style="margin:0 0 4px 0;font-size:12px;line-height:1.6;color:#6b7280;">
                      If you did <strong>not</strong> request a password reset, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="margin:0 0 4px 0;font-size:11px;color:#9ca3af;">
                      Sent by CPSU Virtual Health Assistant
                    </p>
                    <p style="margin:0;font-size:11px;color:#9ca3af;">
                      Please do not reply directly to this automated message.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """
    # Prefer Brevo HTTP API (works on platforms that block SMTP).
    sent = send_email_via_brevo_api(to_email, subject, body, is_html=True)
    if not sent:
        # Fallback to SMTP if API fails or is not configured.
        return send_email_smtp(to_email, subject, body, is_html=True)
    return True
