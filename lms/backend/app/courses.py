"""Course catalogue API. Outlines and free-preview parts are public; other parts need a signed-in user."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_async_session
from app.models import Branch, Course, Part, Quiz, Regulation, Unit, University, User
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


class UniversityRef(BaseModel):
    slug: str
    name: str
    short_name: str


class RegulationRef(BaseModel):
    code: str
    label: str


class BranchRef(BaseModel):
    slug: str
    name: str
    short_name: str


class CourseMeta(BaseModel):
    """Catalogue metadata shared by the course list and the course page (any of it may be empty)."""
    university: UniversityRef | None = None
    regulations: list[RegulationRef] = []
    branches: list[BranchRef] = []
    year: int | None = None
    semester: int | None = None
    subject_code: str | None = None
    unit_count: int = 0
    part_count: int = 0  # published parts
    quiz_count: int = 0  # published quizzes
    has_preview: bool = False  # at least one published free-preview part


class CourseSummary(CourseMeta):
    slug: str
    title: str
    description: str
    previews: list[PartSummary]  # parts anyone can watch without an account


class CourseOut(CourseMeta):
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
    quiz_slug: str | None = None  # the part's own published quiz (quiz slug == part slug), if any
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
            selectinload(Course.university),
            selectinload(Course.regulations),
            selectinload(Course.branches),
        )
    )


def _ordered_parts(course: Course) -> list[Part]:
    """Watching order: overview parts first, then each unit's parts in order."""
    ordered = [le for le in _published(course.parts) if le.unit_id is None]
    for ch in course.units:
        ordered += _published(ch.parts)
    return ordered


async def _quiz_counts(session: AsyncSession, course_ids: list[int]) -> dict[int, int]:
    if not course_ids:
        return {}
    q = (
        select(Quiz.course_id, func.count())
        .where(Quiz.published.is_(True), Quiz.course_id.in_(course_ids))
        .group_by(Quiz.course_id)
    )
    return dict((await session.execute(q)).all())


def _meta(course: Course, quiz_count: int) -> dict:
    parts = _ordered_parts(course)
    uni = course.university
    return dict(
        university=UniversityRef(slug=uni.slug, name=uni.name, short_name=uni.short_name) if uni else None,
        regulations=[RegulationRef(code=r.code, label=r.label) for r in course.regulations],
        branches=[BranchRef(slug=b.slug, name=b.name, short_name=b.short_name) for b in course.branches],
        year=course.year,
        semester=course.semester,
        subject_code=course.subject_code,
        unit_count=len(course.units),
        part_count=len(parts),
        quiz_count=quiz_count,
        has_preview=any(p.is_preview for p in parts),
    )


def _filters(university, regulation, branch, year, semester, q) -> list:
    """WHERE conditions for the catalogue filters. Regulation and branch are matched within the university
    when one is given. Unknown values simply match nothing."""
    conds = []
    if university:
        conds.append(Course.university.has(University.slug == university.lower()))
    if regulation:
        reg = [func.upper(Regulation.code) == regulation.upper()]
        if university:
            reg.append(Regulation.university.has(University.slug == university.lower()))
        conds.append(Course.regulations.any(and_(*reg)))
    if branch:
        br = [Branch.slug == branch.lower()]
        if university:
            br.append(Branch.university.has(University.slug == university.lower()))
        conds.append(Course.branches.any(and_(*br)))
    if year is not None:
        conds.append(Course.year == year)
    if semester is not None:
        conds.append(Course.semester == semester)
    if q and q.strip():
        needle = q.strip().lower()
        conds.append(or_(
            func.lower(Course.title).contains(needle, autoescape=True),
            func.lower(Course.subject_code).contains(needle, autoescape=True),
        ))
    return conds


@router.get("", response_model=list[CourseSummary])
async def list_courses(
    university: str | None = None,
    regulation: str | None = None,
    branch: str | None = None,
    year: int | None = Query(default=None, ge=1, le=4),
    semester: int | None = Query(default=None, ge=1, le=2),
    q: str | None = Query(default=None, max_length=100),
    session: AsyncSession = Depends(get_async_session),
):
    query = _course_query(*_filters(university, regulation, branch, year, semester, q))
    courses = (await session.execute(query.order_by(Course.position, Course.title))).scalars().all()
    quizzes = await _quiz_counts(session, [c.id for c in courses])
    out = []
    for c in courses:
        parts = _ordered_parts(c)
        out.append(
            CourseSummary(
                slug=c.slug,
                title=c.title,
                description=c.description,
                previews=[PartSummary.model_validate(le) for le in parts if le.is_preview],
                **_meta(c, quizzes.get(c.id, 0)),
            )
        )
    return out


@router.get("/{slug}", response_model=CourseOut)
async def get_course(slug: str, session: AsyncSession = Depends(get_async_session)):
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    quizzes = await _quiz_counts(session, [course.id])
    return CourseOut(
        **_meta(course, quizzes.get(course.id, 0)),
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
    has_quiz = (
        await session.execute(
            select(Quiz.id).where(Quiz.course_id == course.id, Quiz.slug == part.slug, Quiz.published.is_(True))
        )
    ).first() is not None

    completed = False
    if user is not None:  # lazy import: progress.py imports this module
        from app.progress import completed_part_ids, record_visit

        await record_visit(session, user, part)
        completed = part.id in await completed_part_ids(session, user, [part])
    return PartOut(
        completed=completed,
        quiz_slug=part.slug if has_quiz else None,
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
