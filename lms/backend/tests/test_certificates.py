import pytest_asyncio

from app.seed import seed

A = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
B = {"email": "ravi@example.com", "password": "S3cure-passw0rd!"}
C = "/api/courses/ai-y3s1"


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def signin(client, creds, name=None):
    client.cookies.clear()
    await client.post("/api/auth/register", json={**creds, **({"full_name": name} if name else {})})
    await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})
    return client


async def finish_course(client):
    course = (await client.get(C)).json()
    slugs = [l["slug"] for l in course["overview_lessons"]] + [l["slug"] for ch in course["chapters"] for l in ch["lessons"]]
    for s in slugs:
        assert (await client.put(f"{C}/lessons/{s}/progress", json={"completed": True})).status_code == 200
    return len(slugs)


async def test_requires_login(client):
    assert (await client.post(f"{C}/certificate")).status_code == 401
    assert (await client.get("/api/me/certificates")).status_code == 401


async def test_cannot_claim_before_finishing(client):
    await signin(client, A)
    assert (await client.post(f"{C}/certificate")).status_code == 409
    assert (await client.get("/api/me/certificates")).json() == []


async def test_claim_verify_and_idempotent(client):
    await signin(client, A, "Asha Rao")
    n = await finish_course(client)
    r = await client.post(f"{C}/certificate")
    assert r.status_code == 200
    cert = r.json()
    assert cert["learner_name"] == "Asha Rao" and cert["lesson_count"] == n and cert["code"].startswith("LWS-")
    assert (await client.post(f"{C}/certificate")).json()["code"] == cert["code"]
    assert len((await client.get("/api/me/certificates")).json()) == 1
    # public verification, no login, case-insensitive
    client.cookies.clear()
    v = await client.get(f"/api/certificates/{cert['code'].lower()}")
    assert v.status_code == 200 and v.json()["course_slug"] == "ai-y3s1"
    assert (await client.get("/api/certificates/LWS-NOPE")).status_code == 404


async def test_certificates_are_per_user(client):
    await signin(client, A)
    await finish_course(client)
    await client.post(f"{C}/certificate")
    await signin(client, B)
    assert (await client.get("/api/me/certificates")).json() == []
    assert (await client.post(f"{C}/certificate")).status_code == 409
