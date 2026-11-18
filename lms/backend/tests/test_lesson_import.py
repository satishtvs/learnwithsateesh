import copy

import pytest
import pytest_asyncio
import yaml
from sqlalchemy import select

from app.db import async_session_maker
from app.lesson_import import LESSONS_DIR, import_all_lessons, import_lesson_data, parse_lesson_file
from app.models import Chapter, Course, Lesson
from app.seed import seed

DATA = {
    "course": {"slug": "demo-course", "title": "Demo"},
    "chapters": [
        {"code": "U1", "title": "One", "unit": "Unit - I", "lessons": [
            {"slug": "u1-p1", "title": "Part 1", "youtube_id": "abcdefghijk", "preview": True},
            {"slug": "u1-p2", "title": "Part 2", "youtube_id": None},
        ]},
        {"code": "U2", "title": "Two", "lessons": [{"slug": "u2-p1", "title": "Part 1", "youtube_id": None}]},
    ],
}


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def load(data, notes_dir=None):
    async with async_session_maker() as s:
        kwargs = {"notes_dir": notes_dir} if notes_dir else {}
        n = await import_lesson_data(s, parse_lesson_file(copy.deepcopy(data)), **kwargs)
        await s.commit()
        return n


async def lessons_of(slug):
    async with async_session_maker() as s:
        course = (await s.execute(select(Course).where(Course.slug == slug))).scalar_one()
        rows = (await s.execute(select(Lesson).where(Lesson.course_id == course.id).order_by(Lesson.position))).scalars().all()
        chapters = (await s.execute(select(Chapter).where(Chapter.course_id == course.id).order_by(Chapter.position))).scalars().all()
        return course, rows, chapters


def test_shipped_file_is_valid_and_lists_eleven_videos():
    data = parse_lesson_file(yaml.safe_load((LESSONS_DIR / "ml-r22.yaml").read_text(encoding="utf-8")))
    slugs = [le["slug"] for ch in data["chapters"] for le in ch["lessons"]]
    assert slugs == [f"u1-p{i}" for i in range(1, 7)] + [f"u2-p{i}" for i in range(1, 6)]


def test_parse_rejects_bad_youtube_id_and_duplicate_slugs():
    bad = copy.deepcopy(DATA)
    bad["chapters"][0]["lessons"][0]["youtube_id"] = "too-short"
    with pytest.raises(ValueError, match="YouTube"):
        parse_lesson_file(bad)
    dup = copy.deepcopy(DATA)
    dup["chapters"][1]["lessons"][0]["slug"] = "u1-p1"
    with pytest.raises(ValueError, match="duplicate"):
        parse_lesson_file(dup)


async def test_only_lessons_with_a_video_are_created(client):
    assert await load(DATA) == 1
    course, lessons, chapters = await lessons_of("demo-course")
    assert [le.slug for le in lessons] == ["u1-p1"] and lessons[0].is_preview
    assert [c.code for c in chapters] == ["U1"]  # U2 has no video yet, so no chapter either
    assert course.published is False
    assert (await client.get("/api/courses/demo-course")).status_code == 404  # still hidden


async def test_import_is_create_only_and_adds_later_videos(client):
    await load(DATA)
    later = copy.deepcopy(DATA)
    later["chapters"][0]["lessons"][0]["title"] = "Changed in the file"
    later["chapters"][0]["lessons"][1]["youtube_id"] = "bbbbbbbbbbb"
    later["chapters"][1]["lessons"][0]["youtube_id"] = "ccccccccccc"
    assert await load(later) == 2
    assert await load(later) == 0  # idempotent
    _, lessons, chapters = await lessons_of("demo-course")
    assert [le.slug for le in lessons] == ["u1-p1", "u1-p2", "u2-p1"]
    assert lessons[0].title == "Part 1"  # existing lessons are never overwritten
    assert [c.code for c in chapters] == ["U1", "U2"]


async def test_notes_are_loaded_from_files(tmp_path):
    (tmp_path / "u1-p1.md").write_text("## Notes\n- point", encoding="utf-8")
    await load(DATA, notes_dir=tmp_path)
    _, lessons, _ = await lessons_of("demo-course")
    assert lessons[0].notes_md.startswith("## Notes")


async def test_seed_import_with_shipped_file_creates_nothing_yet():
    async with async_session_maker() as s:
        assert await import_all_lessons(s) == 0
