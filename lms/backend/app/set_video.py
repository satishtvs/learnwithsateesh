"""Point an existing part at a different YouTube video (for example after a part video is re-recorded).

    python -m app.set_video <course-slug> <part-slug> <YouTube link or 11-character id>
    docker compose -f docker-compose.prod.yml --env-file .env exec -T backend python -m app.set_video ai-y3s1 syllabus https://youtu.be/XXXXXXXXXXX

Only the video changes: the part keeps its title, notes, position, free-preview flag and every learner's progress.
"""
import argparse
import asyncio

from sqlalchemy import select

from app.admin import parse_youtube_id
from app.db import async_session_maker
from app.models import Course, Part


async def set_video(course_slug: str, part_slug: str, video: str) -> str | None:
    """Returns the previous YouTube id, or None if the course or part does not exist."""
    yt = parse_youtube_id(video)
    async with async_session_maker() as s:
        course = (await s.execute(select(Course).where(Course.slug == course_slug))).scalar_one_or_none()
        if course is None:
            return None
        part = (
            await s.execute(select(Part).where(Part.course_id == course.id, Part.slug == part_slug))
        ).scalar_one_or_none()
        if part is None:
            return None
        old, part.youtube_id = part.youtube_id, yt
        await s.commit()
        return old


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("course")
    p.add_argument("part")
    p.add_argument("video")
    a = p.parse_args()
    try:
        old = asyncio.run(set_video(a.course, a.part, a.video))
    except ValueError as e:
        raise SystemExit(str(e))
    if old is None:
        raise SystemExit(f"No part {a.part!r} in course {a.course!r}")
    print(f"{a.course}/{a.part}: {old} -> {parse_youtube_id(a.video)}")


if __name__ == "__main__":
    main()
