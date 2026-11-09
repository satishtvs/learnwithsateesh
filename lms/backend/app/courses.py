"""Course catalogue API. Outlines and free-preview lessons are public; other lessons need a signed-in user."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_async_session
from app.models import Chapter, Course, Lesson, User
from app.users import optional_user

router = APIRouter(prefix="/courses", tags=["courses"])


class LessonSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    title: str
    is_preview: bool


class ChapterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: str
    title: str
    unit: str | None
    textbook_ref: str | None
    lessons: list[LessonSummary]


class CourseSummary(BaseModel):
    slug: str
    title: str
    description: str
    lesson_count: int
    previews: list[LessonSummary]  # lessons anyone can watch without an account


class CourseOut(BaseModel):
    slug: str
    title: str
    description: str
    overview_lessons: list[LessonSummary]  # lessons not tied to a chapter (e.g. syllabus)
    chapters: list[ChapterOut]


class LessonOut(BaseModel):
    slug: str
    title: str
    youtube_id: str
    notes_md: str
    slides_url: str | None
    is_preview: bool
    chapter_code: str | None
    chapter_title: str | None
    prev: LessonSummary | None
    next: LessonSummary | None


def _published(lessons: list[Lesson]) -> list[Lesson]:
    return [lesson for lesson in lessons if lesson.published]


def _course_query(*conditions):
    return (
        select(Course)
        .where(Course.published.is_(True), *conditions)
        .options(
            selectinload(Course.chapters).selectinload(Chapter.lessons),
            selectinload(Course.lessons),
        )
    )


def _ordered_lessons(course: Course) -> list[Lesson]:
    """Watching order: overview lessons first, then each chapter's lessons in order."""
    ordered = [le for le in _published(course.lessons) if le.chapter_id is None]
    for ch in course.chapters:
        ordered += _published(ch.lessons)
    return ordered


@router.get("", response_model=list[CourseSummary])
async def list_courses(session: AsyncSession = Depends(get_async_session)):
    q = _course_query().order_by(Course.position, Course.title)
    out = []
    for c in (await session.execute(q)).scalars().all():
        lessons = _ordered_lessons(c)
        out.append(
            CourseSummary(
                slug=c.slug,
                title=c.title,
                description=c.description,
                lesson_count=len(lessons),
                previews=[LessonSummary.model_validate(le) for le in lessons if le.is_preview],
            )
        )
    return out


@router.get("/{slug}", response_model=CourseOut)
async def get_course(slug: str, session: AsyncSession = Depends(get_async_session)):
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    return CourseOut(
        slug=course.slug,
        title=course.title,
        description=course.description,
        overview_lessons=[
            LessonSummary.model_validate(le) for le in _published(course.lessons) if le.chapter_id is None
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
    user: User | None = Depends(optional_user),
):
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    ordered = _ordered_lessons(course)
    idx = next((i for i, le in enumerate(ordered) if le.slug == lesson_slug), None)
    if idx is None:
        raise HTTPException(404, "Lesson not found")
    lesson = ordered[idx]
    # Locked lessons never reveal their video id to anonymous visitors.
    if not lesson.is_preview and user is None:
        raise HTTPException(401, "login_required")
    chapter = next((c for c in course.chapters if c.id == lesson.chapter_id), None)
    return LessonOut(
        slug=lesson.slug,
        title=lesson.title,
        youtube_id=lesson.youtube_id,
        notes_md=lesson.notes_md,
        slides_url=lesson.slides_url,
        is_preview=lesson.is_preview,
        chapter_code=chapter.code if chapter else None,
        chapter_title=chapter.title if chapter else None,
        prev=LessonSummary.model_validate(ordered[idx - 1]) if idx > 0 else None,
        next=LessonSummary.model_validate(ordered[idx + 1]) if idx < len(ordered) - 1 else None,
    )
