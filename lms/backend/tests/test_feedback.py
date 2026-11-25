import pytest_asyncio

from app.promote import promote
from app.seed import seed

STUDENT = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
TEACHER = {"email": "sateesh@example.com", "password": "S3cure-passw0rd!"}


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def signin(client, creds, role=None):
    client.cookies.clear()
    await client.post("/api/auth/register", json=creds)
    if role:
        assert await promote(creds["email"], role)
    await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})


async def first_part(client):
    c = (await client.get("/api/courses")).json()[0]
    d = (await client.get(f"/api/courses/{c['slug']}")).json()
    parts = d.get("parts") or [p for u in d["units"] for p in u["parts"]]
    return c["slug"], parts[0]["slug"]


async def test_must_sign_in_to_send(client):
    slug, part = await first_part(client)
    r = await client.post(f"/api/courses/{slug}/parts/{part}/feedback", json={"message": "Typo on slide 3"})
    assert r.status_code == 401


async def test_send_and_triage(client):
    await signin(client, STUDENT)
    slug, part = await first_part(client)
    url = f"/api/courses/{slug}/parts/{part}/feedback"
    assert (await client.post(url, json={"message": "no"})).status_code == 422
    r = await client.post(url, json={"kind": "mistake", "message": "Slide 3 says 5 but it should be 6", "video_time_seconds": 95})
    assert r.status_code == 201
    assert (await client.get("/api/admin/feedback")).status_code == 403

    await signin(client, TEACHER, "admin")
    data = (await client.get("/api/admin/feedback")).json()
    assert data["counts"]["new"] == 1 and len(data["items"]) == 1
    item = data["items"][0]
    assert item["part_slug"] == part and item["video_time_seconds"] == 95 and item["learner_email"] == STUDENT["email"]
    r = await client.patch(f"/api/admin/feedback/{item['id']}", json={"status": "resolved", "admin_note": "Fixed in re-render"})
    assert r.status_code == 200 and r.json()["status"] == "resolved"
    assert (await client.get("/api/admin/feedback")).json()["items"] == []
    assert len((await client.get("/api/admin/feedback?status=resolved")).json()["items"]) == 1
    assert (await client.delete(f"/api/admin/feedback/{item['id']}")).status_code == 204


async def test_daily_limit(client):
    await signin(client, STUDENT)
    slug, part = await first_part(client)
    url = f"/api/courses/{slug}/parts/{part}/feedback"
    codes = [(await client.post(url, json={"message": "Something is wrong here"})).status_code for _ in range(11)]
    assert codes[:10] == [201] * 10 and codes[10] == 429
