import logging
import smtplib

import pytest

from app import emailer
from app.config import settings


class FakeSMTP:
    """Stands in for smtplib.SMTP / SMTP_SSL and records what happens."""

    instances: list["FakeSMTP"] = []
    fail = False

    def __init__(self, host, port, **kwargs):
        if FakeSMTP.fail:
            raise ConnectionRefusedError("smtp down")
        self.host, self.port, self.kwargs = host, port, kwargs
        self.steps: list[str] = []
        self.messages = []
        FakeSMTP.instances.append(self)

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def starttls(self, context=None):
        self.steps.append("starttls")

    def login(self, user, password):
        self.steps.append(f"login:{user}")

    def send_message(self, msg):
        self.steps.append("send")
        self.messages.append(msg)


@pytest.fixture(autouse=True)
def fake_smtp(monkeypatch):
    FakeSMTP.instances, FakeSMTP.fail = [], False
    monkeypatch.setattr(smtplib, "SMTP", FakeSMTP)
    monkeypatch.setattr(smtplib, "SMTP_SSL", FakeSMTP)
    for k, v in dict(smtp_host="", smtp_port=587, smtp_user="", smtp_password="", smtp_from="", smtp_starttls=True).items():
        monkeypatch.setattr(settings, k, v)


async def test_without_smtp_it_only_logs(caplog):
    with caplog.at_level(logging.WARNING, logger="lws.email"):
        await emailer.send_email("a@example.com", "Hi", "link-123")
    assert not FakeSMTP.instances
    assert "not sent" in caplog.text and "link-123" in caplog.text  # dev convenience: you can copy the link


async def test_with_smtp_it_sends_over_starttls_and_never_logs_the_body(monkeypatch, caplog):
    monkeypatch.setattr(settings, "smtp_host", "smtp.example.com")
    monkeypatch.setattr(settings, "smtp_user", "mailer")
    monkeypatch.setattr(settings, "smtp_password", "pw")
    monkeypatch.setattr(settings, "smtp_from", "Learn With Sateesh <no-reply@learnwithsateesh.in>")
    with caplog.at_level(logging.DEBUG):
        await emailer.send_email("asha@example.com", "Reset your password", "secret-link-456")
    (smtp,) = FakeSMTP.instances
    assert (smtp.host, smtp.port) == ("smtp.example.com", 587)
    assert smtp.steps == ["starttls", "login:mailer", "send"]
    msg = smtp.messages[0]
    assert (msg["To"], msg["Subject"]) == ("asha@example.com", "Reset your password")
    assert msg["From"].endswith("<no-reply@learnwithsateesh.in>")
    assert "secret-link-456" in msg.get_content()
    assert "secret-link-456" not in caplog.text  # one-time links must not end up in the logs


async def test_port_465_uses_implicit_tls_without_starttls(monkeypatch):
    monkeypatch.setattr(settings, "smtp_host", "smtp.example.com")
    monkeypatch.setattr(settings, "smtp_port", 465)
    monkeypatch.setattr(settings, "smtp_user", "mailer")
    await emailer.send_email("a@example.com", "Hi", "body")
    assert FakeSMTP.instances[0].steps == ["login:mailer", "send"]


async def test_no_login_when_no_user_is_configured(monkeypatch):
    monkeypatch.setattr(settings, "smtp_host", "relay.internal")
    monkeypatch.setattr(settings, "smtp_from", "no-reply@example.com")
    await emailer.send_email("a@example.com", "Hi", "body")
    assert FakeSMTP.instances[0].steps == ["starttls", "send"]


async def test_a_mail_outage_does_not_raise(monkeypatch, caplog):
    monkeypatch.setattr(settings, "smtp_host", "smtp.example.com")
    FakeSMTP.fail = True
    with caplog.at_level(logging.ERROR, logger="lws.email"):
        await emailer.send_email("a@example.com", "Hi", "body")  # must not raise
    assert "Could not send email" in caplog.text


async def test_providers_reports_whether_email_works(client, monkeypatch):
    assert (await client.get("/api/auth/providers")).json() == {"google": False, "email": False}
    monkeypatch.setattr(settings, "smtp_host", "smtp.example.com")
    assert (await client.get("/api/auth/providers")).json()["email"] is True


async def test_forgot_password_never_reveals_whether_an_account_exists(client):
    r1 = await client.post("/api/auth/forgot-password", json={"email": "nobody@example.com"})
    await client.post("/api/auth/register", json={"email": "real@example.com", "password": "S3cure-passw0rd!"})
    r2 = await client.post("/api/auth/forgot-password", json={"email": "real@example.com"})
    assert r1.status_code == r2.status_code == 202


async def test_reset_password_flow_enforces_the_password_rule(client, monkeypatch):
    sent = {}

    async def capture(to, subject, body):
        sent["body"] = body

    import app.users as users

    monkeypatch.setattr(users, "send_email", capture)
    await client.post("/api/auth/register", json={"email": "reset@example.com", "password": "S3cure-passw0rd!"})
    await client.post("/api/auth/forgot-password", json={"email": "reset@example.com"})
    token = sent["body"].split("token=")[1].strip()
    weak = await client.post("/api/auth/reset-password", json={"token": token, "password": "abc"})
    assert weak.status_code == 400
    ok = await client.post("/api/auth/reset-password", json={"token": token, "password": "N3w-passw0rd!!"})
    assert ok.status_code == 200
    login = await client.post("/api/auth/login", data={"username": "reset@example.com", "password": "N3w-passw0rd!!"})
    assert login.status_code == 204
    old = await client.post("/api/auth/login", data={"username": "reset@example.com", "password": "S3cure-passw0rd!"})
    assert old.status_code == 400
