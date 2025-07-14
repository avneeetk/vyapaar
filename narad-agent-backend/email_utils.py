import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from dotenv import load_dotenv
load_dotenv()

def send_email(to_email: str, subject: str, body: str, from_email: Optional[str] = None, smtp_server: Optional[str] = None, smtp_port: Optional[int] = None, smtp_user: Optional[str] = None, smtp_password: Optional[str] = None):
    """
    Send an email using SMTP.
    You can provide SMTP settings directly or set them as environment variables:
    SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM
    """
    print(f"[Email] Sending to {to_email}")
    smtp_server = smtp_server or os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = smtp_port or int(os.getenv("SMTP_PORT", 587))
    smtp_user = smtp_user or os.getenv("SMTP_USER")
    smtp_password = smtp_password or os.getenv("SMTP_PASSWORD")
    from_email = from_email or os.getenv("EMAIL_FROM", smtp_user)

    if not (smtp_user and smtp_password):
        raise ValueError("SMTP_USER and SMTP_PASSWORD must be set (as env vars or arguments)")

    msg = MIMEMultipart()
    msg["From"] = from_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)


if __name__ == "__main__":
    send_email(
        to_email="vyapaar25@gmail.com",
        subject="Test Email from NAARAD",
        body="This is a test email sent via SMTP"
    )