import pytest
import pytest_asyncio
from sqlalchemy import select

from app.db import async_session_maker
from app.models import Lesson
from app.seed import seed
from app.set_video import set_video


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def test_changes_only_the_video(client):
    before = (await client.get("/api/courses/ai-y3s1/lessons/syllabus")).json()
    old = await set_video("ai-y3s1", "syllabus", "https://youtu.be/abcdefghijk?si=x")
    assert old == before["youtube_id"]
    after = (await client.get("/api/courses/ai-y3s1/lessons/syllabus")).json()
    assert after["youtube_id"] == "abcdefghijk"
    assert after["title"] == before["title"] and after["is_preview"] == before["is_preview"]


async def test_accepts_a_bare_id_and_reports_unknown_targets():
    assert await set_video("ai-y3s1", "syllabus", "AAAAAAAAAAA") is not None
    assert await set_video("ai-y3s1", "no-such-lesson", "AAAAAAAAAAA") is None
    assert await set_video("no-such-course", "syllabus", "AAAAAAAAAAA") is None
    async with async_session_maker() as s:
        ids = (await s.execute(select(Lesson.youtube_id).where(Lesson.slug == "syllabus"))).scalars().all()
    assert ids == ["AAAAAAAAAAA"]


async def test_rejects_a_bad_link():
    with pytest.raises(ValueError):
        await set_video("ai-y3s1", "syllabus", "not a youtube link")
