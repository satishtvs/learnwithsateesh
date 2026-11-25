"""Learner feedback on a part (report a mistake, say it is unclear, suggest something) and the instructor's inbox.

Learners must be signed in (keeps spam out) and can send a limited number per day. The instructor sees every
report with the part, the learner and the video time, and moves it through new, in progress, resolved or dismissed.
"""
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.admin import require_instructor
from app.db import get_async_session
from app.models import Course, Part, PartFeedback, User
from app.users import current_active_user

Kind = Literal["mistake", "unclear", "suggestion", "other"]
Status = Literal["new", "in_progress", "resolved", "dismissed"]
DAILY_LIMIT = 10

router = APIRouter(prefix="/courses", tags=["feedback"])
admin_router = APIRouter(prefix="/admin/feedback", tags=["admin"], dependencies=[Depends(require_instructor)])


class FeedbackIn(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    kind: Kind = "mistake"
    message: str = Field(min_length=5, max_length=2000)
    video_time_seconds: int | None = Field(default=None, ge=0, le=86400)


@router.post("/{slug}/parts/{part_slug}/feedback", status_code=201)
async def send_feedback(
    slug: str,
    part_slug: str,
    body: FeedbackIn,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    part = (
        await session.execute(
            select(Part).join(Course, Course.id == Part.course_id)
            .where(Course.slug == slug, Part.slug == part_slug, Part.published.is_(True))
        )
    ).scalar_one_or_none()
    if part is None:
        raise HTTPException(404, "Part not found")
    since = datetime.now(timezone.utc) - timedelta(days=1)
    sent = (
        await session.execute(
            select(func.count()).select_from(PartFeedback)
            .where(PartFeedback.user_id == user.id, PartFeedback.created_at >= since)
        )
    ).scalar_one()
    if sent >= DAILY_LIMIT:
        raise HTTPException(429, "You have sent several reports today. Please try again tomorrow.")
    session.add(PartFeedback(
        part_id=part.id, user_id=user.id, kind=body.kind, message=body.message,
        video_time_seconds=body.video_time_seconds,
    ))
    await session.commit()
    return {"ok": True}


# ---------------------------------------------------------------- admin
class FeedbackOut(BaseModel):
    id: int
    kind: Kind
    message: str
    video_time_seconds: int | None
    status: Status
    admin_note: str
    created_at: datetime
    updated_at: datetime | None
    part_id: int
    part_title: str
    part_slug: str
    course_slug: str
    course_title: str
    learner_name: str
    learner_email: str


class FeedbackList(BaseModel):
    counts: dict[str, int]
    items: list[FeedbackOut]


class FeedbackPatch(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    status: Status | None = None
    admin_note: str | None = Field(default=None, max_length=2000)


def _out(f: PartFeedback, p: Part, c: Course, u: User | None) -> FeedbackOut:
    return FeedbackOut(
        id=f.id, kind=f.kind, message=f.message, video_time_seconds=f.video_time_seconds, status=f.status,
        admin_note=f.admin_note or "", created_at=f.created_at, updated_at=f.updated_at, part_id=p.id,
        part_title=p.title, part_slug=p.slug, course_slug=c.slug, course_title=c.title,
        learner_name=((u.full_name or "").strip() or u.email.split("@")[0]) if u else "Deleted user",
        learner_email=u.email if u else "",
    )


@admin_router.get("", response_model=FeedbackList)
async def list_feedback(status: str = "open", session: AsyncSession = Depends(get_async_session)):
    """status: open (new + in progress, the default), all, or one status. Newest first."""
    counts = {s: 0 for s in ("new", "in_progress", "resolved", "dismissed")}
    for st, n in (await session.execute(select(PartFeedback.status, func.count()).group_by(PartFeedback.status))).all():
        counts[st] = n
    q = (
        select(PartFeedback, Part, Course, User)
        .join(Part, Part.id == PartFeedback.part_id)
        .join(Course, Course.id == Part.course_id)
        .outerjoin(User, User.id == PartFeedback.user_id)
        .order_by(PartFeedback.created_at.desc())
        .limit(500)
    )
    if status == "open":
        q = q.where(PartFeedback.status.in_(("new", "in_progress")))
    elif status != "all":
        if status not in counts:
            raise HTTPException(422, "Unknown status")
        q = q.where(PartFeedback.status == status)
    rows = (await session.execute(q)).unique().all()
    return FeedbackList(counts=counts, items=[_out(*r) for r in rows])


@admin_router.patch("/{feedback_id}", response_model=FeedbackOut)
async def update_feedback(feedback_id: int, body: FeedbackPatch, session: AsyncSession = Depends(get_async_session)):
    f = await session.get(PartFeedback, feedback_id)
    if f is None:
        raise HTTPException(404, "Feedback not found")
    if body.status is not None:
        f.status = body.status
    if body.admin_note is not None:
        f.admin_note = body.admin_note
    f.updated_at = datetime.now(timezone.utc)
    await session.commit()
    row = (
        await session.execute(
            select(PartFeedback, Part, Course, User)
            .join(Part, Part.id == PartFeedback.part_id).join(Course, Course.id == Part.course_id)
            .outerjoin(User, User.id == PartFeedback.user_id).where(PartFeedback.id == feedback_id)
        )
    ).unique().one()
    return _out(*row)


@admin_router.delete("/{feedback_id}", status_code=204)
async def delete_feedback(feedback_id: int, session: AsyncSession = Depends(get_async_session)):
    f = await session.get(PartFeedback, feedback_id)
    if f is None:
        raise HTTPException(404, "Feedback not found")
    await session.delete(f)
    await session.commit()
