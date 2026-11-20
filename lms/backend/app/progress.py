"""Per-user learning progress: which parts are complete, and where to resume."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.courses import PartSummary, _course_query, _ordered_parts
from app.db import get_async_session
from app.models import Course, Part, PartProgress, Quiz, QuizAttempt, User
from app.users import current_active_user, current_learner

router = APIRouter(tags=["progress"])


class CourseProgress(BaseModel):
    course_slug: str
    course_title: str
    total: int
    completed: int
    percent: int
    started: bool  # the user has opened at least one part
    completed_slugs: list[str]
    resume: PartSummary | None  # where to continue; None when nothing is left
    quizzes_total: int = 0  # visible quizzes in the course
    quizzes_passed: int = 0  # of those, how many this user has passed at least once
    last_seen_at: datetime | None = None  # when the user last opened or marked a part here (picks "most recent course")


class CompletedBody(BaseModel):
    completed: bool


async def record_visit(session: AsyncSession, user: User, part: Part) -> None:
    """Remember that the user opened this part (drives 'resume')."""
    row = await session.get(PartProgress, (user.id, part.id))
    now = datetime.now(timezone.utc)
    if row is None:
        session.add(PartProgress(user_id=user.id, part_id=part.id, last_seen_at=now))
    else:
        row.last_seen_at = now
    await session.commit()


async def completed_part_ids(session: AsyncSession, user: User, parts: list[Part]) -> set[int]:
    ids = [le.id for le in parts]
    if not ids:
        return set()
    q = select(PartProgress.part_id).where(
        PartProgress.user_id == user.id,
        PartProgress.part_id.in_(ids),
        PartProgress.completed_at.is_not(None),
    )
    return set((await session.execute(q)).scalars().all())


async def quiz_counts(session: AsyncSession, user: User, course: Course) -> tuple[int, int]:
    """(visible quizzes in the course, how many of them the user has passed)."""
    ids = list((await session.execute(select(Quiz.id).where(Quiz.course_id == course.id, Quiz.published.is_(True)))).scalars())
    if not ids:
        return 0, 0
    passed = (
        await session.execute(
            select(func.count(func.distinct(QuizAttempt.quiz_id))).where(
                QuizAttempt.user_id == user.id, QuizAttempt.quiz_id.in_(ids), QuizAttempt.passed.is_(True)
            )
        )
    ).scalar_one()
    return len(ids), passed


def _aware(dt: datetime) -> datetime:
    """SQLite hands back naive datetimes next to freshly set aware ones; treat naive as UTC so they compare."""
    return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)


async def build_progress(session: AsyncSession, user: User, course: Course) -> CourseProgress:
    ordered = _ordered_parts(course)
    rows = []
    if ordered:
        q = select(PartProgress).where(
            PartProgress.user_id == user.id, PartProgress.part_id.in_([le.id for le in ordered])
        )
        rows = (await session.execute(q)).scalars().all()
    done = {r.part_id for r in rows if r.completed_at is not None}
    position = {le.id: i for i, le in enumerate(ordered)}

    resume: Part | None = None
    if len(done) < len(ordered):
        last = max(rows, key=lambda r: r.last_seen_at) if rows else None
        if last is not None and last.part_id not in done:
            resume = ordered[position[last.part_id]]  # still watching this one
        else:
            start = position[last.part_id] + 1 if last is not None else 0
            resume = next((le for le in ordered[start:] if le.id not in done), None) or next(
                le for le in ordered if le.id not in done
            )
    total = len(ordered)
    quizzes_total, quizzes_passed = await quiz_counts(session, user, course)
    return CourseProgress(
        course_slug=course.slug,
        course_title=course.title,
        total=total,
        completed=len(done),
        percent=round(100 * len(done) / total) if total else 0,
        started=bool(rows),
        completed_slugs=[le.slug for le in ordered if le.id in done],
        resume=PartSummary.model_validate(resume) if resume else None,
        quizzes_total=quizzes_total,
        quizzes_passed=quizzes_passed,
        last_seen_at=max((_aware(r.last_seen_at) for r in rows if r.last_seen_at is not None), default=None),
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


@router.put("/courses/{slug}/parts/{part_slug}/progress", response_model=CourseProgress)
async def set_part_completed(
    slug: str,
    part_slug: str,
    body: CompletedBody,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_learner),
):
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    part = next((le for le in _ordered_parts(course) if le.slug == part_slug), None)
    if part is None:
        raise HTTPException(404, "Part not found")

    now = datetime.now(timezone.utc)
    row = await session.get(PartProgress, (user.id, part.id))
    if row is None:
        row = PartProgress(user_id=user.id, part_id=part.id)
        session.add(row)
    row.last_seen_at = now
    if body.completed:
        row.completed_at = row.completed_at or now  # keep the original completion time
    else:
        row.completed_at = None
    await session.commit()
    return await build_progress(session, user, course)
