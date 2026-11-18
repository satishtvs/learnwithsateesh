"""Point an existing lesson at a different YouTube video (for example after a lesson video is re-recorded).

    python -m app.set_video <course-slug> <lesson-slug> <YouTube link or 11-character id>
    docker compose -f docker-compose.prod.yml --env-file .env exec -T backend python -m app.set_video ai-y3s1 syllabus https://youtu.be/XXXXXXXXXXX

Only the video changes: the lesson keeps its title, notes, position, free-preview flag and every learner's progress.
"""
import argparse
import asyncio

from sqlalchemy import select

from app.admin import parse_youtube_id
from app.db import async_session_maker
from app.models import Course, Lesson


async def set_video(course_slug: str, lesson_slug: str, video: str) -> str | None:
    """Returns the previous YouTube id, or None if the course or lesson does not exist."""
    yt = parse_youtube_id(video)
    async with async_session_maker() as s:
        course = (await s.execute(select(Course).where(Course.slug == course_slug))).scalar_one_or_none()
        if course is None:
            return None
        lesson = (
            await s.execute(select(Lesson).where(Lesson.course_id == course.id, Lesson.slug == lesson_slug))
        ).scalar_one_or_none()
        if lesson is None:
            return None
        old, lesson.youtube_id = lesson.youtube_id, yt
        await s.commit()
        return old


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("course")
    p.add_argument("lesson")
    p.add_argument("video")
    a = p.parse_args()
    try:
        old = asyncio.run(set_video(a.course, a.lesson, a.video))
    except ValueError as e:
        raise SystemExit(str(e))
    if old is None:
        raise SystemExit(f"No lesson {a.lesson!r} in course {a.course!r}")
    print(f"{a.course}/{a.lesson}: {old} -> {parse_youtube_id(a.video)}")


if __name__ == "__main__":
    main()
