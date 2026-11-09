import pytest_asyncio
from sqlalchemy import update

from app.db import async_session_maker
from app.models import Course, Lesson
from app.seed import seed

A = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
B = {"email": "ravi@example.com", "password": "S3cure-passw0rd!"}
C = "/api/courses/ai-y3s1"


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def signin(client, creds):
    client.cookies.clear()
    await client.post("/api/auth/register", json=creds)
    await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})
    return client


async def mark(client, lesson, completed=True):
    return await client.put(f"{C}/lessons/{lesson}/progress", json={"completed": completed})


async def test_progress_requires_login(client):
    assert (await client.get(f"{C}/progress")).status_code == 401
    assert (await client.get("/api/progress")).status_code == 401
    assert (await mark(client, "syllabus")).status_code == 401


async def test_fresh_user_has_zero_progress_and_resume_at_start(client):
    await signin(client, A)
    p = (await client.get(f"{C}/progress")).json()
    assert (p["total"], p["completed"], p["percent"], p["started"]) == (2, 0, 0, False)
    assert p["resume"]["slug"] == "syllabus"


async def test_mark_complete_updates_percent_and_resume(client):
    await signin(client, A)
    r = await mark(client, "syllabus")
    assert r.status_code == 200
    p = r.json()
    assert (p["completed"], p["percent"]) == (1, 50)
    assert p["completed_slugs"] == ["syllabus"]
    assert p["resume"]["slug"] == "c01-introduction-part-1"
    assert p["started"] is True


async def test_complete_everything_leaves_no_resume(client):
    await signin(client, A)
    await mark(client, "syllabus")
    p = (await mark(client, "c01-introduction-part-1")).json()
    assert (p["completed"], p["percent"], p["resume"]) == (2, 100, None)


async def test_marking_is_idempotent_and_reversible(client):
    await signin(client, A)
    await mark(client, "syllabus")
    again = (await mark(client, "syllabus")).json()
    assert again["completed"] == 1
    undone = (await mark(client, "syllabus", completed=False)).json()
    assert undone["completed"] == 0 and undone["percent"] == 0


async def test_opening_a_lesson_sets_resume_and_completed_flag(client):
    await signin(client, A)
    await mark(client, "syllabus")
    lesson = (await client.get(f"{C}/lessons/syllabus")).json()
    assert lesson["completed"] is True
    await client.get(f"{C}/lessons/c01-introduction-part-1")  # opened, not completed
    p = (await client.get(f"{C}/progress")).json()
    assert p["resume"]["slug"] == "c01-introduction-part-1"
    assert (await client.get(f"{C}/lessons/c01-introduction-part-1")).json()["completed"] is False


async def test_progress_is_per_user(client):
    await signin(client, A)
    await mark(client, "syllabus")
    await signin(client, B)
    p = (await client.get(f"{C}/progress")).json()
    assert p["completed"] == 0 and p["started"] is False


async def test_anonymous_preview_view_records_nothing(client):
    r = await client.get(f"{C}/lessons/syllabus")
    assert r.status_code == 200 and r.json()["completed"] is False


async def test_unknown_lesson_or_course_404(client):
    await signin(client, A)
    assert (await mark(client, "nope")).status_code == 404
    r = await client.put("/api/courses/nope/lessons/syllabus/progress", json={"completed": True})
    assert r.status_code == 404
    assert (await client.get("/api/courses/nope/progress")).status_code == 404


async def test_unpublished_lessons_do_not_count(client):
    await signin(client, A)
    await mark(client, "syllabus")
    async with async_session_maker() as s:
        await s.execute(update(Lesson).where(Lesson.slug == "c01-introduction-part-1").values(published=False))
        await s.commit()
    p = (await client.get(f"{C}/progress")).json()
    assert (p["total"], p["completed"], p["percent"], p["resume"]) == (1, 1, 100, None)
    assert (await mark(client, "c01-introduction-part-1")).status_code == 404


async def test_all_courses_summary(client):
    await signin(client, A)
    await mark(client, "syllabus")
    rows = (await client.get("/api/progress")).json()
    assert [r["course_slug"] for r in rows] == ["ai-y3s1"]
    assert rows[0]["completed"] == 1


async def test_course_row_untouched_helpers_import():
    assert Course  # keeps the import honest if models move
