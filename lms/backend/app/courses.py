"""Course catalogue API. Outlines and free-preview parts are public; other parts need a signed-in user."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_async_session
from app.models import Unit, Course, Part, User
from app.users import optional_user

router = APIRouter(prefix="/courses", tags=["courses"])


class PartSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    slug: str
    title: str
    is_preview: bool


class UnitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    code: str
    title: str
    label: str | None
    textbook_ref: str | None
    parts: list[PartSummary]


class CourseSummary(BaseModel):
    slug: str
    title: str
    description: str
    part_count: int
    previews: list[PartSummary]  # parts anyone can watch without an account


class CourseOut(BaseModel):
    slug: str
    title: str
    description: str
    overview_parts: list[PartSummary]  # parts not tied to a unit (e.g. syllabus)
    units: list[UnitOut]


class PartOut(BaseModel):
    slug: str
    title: str
    youtube_id: str
    notes_md: str
    slides_url: str | None
    is_preview: bool
    completed: bool = False  # for the signed-in user; always False for anonymous visitors
    unit_code: str | None
    unit_title: str | None
    prev: PartSummary | None
    next: PartSummary | None


def _published(parts: list[Part]) -> list[Part]:
    return [part for part in parts if part.published]


def _course_query(*conditions):
    return (
        select(Course)
        .where(Course.published.is_(True), *conditions)
        .options(
            selectinload(Course.units).selectinload(Unit.parts),
            selectinload(Course.parts),
        )
    )


def _ordered_parts(course: Course) -> list[Part]:
    """Watching order: overview parts first, then each unit's parts in order."""
    ordered = [le for le in _published(course.parts) if le.unit_id is None]
    for ch in course.units:
        ordered += _published(ch.parts)
    return ordered


@router.get("", response_model=list[CourseSummary])
async def list_courses(session: AsyncSession = Depends(get_async_session)):
    q = _course_query().order_by(Course.position, Course.title)
    out = []
    for c in (await session.execute(q)).scalars().all():
        parts = _ordered_parts(c)
        out.append(
            CourseSummary(
                slug=c.slug,
                title=c.title,
                description=c.description,
                part_count=len(parts),
                previews=[PartSummary.model_validate(le) for le in parts if le.is_preview],
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
        overview_parts=[
            PartSummary.model_validate(le) for le in _published(course.parts) if le.unit_id is None
        ],
        units=[
            UnitOut(
                code=ch.code,
                title=ch.title,
                label=ch.label,
                textbook_ref=ch.textbook_ref,
                parts=[PartSummary.model_validate(le) for le in _published(ch.parts)],
            )
            for ch in course.units
        ],
    )


@router.get("/{slug}/parts/{part_slug}", response_model=PartOut)
async def get_part(
    slug: str,
    part_slug: str,
    session: AsyncSession = Depends(get_async_session),
    user: User | None = Depends(optional_user),
):
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    ordered = _ordered_parts(course)
    idx = next((i for i, le in enumerate(ordered) if le.slug == part_slug), None)
    if idx is None:
        raise HTTPException(404, "Part not found")
    part = ordered[idx]
    # Locked parts never reveal their video id to anonymous visitors.
    if not part.is_preview and user is None:
        raise HTTPException(401, "login_required")
    unit = next((c for c in course.units if c.id == part.unit_id), None)

    completed = False
    if user is not None:  # lazy import: progress.py imports this module
        from app.progress import completed_part_ids, record_visit

        await record_visit(session, user, part)
        completed = part.id in await completed_part_ids(session, user, [part])
    return PartOut(
        completed=completed,
        slug=part.slug,
        title=part.title,
        youtube_id=part.youtube_id,
        notes_md=part.notes_md,
        slides_url=part.slides_url,
        is_preview=part.is_preview,
        unit_code=unit.code if unit else None,
        unit_title=unit.title if unit else None,
        prev=PartSummary.model_validate(ordered[idx - 1]) if idx > 0 else None,
        next=PartSummary.model_validate(ordered[idx + 1]) if idx < len(ordered) - 1 else None,
    )
