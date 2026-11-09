import pytest

pytestmark = pytest.mark.asyncio

CREDS = {"email": "student@example.com", "password": "S3cure-passw0rd!"}


async def test_health(client):
    r = await client.get("/api/health")
    assert r.status_code == 200


async def test_me_requires_login(client):
    r = await client.get("/api/me")
    assert r.status_code == 401


@pytest.mark.parametrize("password", ["abc", "1234567", "", "x" * 129])
async def test_weak_passwords_are_rejected_by_the_server(client, password):
    """The form's minLength is only a browser hint; direct API calls must be refused too."""
    r = await client.post("/api/auth/register", json={"email": "weak@example.com", "password": password})
    assert r.status_code in (400, 422)
    # and no account was created, so logging in with that password fails (422 for an empty form field)
    assert (await client.post("/api/auth/login", data={"username": "weak@example.com", "password": password})).status_code in (400, 422)


async def test_password_may_not_equal_the_email(client):
    r = await client.post("/api/auth/register", json={"email": "same-as-pw@example.com", "password": "same-as-pw@example.com"})
    assert r.status_code == 400
    assert "email" in r.json()["detail"]["reason"].lower()


async def test_eight_character_password_is_accepted(client):
    r = await client.post("/api/auth/register", json={"email": "ok8@example.com", "password": "12345678"})
    assert r.status_code == 201


async def test_register_login_me(client):
    r = await client.post("/api/auth/register", json={**CREDS, "full_name": "Asha"})
    assert r.status_code == 201
    body = r.json()
    assert body["role"] == "student"
    assert body["full_name"] == "Asha"

    r = await client.post("/api/auth/login", data={"username": CREDS["email"], "password": CREDS["password"]})
    assert r.status_code == 204
    assert "lws_auth" in r.cookies

    r = await client.get("/api/me")  # cookie jar carries the session
    assert r.status_code == 200
    assert r.json()["email"] == CREDS["email"]


async def test_cannot_self_assign_role(client):
    r = await client.post("/api/auth/register", json={**CREDS, "role": "admin", "is_superuser": True})
    assert r.status_code == 201
    assert r.json()["role"] == "student"
    assert r.json()["is_superuser"] is False


async def test_wrong_password_rejected(client):
    await client.post("/api/auth/register", json=CREDS)
    r = await client.post("/api/auth/login", data={"username": CREDS["email"], "password": "nope"})
    assert r.status_code == 400


async def test_logout_clears_session(client):
    await client.post("/api/auth/register", json=CREDS)
    await client.post("/api/auth/login", data={"username": CREDS["email"], "password": CREDS["password"]})
    r = await client.post("/api/auth/logout")
    assert r.status_code == 204
    client.cookies.clear()
    assert (await client.get("/api/me")).status_code == 401
