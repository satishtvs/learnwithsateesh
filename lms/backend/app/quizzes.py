"""Quizzes: listing is public; taking a quiz needs a free account. Answers are only revealed after submitting."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_async_session
from app.models import Chapter, Course, Quiz, QuizAttempt, User
from app.users import current_active_user, optional_user

router = APIRouter(prefix="/courses/{slug}/quizzes", tags=["quizzes"])


class QuizSummary(BaseModel):
    slug: str
    title: str
    chapter_code: str | None
    question_count: int
    pass_percent: int
    best_percent: int | None  # the signed-in user's best attempt; None if never attempted
    passed: bool


class QuestionOut(BaseModel):
    id: int
    prompt: str
    options: list[str]


class QuizOut(BaseModel):
    slug: str
    title: str
    chapter_code: str | None
    chapter_title: str | None
    pass_percent: int
    questions: list[QuestionOut]
    best_percent: int | None
    passed: bool


class AttemptIn(BaseModel):
    answers: dict[int, int | None]  # question id -> chosen option index (null = skipped)


class QuestionResult(BaseModel):
    question_id: int
    chosen: int | None
    correct_index: int
    correct: bool
    explanation: str


class AttemptOut(BaseModel):
    score: int
    total: int
    percent: int
    passed: bool
    pass_percent: int
    results: list[QuestionResult]


def _percent(score: int, total: int) -> int:
    return round(100 * score / total) if total else 0


async def _best_by_quiz(session: AsyncSession, user: User | None, quiz_ids: list[int]) -> dict[int, tuple[int, bool]]:
    """quiz id -> (best percent, ever passed) for this user."""
    if user is None or not quiz_ids:
        return {}
    q = (
        select(QuizAttempt.quiz_id, QuizAttempt.score, QuizAttempt.total, QuizAttempt.passed)
        .where(QuizAttempt.user_id == user.id, QuizAttempt.quiz_id.in_(quiz_ids))
    )
    best: dict[int, tuple[int, bool]] = {}
    for quiz_id, score, total, passed in (await session.execute(q)).all():
        pct, was = best.get(quiz_id, (0, False))
        best[quiz_id] = (max(pct, _percent(score, total)), was or passed)
    return best


async def _load_quiz(session: AsyncSession, slug: str, quiz_slug: str) -> tuple[Course, Quiz, Chapter | None]:
    course = (
        await session.execute(select(Course).where(Course.slug == slug, Course.published.is_(True)))
    ).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    quiz = (
        await session.execute(
            select(Quiz)
            .where(Quiz.course_id == course.id, Quiz.slug == quiz_slug, Quiz.published.is_(True))
            .options(selectinload(Quiz.questions))
        )
    ).scalar_one_or_none()
    if quiz is None:
        raise HTTPException(404, "Quiz not found")
    chapter = await session.get(Chapter, quiz.chapter_id) if quiz.chapter_id else None
    return course, quiz, chapter


class CourseQuiz(QuizSummary):
    course_slug: str
    course_title: str


async def _course_summaries(session: AsyncSession, course: Course, user: User | None) -> list[QuizSummary]:
    quizzes = (
        await session.execute(
            select(Quiz)
            .where(Quiz.course_id == course.id, Quiz.published.is_(True))
            .options(selectinload(Quiz.questions))
            .order_by(Quiz.position)
        )
    ).scalars().all()
    chapters = {c.id: c.code for c in (await session.execute(select(Chapter).where(Chapter.course_id == course.id))).scalars()}
    best = await _best_by_quiz(session, user, [qz.id for qz in quizzes])
    return [
        QuizSummary(
            slug=qz.slug,
            title=qz.title,
            chapter_code=chapters.get(qz.chapter_id),
            question_count=len(qz.questions),
            pass_percent=qz.pass_percent,
            best_percent=best[qz.id][0] if qz.id in best else None,
            passed=best[qz.id][1] if qz.id in best else False,
        )
        for qz in quizzes
    ]


@router.get("", response_model=list[QuizSummary])
async def list_quizzes(
    slug: str, session: AsyncSession = Depends(get_async_session), user: User | None = Depends(optional_user)
):
    course = (
        await session.execute(select(Course).where(Course.slug == slug, Course.published.is_(True)))
    ).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    return await _course_summaries(session, course, user)


me_router = APIRouter(prefix="/me/quiz-attempts", tags=["quizzes"])


class MyAttempt(BaseModel):
    quiz_slug: str
    quiz_title: str
    course_slug: str
    course_title: str
    score: int
    total: int
    percent: int
    passed: bool
    created_at: datetime


@me_router.get("", response_model=list[MyAttempt])
async def my_attempts(
    limit: int = Query(50, ge=1, le=200),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """The signed-in learner's own attempts, newest first. Attempts on quizzes that are no longer visible are left out."""
    q = (
        select(QuizAttempt, Quiz, Course)
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .join(Course, Course.id == Quiz.course_id)
        .where(QuizAttempt.user_id == user.id, Quiz.published.is_(True), Course.published.is_(True))
        .order_by(QuizAttempt.created_at.desc(), QuizAttempt.id.desc())
        .limit(limit)
    )
    return [
        MyAttempt(
            quiz_slug=quiz.slug, quiz_title=quiz.title, course_slug=course.slug, course_title=course.title,
            score=a.score, total=a.total, percent=_percent(a.score, a.total), passed=a.passed, created_at=a.created_at,
        )
        for a, quiz, course in (await session.execute(q)).all()
    ]


