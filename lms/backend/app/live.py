"""Live sessions: the instructor schedules them, learners see them, and only signed-in learners get the join link.

After a session the instructor can attach the YouTube recording, which then shows on the same card.
"""
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin import parse_youtube_id, require_instructor
from app.db import get_async_session
from app.models import Course, LiveSession, User
from app.users import optional_user

router = APIRouter(prefix="/live-sessions", tags=["live"])
admin_router = APIRouter(prefix="/admin/live-sessions", tags=["admin"], dependencies=[Depends(require_instructor)])


def _aware(dt: datetime) -> datetime:
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _status(s: LiveSession, now: datetime) -> Literal["upcoming", "live", "past"]:
    start = _aware(s.starts_at)
    if now < start:
        return "upcoming"
    return "live" if now < start + timedelta(minutes=s.duration_minutes) else "past"


class SessionOut(BaseModel):
    id: int
    title: str
    description: str
    starts_at: datetime
    duration_minutes: int
    status: Literal["upcoming", "live", "past"]
    course_slug: str | None
    course_title: str | None
    join_url: str | None  # only for signed-in users, and only while the session is not over
    recording_youtube_id: str | None


class AdminSessionOut(SessionOut):
    published: bool
    course_id: int | None
    join_url_raw: str


def _out(s: LiveSession, course: Course | None, signed_in: bool, now: datetime) -> SessionOut:
    status = _status(s, now)
    return SessionOut(
        id=s.id, title=s.title, description=s.description, starts_at=_aware(s.starts_at),
        duration_minutes=s.duration_minutes, status=status,
        course_slug=course.slug if course else None, course_title=course.title if course else None,
        join_url=s.join_url if signed_in and status != "past" and s.join_url else None,
        recording_youtube_id=s.recording_youtube_id,
    )


def _admin_out(s: LiveSession, course: Course | None, now: datetime) -> AdminSessionOut:
    base = _out(s, course, True, now)
    return AdminSessionOut(**base.model_dump(), published=s.published, course_id=s.course_id, join_url_raw=s.join_url)


class SessionIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=4000)
    starts_at: datetime
    duration_minutes: int = Field(default=60, ge=5, le=480)
    join_url: str = Field(default="", max_length=500)
    recording: str = Field(default="", max_length=300)  # YouTube link or id, optional
    course_id: int | None = None
    published: bool = False

    @field_validator("join_url")
    @classmethod
    def _url(cls, v: str) -> str:
        if v and not v.lower().startswith(("https://", "http://")):
            raise ValueError("The join link must start with https://")
        return v

    @field_validator("recording")
    @classmethod
    def _rec(cls, v: str) -> str:
        return parse_youtube_id(v) if v else ""


async def _course_map(session: AsyncSession) -> dict[int, Course]:
    return {c.id: c for c in (await session.execute(select(Course))).scalars().all()}


@router.get("", response_model=list[SessionOut])
async def list_sessions(session: AsyncSession = Depends(get_async_session), user: User | None = Depends(optional_user)):
    now = datetime.now(timezone.utc)
    rows = (await session.execute(select(LiveSession).where(LiveSession.published.is_(True)))).scalars().all()
    courses = await _course_map(session)
    out = [_out(s, courses.get(s.course_id), user is not None, now) for s in rows]
    upcoming = sorted((o for o in out if o.status != "past"), key=lambda o: o.starts_at)
    past = sorted((o for o in out if o.status == "past"), key=lambda o: o.starts_at, reverse=True)
    return upcoming + past


@admin_router.get("", response_model=list[AdminSessionOut])
async def admin_list(session: AsyncSession = Depends(get_async_session)):
    now = datetime.now(timezone.utc)
    rows = (await session.execute(select(LiveSession).order_by(LiveSession.starts_at.desc()))).scalars().all()
    courses = await _course_map(session)
    return [_admin_out(s, courses.get(s.course_id), now) for s in rows]


async def _check_course(session: AsyncSession, course_id: int | None) -> None:
    if course_id is not None and await session.get(Course, course_id) is None:
        raise HTTPException(422, "Unknown course")


def _apply(s: LiveSession, body: SessionIn) -> None:
    s.title, s.description, s.starts_at = body.title, body.description, body.starts_at
    s.duration_minutes, s.join_url = body.duration_minutes, body.join_url
    s.recording_youtube_id = body.recording or None
    s.course_id, s.published = body.course_id, body.published


@admin_router.post("", response_model=AdminSessionOut, status_code=201)
async def admin_create(body: SessionIn, session: AsyncSession = Depends(get_async_session)):
    await _check_course(session, body.course_id)
    s = LiveSession()
    _apply(s, body)
    session.add(s)
    await session.commit()
    await session.refresh(s)
    return _admin_out(s, await session.get(Course, s.course_id) if s.course_id else None, datetime.now(timezone.utc))


@admin_router.put("/{session_id}", response_model=AdminSessionOut)
async def admin_update(session_id: int, body: SessionIn, session: AsyncSession = Depends(get_async_session)):
    s = await session.get(LiveSession, session_id)
    if s is None:
        raise HTTPException(404, "Session not found")
    await _check_course(session, body.course_id)
    _apply(s, body)
    await session.commit()
    await session.refresh(s)
    return _admin_out(s, await session.get(Course, s.course_id) if s.course_id else None, datetime.now(timezone.utc))


@admin_router.delete("/{session_id}", status_code=204)
async def admin_delete(session_id: int, session: AsyncSession = Depends(get_async_session)):
    s = await session.get(LiveSession, session_id)
    if s is None:
        raise HTTPException(404, "Session not found")
    await session.delete(s)
    await session.commit()
