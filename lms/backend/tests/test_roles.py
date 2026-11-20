"""Instructors and admins preview courses but never study: their writes are refused so learner numbers stay clean."""
import pytest_asyncio

from app.promote import promote
from app.seed import seed
from tests.helpers import watch_and_complete

STUDENT = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
TEACHER = {"email": "sateesh@example.com", "password": "S3cure-passw0rd!"}
C = "/api/courses/ai-y3s1"


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def signin(client, creds, role=None):
    client.cookies.clear()
    await client.post("/api/auth/register", json=creds)
    if role:
        assert await promote(creds["email"], role)
    await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})
    return client


async def test_instructor_and_admin_cannot_record_progress_or_claim_certificates(client):
    for role in ("instructor", "admin"):
        await signin(client, TEACHER, role)
        r = await client.put(f"{C}/parts/syllabus/progress", json={"completed": True})
        assert r.status_code == 403 and "student account" in r.json()["detail"]
        assert (await client.post(f"{C}/certificate")).status_code == 403
        # reading is still fine (preview): the course and its progress summary load
        assert (await client.get(C)).status_code == 200
        assert (await client.get(f"{C}/progress")).status_code == 200


async def test_students_still_record_progress(client):
    await signin(client, STUDENT)
    assert (await watch_and_complete(client, C, "syllabus")).status_code == 200


async def test_learners_list_is_instructor_only_and_students_only(client):
    await signin(client, STUDENT)
    await watch_and_complete(client, C, "syllabus")
    assert (await client.get("/api/admin/learners")).status_code == 403
    await signin(client, TEACHER, "admin")
    rows = (await client.get("/api/admin/learners")).json()
    assert [r["email"] for r in rows] == [STUDENT["email"]]  # the admin is not listed
    assert rows[0]["parts_completed"] == 1 and rows[0]["certificates"] == 0 and rows[0]["last_seen_at"]
    assert (await client.get("/api/admin/learners", params={"q": "nobody"})).json() == []
    assert len((await client.get("/api/admin/learners", params={"q": "ASHA"})).json()) == 1
