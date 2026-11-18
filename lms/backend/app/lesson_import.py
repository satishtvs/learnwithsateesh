"""Import video lessons from content/lessons/*.yaml (create-only, like the quiz importer).

A lesson with a `youtube_id` is created (once) in its chapter; a lesson whose `youtube_id` is empty is skipped until
the video has been uploaded, so this file can list the whole planned course. Optional per-lesson notes are read from
content/lesson_notes/<lesson slug>.md. Existing courses, chapters and lessons are never modified: after the first import
the instructor admin owns them.
"""
import re
from pathlib import Path

import yaml
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Chapter, Course, Lesson

CONTENT = Path(__file__).resolve().parent.parent / "content"
LESSONS_DIR = CONTENT / "lessons"
NOTES_DIR = CONTENT / "lesson_notes"
YOUTUBE_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def parse_lesson_file(data: dict, source: str = "") -> dict:
    where = f" ({source})" if source else ""
    for key in ("course", "chapters"):
        if key not in data:
            raise ValueError(f"missing '{key}'{where}")
    slugs: set[str] = set()
    for ch in data["chapters"]:
        for key in ("code", "title", "lessons"):
            if not ch.get(key):
                raise ValueError(f"chapter {ch.get('code', '?')}: missing '{key}'{where}")
        for le in ch["lessons"]:
            slug = le.get("slug", "")
            if not slug or not le.get("title"):
                raise ValueError(f"chapter {ch['code']}: every lesson needs a slug and a title{where}")
            if slug in slugs:
                raise ValueError(f"duplicate lesson slug {slug!r}{where}")
            slugs.add(slug)
            yt = le.get("youtube_id")
            if yt and not YOUTUBE_ID.match(str(yt)):
                raise ValueError(f"lesson {slug}: bad YouTube id {yt!r}{where}")
    return data


async def import_lesson_data(session: AsyncSession, data: dict, notes_dir: Path = NOTES_DIR) -> int:
    """Create missing chapters and the lessons that have a video. Returns the number of lessons created."""
    cdata = data["course"]
    course = (await session.execute(select(Course).where(Course.slug == cdata["slug"]))).scalar_one_or_none()
    if course is None:
        course = Course(slug=cdata["slug"], title=cdata["title"], description=cdata.get("description", ""),
                        published=bool(cdata.get("published", False)))
        session.add(course)
        await session.flush()

    created = 0
    for chdata in data["chapters"]:
        has_video = any(le.get("youtube_id") for le in chdata["lessons"])
        chapter = (
            await session.execute(select(Chapter).where(Chapter.course_id == course.id, Chapter.code == chdata["code"]))
        ).scalar_one_or_none()
        if chapter is None:
            if not has_video:
                continue  # nothing to show in this chapter yet
            pos = (await session.execute(select(func.count(Chapter.id)).where(Chapter.course_id == course.id))).scalar_one()
            chapter = Chapter(course_id=course.id, code=chdata["code"], title=chdata["title"], unit=chdata.get("unit"),
                              textbook_ref=chdata.get("textbook_ref"), position=pos)
            session.add(chapter)
            await session.flush()
        have = {le.slug for le in (await session.execute(select(Lesson).where(Lesson.course_id == course.id))).scalars()}
        pos = (await session.execute(select(func.count(Lesson.id)).where(Lesson.course_id == course.id))).scalar_one()
        for le in chdata["lessons"]:
            if not le.get("youtube_id") or le["slug"] in have:
                continue
            notes_file = notes_dir / f"{le['slug']}.md"
            session.add(Lesson(
                course_id=course.id, chapter_id=chapter.id, slug=le["slug"], title=le["title"].strip(),
                youtube_id=str(le["youtube_id"]), position=pos, is_preview=bool(le.get("preview", False)),
                notes_md=notes_file.read_text(encoding="utf-8") if notes_file.exists() else "",
            ))
            pos += 1
            created += 1
    await session.flush()
    return created


async def import_all_lessons(session: AsyncSession, directory: Path = LESSONS_DIR) -> int:
    total = 0
    for path in sorted(directory.glob("*.yaml")):
        data = parse_lesson_file(yaml.safe_load(path.read_text(encoding="utf-8")), path.name)
        total += await import_lesson_data(session, data)
    return total
