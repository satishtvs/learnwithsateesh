"""Outgoing email over SMTP (works with Amazon SES SMTP, Gmail app passwords, Zoho, Brevo and similar).

Without SMTP_HOST (local development) emails are only logged. With it, they are sent and the body, which may
contain a one-time link, is never logged.
"""
import asyncio
import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.config import settings

log = logging.getLogger("lws.email")


def email_enabled() -> bool:
    return bool(settings.smtp_host)


def _send_sync(to: str, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    context = ssl.create_default_context()
    if settings.smtp_port == 465:
        server: smtplib.SMTP = smtplib.SMTP_SSL(settings.smtp_host, settings.smtp_port, context=context, timeout=20)
    else:
        server = smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20)
    with server:
        if settings.smtp_port != 465 and settings.smtp_starttls:
            server.starttls(context=context)
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)


async def send_email(to: str, subject: str, body: str) -> None:
    if not email_enabled():
        log.warning("EMAIL (not sent, SMTP not configured) to=%s subject=%s\n%s", to, subject, body)
        return
    try:
        await asyncio.to_thread(_send_sync, to, subject, body)
    except Exception:  # a mail outage must not break registration or password reset requests
        log.exception("Could not send email to %s (subject: %s)", to, subject)
