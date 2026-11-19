"""Idempotent seed: course outline + the videos uploaded so far.

    python -m app.seed
"""
import asyncio
import re

from sqlalchemy import select

from app.db import async_session_maker
from app.models import Unit, Course, Part
from app.part_import import import_all_parts
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

# (code, title, label, textbook reference) — from the syllabus deck.
UNITS = [
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

# (unit code or None, slug, title, youtube id, free preview?)
# Free previews can be watched without an account; everything else needs a (free) sign-in.
PARTS = [
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

        units: dict[str, Unit] = {}
        existing = {c.code: c for c in (await s.execute(select(Unit).where(Unit.course_id == course.id))).scalars()}
        for pos, (code, title, label, ref) in enumerate(UNITS):
            ch = existing.get(code)
            if ch is None:  # create-only: existing units belong to the instructor admin now
                ch = Unit(course_id=course.id, code=code, title=title, label=label, textbook_ref=ref, position=pos)
                s.add(ch)
            units[code] = ch
        await s.flush()

        have = {le.slug: le for le in (await s.execute(select(Part).where(Part.course_id == course.id))).scalars()}
        for pos, (code, slug, title, yt, preview) in enumerate(PARTS):
            if not YOUTUBE_ID.match(yt):
                raise ValueError(f"bad YouTube id for {slug}: {yt!r}")
            if slug in have:
                continue  # create-only: edit existing parts in the instructor admin
            s.add(
                Part(
                    course_id=course.id, slug=slug, title=title, youtube_id=yt, position=pos, is_preview=preview,
                    unit_id=units[code].id if code else None,
                )
            )
        await s.commit()
    print(f"seeded {COURSE['slug']}: {len(UNITS)} units, {len(PARTS)} parts (existing ones are left as they are)")

    async with async_session_maker() as s:
        nq, nn = await import_all(s, force=force_quizzes)
        await s.commit()
    print(f"imported quizzes: {nq} quizzes, {nn} questions created (only 'approved' ones are visible)")

    async with async_session_maker() as s:
        nl = await import_all_parts(s)
        await s.commit()
    print(f"imported parts: {nl} created (parts without a youtube_id are skipped)")


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser(description="Create any missing seed content. Never overwrites existing content by default.")
    ap.add_argument("--reimport-quizzes", action="store_true", help="overwrite quizzes in the database from content/quizzes/*.yaml")
    asyncio.run(seed(force_quizzes=ap.parse_args().reimport_quizzes))
