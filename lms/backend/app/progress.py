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
    percent: int  # half minutes watched, half quizzes passed
    minutes_watched: int = 0
    minutes_total: int = 0
    started: bool  # the user has opened at least one part
    completed_slugs: list[str]
    resume: PartSummary | None  # where to continue; None when nothing is left
    quizzes_total: int = 0  # visible quizzes in the course
    quizzes_passed: int = 0  # of those, how many this user has passed at least once
    last_seen_at: datetime | None = None  # when the user last opened or marked a part here (picks "most recent course")


class CompletedBody(BaseModel):
    completed: bool


class WatchBody(BaseModel):
    seconds: int  # media seconds actually played by this learner (seeking ahead does not count)
    duration: int  # video length as reported by the player


class WatchOut(BaseModel):
    watched: bool
    watched_seconds: int
    duration_seconds: int
    completed: bool
    quiz_pending: bool  # the video is done but the part's quiz is not passed yet


WATCH_FRACTION = 0.9  # share of the video that must be played
MAX_SPEED = 2.0  # the fastest the player offers
WALL_CLOCK_CHECK = True  # the learner must have been on the part long enough (tests switch this off)


async def record_visit(session: AsyncSession, user: User, part: Part) -> None:
    """Remember that the user opened this part (drives 'resume')."""
    row = await session.get(PartProgress, (user.id, part.id))
    now = datetime.now(timezone.utc)
    if row is None:
        session.add(PartProgress(user_id=user.id, part_id=part.id, last_seen_at=now))
    else:
        row.last_seen_at = now
    await session.commit()


async def part_quiz_passed(session: AsyncSession, user: User, part: Part) -> bool | None:
    """None when the part has no visible quiz; otherwise whether the user has passed it."""
    quiz_id = (
        await session.execute(
            select(Quiz.id).where(Quiz.course_id == part.course_id, Quiz.slug == part.slug, Quiz.published.is_(True))
        )
    ).scalar_one_or_none()
    if quiz_id is None:
        return None
    return (
        await session.execute(
            select(QuizAttempt.id)
            .where(QuizAttempt.user_id == user.id, QuizAttempt.quiz_id == quiz_id, QuizAttempt.passed.is_(True))
            .limit(1)
        )
    ).first() is not None


async def complete_if_ready(session: AsyncSession, user: User, part: Part) -> bool:
    """Mark the part complete once the video is watched and the quiz (if any) is passed. Returns whether it is complete."""
    row = await session.get(PartProgress, (user.id, part.id))
    if row is None or row.watched_at is None:
        return False
    if await part_quiz_passed(session, user, part) is False:
        return row.completed_at is not None
    if row.completed_at is None:
        row.completed_at = datetime.now(timezone.utc)
        await session.commit()
    return True


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

    # Progress = half the minutes watched, half the quizzes passed (all minutes when the course has no quiz).
    # A part without a known length counts as an average-length part until its length is known.
    known = [le.duration_seconds for le in ordered if le.duration_seconds]
    fallback = sum(known) // len(known) if known else 60
    length = {le.id: le.duration_seconds or fallback for le in ordered}
    by_part = {r.part_id: r for r in rows}
    total_seconds = sum(length.values())
    watched_seconds = 0
    for le in ordered:
        r = by_part.get(le.id)
        if r is not None:  # watched (or completed before watch tracking existed) counts in full
            watched_seconds += length[le.id] if r.watched_at or r.completed_at else min(r.watched_seconds or 0, length[le.id])
    watch_share = watched_seconds / total_seconds if total_seconds else 0.0
    quiz_share = quizzes_passed / quizzes_total if quizzes_total else None
    share = watch_share if quiz_share is None else (watch_share + quiz_share) / 2
    return CourseProgress(
        course_slug=course.slug,
        course_title=course.title,
        total=total,
        completed=len(done),
        percent=100 if share >= 1 else int(share * 100),
        minutes_watched=watched_seconds // 60,
        minutes_total=total_seconds // 60,
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
        if row.watched_at is None:
            raise HTTPException(409, "Watch the whole video first.")
        if await part_quiz_passed(session, user, part) is False:
            raise HTTPException(409, "Pass the quiz first.")
        row.completed_at = row.completed_at or now  # keep the original completion time
    else:
        row.completed_at = None
    await session.commit()
    return await build_progress(session, user, course)


@router.post("/courses/{slug}/parts/{part_slug}/watch", response_model=WatchOut)
async def report_watch(
    slug: str,
    part_slug: str,
    body: WatchBody,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_learner),
):
    """The player reports how much of the video was really played. The part completes when that reaches the
    threshold (and the quiz, if any, is passed)."""
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    part = next((le for le in _ordered_parts(course) if le.slug == part_slug), None)
    if part is None:
        raise HTTPException(404, "Part not found")
    if part.duration_seconds is None:
        if body.duration < 30:
            raise HTTPException(422, "Video length unknown")
        part.duration_seconds = min(body.duration, 4 * 3600)  # the first report fills it in
    duration = part.duration_seconds

    now = datetime.now(timezone.utc)
    row = await session.get(PartProgress, (user.id, part.id))
    if row is None:
        row = PartProgress(user_id=user.id, part_id=part.id)
        session.add(row)
    row.last_seen_at = now
    if row.watch_started_at is None:
        row.watch_started_at = now
    row.watched_seconds = max(row.watched_seconds or 0, min(max(body.seconds, 0), duration))
    if row.watched_at is None and row.watched_seconds >= WATCH_FRACTION * duration:
        elapsed = (now - _aware(row.watch_started_at)).total_seconds()
        if not WALL_CLOCK_CHECK or elapsed >= WATCH_FRACTION * duration / MAX_SPEED:
            row.watched_at = now
    await session.commit()
    completed = await complete_if_ready(session, user, part) if row.watched_at else False
    return WatchOut(
        watched=row.watched_at is not None,
        watched_seconds=row.watched_seconds,
        duration_seconds=duration,
        completed=completed,
        quiz_pending=row.watched_at is not None and not completed,
    )
