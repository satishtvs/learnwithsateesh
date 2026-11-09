"""Outgoing email. Dev: logs to the console. Production: swap in Amazon SES."""
import logging

log = logging.getLogger("lws.email")


async def send_email(to: str, subject: str, body: str) -> None:
    # TODO(prod): send via SES (boto3 sesv2) once the domain is verified.
    log.warning("EMAIL to=%s subject=%s\n%s", to, subject, body)
