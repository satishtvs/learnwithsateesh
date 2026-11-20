"""Catalogue structure (University > Branch > Course, regulation as a filter), the semester matrix,
and the signed-in student's "My syllabus" (their default filter). See API-catalogue.md."""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db import get_async_session
from app.models import Branch, Course, Regulation, University, User, course_branch, course_regulation
from app.users import current_active_user

router = APIRouter(prefix="/catalogue", tags=["catalogue"])
me_router = APIRouter(prefix="/me", tags=["me"])

ROMAN = {1: "I", 2: "II", 3: "III", 4: "IV"}
SEMESTERS = [(y, s) for y in range(1, 5) for s in (1, 2)]
YEAR = Field(default=None, ge=1, le=4)
SEMESTER = Field(default=None, ge=1, le=2)
JOINED_YEAR = Field(default=None, ge=2015, le=2035)


# ---------------------------------------------------------------- schemas
class RegulationOut(BaseModel):
    code: str
    label: str
    joined_year: int | None


class BranchOut(BaseModel):
    slug: str
    name: str
    short_name: str


class UniversityOut(BaseModel):
    slug: str
    name: str
    short_name: str
    regulations: list[RegulationOut]
    branches: list[BranchOut]


class CatalogueOut(BaseModel):
    universities: list[UniversityOut]


class MatrixBranch(BaseModel):
    slug: str
    short_name: str


class MatrixSemester(BaseModel):
    key: str  # "3-1"
    label: str  # "III-I"
    year: int
    semester: int


class MatrixCell(BaseModel):
    branch: str
    year: int
    semester: int
    count: int


class MatrixOut(BaseModel):
    university: str
    regulation: str | None
    branches: list[MatrixBranch]
    semesters: list[MatrixSemester]
    cells: list[MatrixCell]  # only non-empty cells; a missing cell means 0


class SuggestOut(BaseModel):
    regulation: str | None


class SyllabusIn(BaseModel):
    university: str | None = None  # slug
    regulation: str | None = None  # code, e.g. "R22"
    branch: str | None = None  # slug
    joined_year: int | None = JOINED_YEAR
    year: int | None = YEAR
    semester: int | None = SEMESTER


class SyllabusOut(BaseModel):
    university: str | None = None
    university_name: str | None = None
    university_short_name: str | None = None
    regulation: str | None = None
    regulation_label: str | None = None
    branch: str | None = None
    branch_name: str | None = None
    branch_short_name: str | None = None
    joined_year: int | None = None
    year: int | None = None
    semester: int | None = None


# ---------------------------------------------------------------- helpers
def semester_label(year: int, semester: int) -> str:
    return f"{ROMAN[year]}-{ROMAN[semester]}"


async def get_university(session: AsyncSession, slug: str) -> University | None:
    return (await session.execute(select(University).where(University.slug == slug))).scalar_one_or_none()


async def get_regulation(session: AsyncSession, university: University, code: str) -> Regulation | None:
    return (await session.execute(select(Regulation).where(
        Regulation.university_id == university.id, func.upper(Regulation.code) == code.upper()
    ))).scalar_one_or_none()


async def get_branch(session: AsyncSession, university: University, slug: str) -> Branch | None:
    return (await session.execute(select(Branch).where(
        Branch.university_id == university.id, Branch.slug == slug.lower()
    ))).scalar_one_or_none()


async def suggest_regulation(session: AsyncSession, university: University, joined_year: int) -> Regulation | None:
    """The regulation with the greatest joined_year that is <= the student's year of joining."""
    return (await session.execute(
        select(Regulation)
        .where(Regulation.university_id == university.id, Regulation.joined_year.is_not(None),
               Regulation.joined_year <= joined_year)
        .order_by(Regulation.joined_year.desc())
        .limit(1)
    )).scalar_one_or_none()


async def _university_or_404(session: AsyncSession, slug: str) -> University:
    uni = await get_university(session, slug)
    if uni is None:
        raise HTTPException(404, "University not found")
    return uni


# ---------------------------------------------------------------- public endpoints
@router.get("", response_model=CatalogueOut)
async def catalogue(session: AsyncSession = Depends(get_async_session)):
    unis = (await session.execute(
        select(University).order_by(University.position, University.name)
        .options(selectinload(University.regulations), selectinload(University.branches))
    )).scalars().all()
    return CatalogueOut(universities=[
        UniversityOut(
            slug=u.slug, name=u.name, short_name=u.short_name,
            regulations=[RegulationOut(code=r.code, label=r.label, joined_year=r.joined_year) for r in u.regulations],
            branches=[BranchOut(slug=b.slug, name=b.name, short_name=b.short_name) for b in u.branches],
        )
        for u in unis
    ])


