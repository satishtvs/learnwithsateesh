"""Per-user learning progress: which lessons are complete, and where to resume."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.courses import LessonSummary, _course_query, _ordered_lessons
from app.db import get_async_session
from app.models import Course, Lesson, LessonProgress, User
from app.users import current_active_user

router = APIRouter(tags=["progress"])


class CourseProgress(BaseModel):
    course_slug: str
    course_title: str
    total: int
    completed: int
    percent: int
    started: bool  # the user has opened at least one lesson
    completed_slugs: list[str]
    resume: LessonSummary | None  # where to continue; None when nothing is left


class CompletedBody(BaseModel):
    completed: bool


async def record_visit(session: AsyncSession, user: User, lesson: Lesson) -> None:
    """Remember that the user opened this lesson (drives 'resume')."""
    row = await session.get(LessonProgress, (user.id, lesson.id))
    now = datetime.now(timezone.utc)
    if row is None:
        session.add(LessonProgress(user_id=user.id, lesson_id=lesson.id, last_seen_at=now))
    else:
        row.last_seen_at = now
    await session.commit()


async def completed_lesson_ids(session: AsyncSession, user: User, lessons: list[Lesson]) -> set[int]:
    ids = [le.id for le in lessons]
    if not ids:
        return set()
    q = select(LessonProgress.lesson_id).where(
        LessonProgress.user_id == user.id,
        LessonProgress.lesson_id.in_(ids),
        LessonProgress.completed_at.is_not(None),
    )
    return set((await session.execute(q)).scalars().all())


async def build_progress(session: AsyncSession, user: User, course: Course) -> CourseProgress:
    ordered = _ordered_lessons(course)
    rows = []
    if ordered:
        q = select(LessonProgress).where(
            LessonProgress.user_id == user.id, LessonProgress.lesson_id.in_([le.id for le in ordered])
        )
        rows = (await session.execute(q)).scalars().all()
    done = {r.lesson_id for r in rows if r.completed_at is not None}
    position = {le.id: i for i, le in enumerate(ordered)}

    resume: Lesson | None = None
    if len(done) < len(ordered):
        last = max(rows, key=lambda r: r.last_seen_at) if rows else None
        if last is not None and last.lesson_id not in done:
            resume = ordered[position[last.lesson_id]]  # still watching this one
        else:
            start = position[last.lesson_id] + 1 if last is not None else 0
            resume = next((le for le in ordered[start:] if le.id not in done), None) or next(
                le for le in ordered if le.id not in done
            )
    total = len(ordered)
    return CourseProgress(
        course_slug=course.slug,
        course_title=course.title,
        total=total,
        completed=len(done),
        percent=round(100 * len(done) / total) if total else 0,
        started=bool(rows),
        completed_slugs=[le.slug for le in ordered if le.id in done],
        resume=LessonSummary.model_validate(resume) if resume else None,
    )


@router.get("/progress", response_model=list[CourseProgress])
async def all_progress(
    session: AsyncSession = Depends(get_async_session), user: User = Depends(current_active_user)
):
    courses = (await session.execute(_course_query().order_by(Course.position, Course.title))).scalars().all()
    return [await build_progress(session, user, c) for c in courses]


@router.get("/courses/{slug}/progress", response_model=CourseProgress)
async def course_progress(
    slug: str, session: AsyncSession = Depends(get_async_session), user: User = Depends(current_active_user)
):
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    return await build_progress(session, user, course)


@router.put("/courses/{slug}/lessons/{lesson_slug}/progress", response_model=CourseProgress)
async def set_lesson_completed(
    slug: str,
    lesson_slug: str,
    body: CompletedBody,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    lesson = next((le for le in _ordered_lessons(course) if le.slug == lesson_slug), None)
    if lesson is None:
        raise HTTPException(404, "Lesson not found")

    now = datetime.now(timezone.utc)
    row = await session.get(LessonProgress, (user.id, lesson.id))
    if row is None:
        row = LessonProgress(user_id=user.id, lesson_id=lesson.id)
        session.add(row)
    row.last_seen_at = now
    if body.completed:
        row.completed_at = row.completed_at or now  # keep the original completion time
    else:
        row.completed_at = None
    await session.commit()
    return await build_progress(session, user, course)