all_router = APIRouter(prefix="/quizzes", tags=["quizzes"])


@all_router.get("", response_model=list[CourseQuiz])
async def list_all_quizzes(
    session: AsyncSession = Depends(get_async_session), user: User | None = Depends(optional_user)
):
    """Every visible quiz across all published courses (for the Quizzes page)."""
    courses = (
        await session.execute(select(Course).where(Course.published.is_(True)).order_by(Course.position, Course.title))
    ).scalars().all()
    out: list[CourseQuiz] = []
    for course in courses:
        for s in await _course_summaries(session, course, user):
            out.append(CourseQuiz(**s.model_dump(), course_slug=course.slug, course_title=course.title))
    return out


@router.get("/{quiz_slug}", response_model=QuizOut)
async def get_quiz(
    slug: str,
    quiz_slug: str,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    _, quiz, chapter = await _load_quiz(session, slug, quiz_slug)
    best = (await _best_by_quiz(session, user, [quiz.id])).get(quiz.id)
    return QuizOut(
        slug=quiz.slug,
        title=quiz.title,
        chapter_code=chapter.code if chapter else None,
        chapter_title=chapter.title if chapter else None,
        pass_percent=quiz.pass_percent,
        questions=[QuestionOut(id=q.id, prompt=q.prompt, options=list(q.options)) for q in quiz.questions],
        best_percent=best[0] if best else None,
        passed=best[1] if best else False,
    )


@router.post("/{quiz_slug}/attempts", response_model=AttemptOut)
async def submit_attempt(
    slug: str,
    quiz_slug: str,
    body: AttemptIn,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    _, quiz, _ = await _load_quiz(session, slug, quiz_slug)
    valid = {q.id: q for q in quiz.questions}
    for qid, choice in body.answers.items():
        if qid not in valid:
            raise HTTPException(422, f"Unknown question {qid}")
        if choice is not None and not 0 <= choice < len(valid[qid].options):
            raise HTTPException(422, f"Invalid option for question {qid}")

    results = []
    for q in quiz.questions:
        chosen = body.answers.get(q.id)
        results.append(
            QuestionResult(
                question_id=q.id,
                chosen=chosen,
                correct_index=q.correct_index,
                correct=chosen == q.correct_index,
                explanation=q.explanation,
            )
        )
    score = sum(r.correct for r in results)
    total = len(results)
    percent = _percent(score, total)
    passed = percent >= quiz.pass_percent
    session.add(
        QuizAttempt(
            user_id=user.id,
            quiz_id=quiz.id,
            score=score,
            total=total,
            passed=passed,
            answers={str(r.question_id): r.chosen for r in results},
        )
    )
    await session.commit()
    return AttemptOut(score=score, total=total, percent=percent, passed=passed,
                      pass_percent=quiz.pass_percent, results=results)
