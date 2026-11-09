"""Idempotent seed: course outline + the videos uploaded so far.

    python -m app.seed
"""
import asyncio
import re

from sqlalchemy import select

from app.db import async_session_maker
from app.models import Chapter, Course, Lesson
from app.quiz_import import import_all

YOUTUBE_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")

COURSE = {
    "slug": "ai-y3s1",
    "title": "Artificial Intelligence — B.Tech Year 3, Semester 1",
    "description": (
        "Artificial Intelligence for B.Tech 3rd year, 1st semester, following Russell & Norvig, "
        "'Artificial Intelligence: A Modern Approach' (3rd ed.)."
    ),
}

# (code, title, unit, textbook reference) — from the syllabus deck.
CHAPTERS = [
    ("C01", "Introduction", "Unit - I", "AIMA ch. 1"),
    ("C02", "Intelligent Agents", "Unit - I", "AIMA ch. 2"),
    ("C03", "Solving Problems by Searching", "Unit - II", "AIMA ch. 3"),
    ("C04", "Beyond Classical Search", "Unit - II", "AIMA ch. 4"),
    ("C05", "Reinforcement Learning", "Unit - III", "AIMA ch. 21"),
    ("C06", "Natural Language Processing", "Unit - III", "AIMA ch. 22"),
    ("C07", "Natural Language for Communication", "Unit - IV", "AIMA ch. 23"),
    ("C08", "Perception", "Unit - IV", "AIMA ch. 24"),
    ("C09", "Robotics", "Unit - V", "AIMA ch. 25"),
    ("C10", "Philosophical Foundations", "Unit - V", "AIMA ch. 26-27"),
]

# (chapter code or None, slug, title, youtube id, free preview?)
# Free previews can be watched without an account; everything else needs a (free) sign-in.
LESSONS = [
    (None, "syllabus", "AI-Y3S1 Syllabus: B.Tech. Artificial Intelligence Course Syllabus", "zN6yG0iReXY", True),
    ("C01", "c01-introduction-part-1", "AI Y3S1C01 Introduction: Part 1", "f3LHSSHeHdU", True),
]


async def seed(force_quizzes: bool = False) -> None:
    async with async_session_maker() as s:
        course = (await s.execute(select(Course).where(Course.slug == COURSE["slug"]))).scalar_one_or_none()
        if course is None:
            course = Course(**COURSE, published=True)
            s.add(course)
            await s.flush()

        chapters: dict[str, Chapter] = {}
        existing = {c.code: c for c in (await s.execute(select(Chapter).where(Chapter.course_id == course.id))).scalars()}
        for pos, (code, title, unit, ref) in enumerate(CHAPTERS):
            ch = existing.get(code)
            if ch is None:  # create-only: existing chapters belong to the instructor admin now
                ch = Chapter(course_id=course.id, code=code, title=title, unit=unit, textbook_ref=ref, position=pos)
                s.add(ch)
            chapters[code] = ch
        await s.flush()

        have = {le.slug: le for le in (await s.execute(select(Lesson).where(Lesson.course_id == course.id))).scalars()}
        for pos, (code, slug, title, yt, preview) in enumerate(LESSONS):
            if not YOUTUBE_ID.match(yt):
                raise ValueError(f"bad YouTube id for {slug}: {yt!r}")
            if slug in have:
                continue  # create-only: edit existing lessons in the instructor admin
            s.add(
                Lesson(
                    course_id=course.id, slug=slug, title=title, youtube_id=yt, position=pos, is_preview=preview,
                    chapter_id=chapters[code].id if code else None,
                )
            )
        await s.commit()
    print(f"seeded {COURSE['slug']}: {len(CHAPTERS)} chapters, {len(LESSONS)} lessons (existing ones are left as they are)")

    async with async_session_maker() as s:
        nq, nn = await import_all(s, force=force_quizzes)
        await s.commit()
    print(f"imported quizzes: {nq} quizzes, {nn} questions created (only 'approved' ones are visible)")


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Create any missing seed content. Never overwrites existing content by default.")
    ap.add_argument("--reimport-quizzes", action="store_true", help="overwrite quizzes in the database from content/quizzes/*.yaml")
    asyncio.run(seed(force_quizzes=ap.parse_args().reimport_quizzes))
