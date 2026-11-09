"""Certificates of completion: claimed by a learner once every lesson in a course is complete."""
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.courses import _course_query
from app.db import get_async_session
from app.models import Certificate, Course, User
from app.progress import build_progress
from app.users import current_active_user

router = APIRouter(tags=["certificates"])
ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no look-alike characters


class CertificateOut(BaseModel):
    code: str
    learner_name: str
    course_slug: str
    course_title: str
    lesson_count: int
    issued_at: datetime


def new_code() -> str:
    return "LWS-" + "".join(secrets.choice(ALPHABET) for _ in range(10))


def _out(cert: Certificate, course: Course) -> CertificateOut:
    return CertificateOut(
        code=cert.code, learner_name=cert.learner_name, course_slug=course.slug, course_title=course.title,
        lesson_count=cert.lesson_count, issued_at=cert.issued_at,
    )


@router.post("/courses/{slug}/certificate", response_model=CertificateOut)
async def claim_certificate(
    slug: str, session: AsyncSession = Depends(get_async_session), user: User = Depends(current_active_user)
):
    course = (await session.execute(_course_query(Course.slug == slug))).scalar_one_or_none()
    if course is None:
        raise HTTPException(404, "Course not found")
    existing = (
        await session.execute(select(Certificate).where(Certificate.user_id == user.id, Certificate.course_id == course.id))
    ).scalar_one_or_none()
    if existing:
        return _out(existing, course)
    progress = await build_progress(session, user, course)
    if progress.total == 0 or progress.completed < progress.total:
        raise HTTPException(409, "Complete every lesson in this course to earn the certificate")
    cert = Certificate(
        code=new_code(), user_id=user.id, course_id=course.id, lesson_count=progress.total,
        learner_name=(user.full_name or "").strip() or user.email.split("@")[0],
    )
    session.add(cert)
    try:
        await session.commit()
    except IntegrityError:  # a double click raced us; return the one that won
        await session.rollback()
        cert = (
            await session.execute(select(Certificate).where(Certificate.user_id == user.id, Certificate.course_id == course.id))
        ).scalar_one()
    return _out(cert, course)


@router.get("/me/certificates", response_model=list[CertificateOut])
async def my_certificates(session: AsyncSession = Depends(get_async_session), user: User = Depends(current_active_user)):
    rows = (
        await session.execute(
            select(Certificate, Course)
            .select_from(Certificate)
            .join(Course, Course.id == Certificate.course_id)
            .where(Certificate.user_id == user.id)
            .order_by(Certificate.issued_at.desc())
        )
    ).all()
    return [_out(c, co) for c, co in rows]


@router.get("/certificates/{code}", response_model=CertificateOut)
async def verify_certificate(code: str, session: AsyncSession = Depends(get_async_session)):
    """Public: anyone with the code can confirm a certificate is genuine."""
    row = (
        await session.execute(
            select(Certificate, Course)
            .select_from(Certificate)
            .join(Course, Course.id == Certificate.course_id)
            .where(Certificate.code == code.strip().upper())
        )
    ).first()
    if row is None:
        raise HTTPException(404, "Certificate not found")
    return _out(*row)
