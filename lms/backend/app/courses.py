"""Course catalogue API. Outlines are public; lesson content needs a signed-in user."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_async_session
from app.models import Chapter, Course, Lesson, User
from app.users import current_active_user

router = APIRouter(prefix="/courses", tags=["courses"])


class LessonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    title: str


class ChapterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: str
    title: str
    unit: str | None
    textbook_ref: str | None
    lessons: list[LessonSummary]


class CourseSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    title: str
    description: str


class CourseOut(CourseSummary):
    overview_lessons: list[LessonSummary]  # lessons not tied to a chapter (e.g. syllabus)
    chapters: list[ChapterOut]


class LessonOut(BaseModel):
    slug: str
    title: str
    youtube_id: str
    notes_md: str
    slides_url: str | None
    chapter_code: str | None
    chapter_title: str | None
    prev: LessonSummary | None
    next: LessonSummary | None


def _published(lessons: list[Lesson]) -> list[Lesson]:
    return [lesson for lesson in lessons if lesson.published]


async def _get_course(session: AsyncSession, slug: str) -> Course:
    q = (
        select(Course)
        .where(Course.slug == slug, Course.published.is_(True))
        .options(
            selectinload(Course.chapters).selectinload(Chapter.lessons),
            selectinload(Course.lessons),
        )
    )
    course = (await session.execute(q)).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    return course


@router.get("", response_model=list[CourseSummary])
async def list_courses(session: AsyncSession = Depends(get_async_session)):
    q = select(Course).where(Course.published.is_(True)).order_by(Course.position, Course.title)
    return (await session.execute(q)).scalars().all()


@router.get("/{slug}", response_model=CourseOut)
async def get_course(slug: str, session: AsyncSession = Depends(get_async_session)):
    course = await _get_course(session, slug)
    return CourseOut(
        slug=course.slug,
        title=course.title,
        description=course.description,
        overview_lessons=[
            LessonSummary.model_validate(lesson)
            for lesson in _published(course.lessons)
            if lesson.chapter_id is None
        ],
        chapters=[
            ChapterOut(
                code=ch.code,
                title=ch.title,
                unit=ch.unit,
                textbook_ref=ch.textbook_ref,
                lessons=[LessonSummary.model_validate(le) for le in _published(ch.lessons)],
            )
            for ch in course.chapters
        ],
    )


@router.get("/{slug}/lessons/{lesson_slug}", response_model=LessonOut)
async def get_lesson(
    slug: str,
    lesson_slug: str,
    session: AsyncSession = Depends(get_async_session),
    _user: User = Depends(current_active_user),
):
    course = await _get_course(session, slug)
    # Watching order: overview lessons first, then each chapter's lessons in order.
    ordered = [le for le in _published(course.lessons) if le.chapter_id is None]
    for ch in course.chapters:
        ordered += _published(ch.lessons)

    idx = next((i for i, le in enumerate(ordered) if le.slug == lesson_slug), None)
    if idx is None:
        raise HTTPException(404, "Lesson not found")
    lesson = ordered[idx]
    chapter = next((c for c in course.chapters if c.id == lesson.chapter_id), None)
    return LessonOut(
        slug=lesson.slug,
        title=lesson.title,
        youtube_id=lesson.youtube_id,
        notes_md=lesson.notes_md,
        slides_url=lesson.slides_url,
        chapter_code=chapter.code if chapter else None,
        chapter_title=chapter.title if chapter else None,
        prev=LessonSummary.model_validate(ordered[idx - 1]) if idx > 0 else None,
        next=LessonSummary.model_validate(ordered[idx + 1]) if idx < len(ordered) - 1 else None,
    )
