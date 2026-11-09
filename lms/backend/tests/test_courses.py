import pytest
import pytest_asyncio
from sqlalchemy import update

from app.db import async_session_maker
from app.models import Lesson
from app.seed import seed

CREDS = {"email": "student@example.com", "password": "S3cure-passw0rd!"}


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()
    await seed()  # idempotent: running twice must not duplicate anything


@pytest_asyncio.fixture
async def logged_in(client):
    await client.post("/api/auth/register", json=CREDS)
    await client.post("/api/auth/login", data={"username": CREDS["email"], "password": CREDS["password"]})
    return client


async def test_catalogue_is_public(client):
    r = await client.get("/api/courses")
    assert r.status_code == 200
    assert [c["slug"] for c in r.json()] == ["ai-y3s1"]


async def test_outline_is_public_and_ordered(client):
    r = await client.get("/api/courses/ai-y3s1")
    assert r.status_code == 200
    body = r.json()
    assert [c["code"] for c in body["chapters"]] == [f"C{i:02d}" for i in range(1, 11)]
    assert [le["slug"] for le in body["overview_lessons"]] == ["syllabus"]
    assert body["chapters"][0]["lessons"][0]["slug"] == "c01-introduction-part-1"
    assert "youtube_id" not in str(body)  # outline never leaks video ids


async def test_unknown_course_404(client):
    assert (await client.get("/api/courses/nope")).status_code == 404


async def test_lesson_requires_login(client):
    r = await client.get("/api/courses/ai-y3s1/lessons/syllabus")
    assert r.status_code == 401


async def test_lesson_content_and_navigation(logged_in):
    r = await logged_in.get("/api/courses/ai-y3s1/lessons/syllabus")
    assert r.status_code == 200
    first = r.json()
    assert first["youtube_id"] == "zN6yG0iReXY"
    assert first["prev"] is None and first["next"]["slug"] == "c01-introduction-part-1"

    r = await logged_in.get("/api/courses/ai-y3s1/lessons/c01-introduction-part-1")
    second = r.json()
    assert second["youtube_id"] == "f3LHSSHeHdU"
    assert second["chapter_code"] == "C01"
    assert second["prev"]["slug"] == "syllabus" and second["next"] is None


async def test_unpublished_lesson_hidden(logged_in):
    async with async_session_maker() as s:
        await s.execute(update(Lesson).where(Lesson.slug == "syllabus").values(published=False))
        await s.commit()
    assert (await logged_in.get("/api/courses/ai-y3s1/lessons/syllabus")).status_code == 404
    outline = (await logged_in.get("/api/courses/ai-y3s1")).json()
    assert outline["overview_lessons"] == []


@pytest.mark.parametrize("bad", ["short", "has space!!", "way-too-long-id-x"])
async def test_seed_rejects_bad_youtube_ids(bad):
    from app import seed as seed_mod

    original = seed_mod.LESSONS
    seed_mod.LESSONS = [(None, "bad", "Bad", bad)]
    try:
        with pytest.raises(ValueError):
            await seed_mod.seed()
    finally:
        seed_mod.LESSONS = original