@router.get("/matrix", response_model=MatrixOut)
async def matrix(
    university: str,
    regulation: str | None = None,
    session: AsyncSession = Depends(get_async_session),
):
    """Branches across, semesters down; each cell counts the PUBLISHED courses mapped to that branch and semester."""
    uni = await _university_or_404(session, university)
    branches = (await session.execute(
        select(Branch).where(Branch.university_id == uni.id).order_by(Branch.position, Branch.name)
    )).scalars().all()

    q = (
        select(Branch.slug, Course.year, Course.semester, func.count(Course.id.distinct()))
        .select_from(Course)
        .join(course_branch, course_branch.c.course_id == Course.id)
        .join(Branch, Branch.id == course_branch.c.branch_id)
        .where(Course.published.is_(True), Branch.university_id == uni.id,
               Course.year.is_not(None), Course.semester.is_not(None))
        .group_by(Branch.slug, Course.year, Course.semester)
    )
    reg_code = None
    if regulation:
        reg = await get_regulation(session, uni, regulation)
        if reg is None:
            raise HTTPException(404, "Regulation not found")
        reg_code = reg.code
        q = q.where(Course.id.in_(
            select(course_regulation.c.course_id).where(course_regulation.c.regulation_id == reg.id)
        ))
    rows = (await session.execute(q)).all()
    order = {b.slug: i for i, b in enumerate(branches)}
    cells = sorted(
        (MatrixCell(branch=slug, year=y, semester=s, count=n) for slug, y, s, n in rows),
        key=lambda c: (c.year, c.semester, order.get(c.branch, 0)),
    )
    return MatrixOut(
        university=uni.slug,
        regulation=reg_code,
        branches=[MatrixBranch(slug=b.slug, short_name=b.short_name) for b in branches],
        semesters=[MatrixSemester(key=f"{y}-{s}", label=semester_label(y, s), year=y, semester=s) for y, s in SEMESTERS],
        cells=cells,
    )


@router.get("/suggest-regulation", response_model=SuggestOut)
async def suggest(
    university: str,
    joined_year: int = Query(ge=2015, le=2035),
    session: AsyncSession = Depends(get_async_session),
):
    uni = await _university_or_404(session, university)
    reg = await suggest_regulation(session, uni, joined_year)
    return SuggestOut(regulation=reg.code if reg else None)


# ---------------------------------------------------------------- My syllabus (signed in)
async def _syllabus_out(session: AsyncSession, user: User) -> SyllabusOut:
    out = SyllabusOut(joined_year=user.joined_year, year=user.year, semester=user.semester)
    if user.university_id is not None and (uni := await session.get(University, user.university_id)):
        out.university, out.university_name, out.university_short_name = uni.slug, uni.name, uni.short_name
    if user.regulation_id is not None and (reg := await session.get(Regulation, user.regulation_id)):
        out.regulation, out.regulation_label = reg.code, reg.label
    if user.branch_id is not None and (br := await session.get(Branch, user.branch_id)):
        out.branch, out.branch_name, out.branch_short_name = br.slug, br.name, br.short_name
    return out


@me_router.get("/syllabus", response_model=SyllabusOut)
async def get_syllabus(
    user: User = Depends(current_active_user), session: AsyncSession = Depends(get_async_session)
):
    return await _syllabus_out(session, user)


@me_router.put("/syllabus", response_model=SyllabusOut)
async def put_syllabus(
    body: SyllabusIn,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    """Replaces the whole syllabus: fields left out are cleared."""
    uni = reg = br = None
    if body.university:
        uni = await get_university(session, body.university)
        if uni is None:
            raise HTTPException(422, "unknown_university")
    if body.regulation:
        if uni is None:
            raise HTTPException(422, "regulation_needs_university")
        reg = await get_regulation(session, uni, body.regulation)
        if reg is None:
            raise HTTPException(422, "unknown_regulation")
    if body.branch:
        if uni is None:
            raise HTTPException(422, "branch_needs_university")
        br = await get_branch(session, uni, body.branch)
        if br is None:
            raise HTTPException(422, "unknown_branch")
    # `user` comes from the auth dependency's own session: update the row through this one.
    row = await session.get(User, user.id)
    row.university_id = uni.id if uni else None
    row.regulation_id = reg.id if reg else None
    row.branch_id = br.id if br else None
    row.joined_year, row.year, row.semester = body.joined_year, body.year, body.semester
    await session.commit()
    return await _syllabus_out(session, row)
