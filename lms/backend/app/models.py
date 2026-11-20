import uuid
from datetime import datetime, timezone

from fastapi_users.db import SQLAlchemyBaseOAuthAccountTableUUID, SQLAlchemyBaseUserTableUUID
from sqlalchemy import (
    JSON, Boolean, Column, DateTime, ForeignKey, Integer, SmallInteger, String, Table, Text, UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    full_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    # "student" | "instructor" | "admin". Only changeable server-side / by an admin.
    role: Mapped[str] = mapped_column(String(20), default="student", server_default="student")

    # "My syllabus": the student's default catalogue filter (all optional; see app/catalogue.py).
    university_id: Mapped[int | None] = mapped_column(ForeignKey("university.id", ondelete="SET NULL"), nullable=True)
    regulation_id: Mapped[int | None] = mapped_column(ForeignKey("regulation.id", ondelete="SET NULL"), nullable=True)
    branch_id: Mapped[int | None] = mapped_column(ForeignKey("branch.id", ondelete="SET NULL"), nullable=True)
    joined_year: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    year: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # current year of study, 1-4
    semester: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # current semester, 1-2

    oauth_accounts: Mapped[list[OAuthAccount]] = relationship("OAuthAccount", lazy="joined")


class University(Base):
    __tablename__ = "university"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True)  # "jntuh"
    name: Mapped[str] = mapped_column(String(200))
    short_name: Mapped[str] = mapped_column(String(50))  # "JNTUH"
    position: Mapped[int] = mapped_column(Integer, default=0)

    regulations: Mapped[list["Regulation"]] = relationship(
        back_populates="university", order_by="Regulation.position"
    )
    branches: Mapped[list["Branch"]] = relationship(back_populates="university", order_by="Branch.position")


class Regulation(Base):
    """A syllabus version (R18, R22, ...). Not a browsing level: an attribute of courses and a filter."""

    __tablename__ = "regulation"
    __table_args__ = (UniqueConstraint("university_id", "code"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    university_id: Mapped[int] = mapped_column(ForeignKey("university.id", ondelete="CASCADE"))
    code: Mapped[str] = mapped_column(String(20))  # "R22"
    label: Mapped[str] = mapped_column(String(100))
    joined_year: Mapped[int | None] = mapped_column(Integer, nullable=True)  # first batch it applies to
    position: Mapped[int] = mapped_column(Integer, default=0)

    university: Mapped[University] = relationship(back_populates="regulations")


class Branch(Base):
    __tablename__ = "branch"
    __table_args__ = (UniqueConstraint("university_id", "slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    university_id: Mapped[int] = mapped_column(ForeignKey("university.id", ondelete="CASCADE"))
    slug: Mapped[str] = mapped_column(String(50))  # "cse-aiml"
    name: Mapped[str] = mapped_column(String(200))
    short_name: Mapped[str] = mapped_column(String(50))  # "CSE (AI and ML)"
    position: Mapped[int] = mapped_column(Integer, default=0)

    university: Mapped[University] = relationship(back_populates="branches")


course_branch = Table(
    "course_branch",
    Base.metadata,
    Column("course_id", ForeignKey("course.id", ondelete="CASCADE"), primary_key=True),
    Column("branch_id", ForeignKey("branch.id", ondelete="CASCADE"), primary_key=True),
)

course_regulation = Table(
    "course_regulation",
    Base.metadata,
    Column("course_id", ForeignKey("course.id", ondelete="CASCADE"), primary_key=True),
    Column("regulation_id", ForeignKey("regulation.id", ondelete="CASCADE"), primary_key=True),
)


class Course(Base):
    __tablename__ = "course"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    position: Mapped[int] = mapped_column(Integer, default=0)
    # Catalogue metadata (all optional). The same course may serve several regulations and branches.
    university_id: Mapped[int | None] = mapped_column(
        ForeignKey("university.id", ondelete="SET NULL"), nullable=True, index=True
    )
    year: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 1-4
    semester: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)  # 1-2
    subject_code: Mapped[str | None] = mapped_column(String(20), nullable=True)  # "AM502PC"

    university: Mapped[University | None] = relationship()
    regulations: Mapped[list[Regulation]] = relationship(secondary=course_regulation, order_by="Regulation.position")
    branches: Mapped[list[Branch]] = relationship(secondary=course_branch, order_by="Branch.position")

    units: Mapped[list["Unit"]] = relationship(
        back_populates="course", order_by="Unit.position", cascade="all, delete-orphan"
    )
    parts: Mapped[list["Part"]] = relationship(
        back_populates="course", order_by="Part.position", cascade="all, delete-orphan"
    )


class Unit(Base):
    __tablename__ = "unit"
    __table_args__ = (UniqueConstraint("course_id", "code"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(10))  # "C01"
    title: Mapped[str] = mapped_column(String(200))
    label: Mapped[str | None] = mapped_column(String(20), nullable=True)  # "Unit - I"
    textbook_ref: Mapped[str | None] = mapped_column(String(200), nullable=True)  # "AIMA ch. 2"
    position: Mapped[int] = mapped_column(Integer, default=0)

    course: Mapped[Course] = relationship(back_populates="units")
    parts: Mapped[list["Part"]] = relationship(
        back_populates="unit", order_by="Part.position"
    )


class Part(Base):
    """One video (plus notes/slides). unit_id is NULL for course-level parts (e.g. the syllabus)."""

    __tablename__ = "part"
    __table_args__ = (UniqueConstraint("course_id", "slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    unit_id: Mapped[int | None] = mapped_column(
        ForeignKey("unit.id", ondelete="SET NULL"), nullable=True, index=True
    )
    slug: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    youtube_id: Mapped[str] = mapped_column(String(11))
    notes_md: Mapped[str] = mapped_column(Text, default="")
    slides_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    published: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    # Free preview: viewable without signing in (the rest needs a free account).
    is_preview: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    course: Mapped[Course] = relationship(back_populates="parts")
    unit: Mapped[Unit | None] = relationship(back_populates="parts")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class PartProgress(Base):
    """One row per (user, part) the user has opened. completed_at is set once they mark it complete."""

    __tablename__ = "part_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), primary_key=True)
    part_id: Mapped[int] = mapped_column(ForeignKey("part.id", ondelete="CASCADE"), primary_key=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Quiz(Base):
    """A set of multiple-choice questions for one unit. Only published quizzes are visible."""

    __tablename__ = "quiz"
    __table_args__ = (UniqueConstraint("course_id", "slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    unit_id: Mapped[int | None] = mapped_column(
        ForeignKey("unit.id", ondelete="SET NULL"), nullable=True, index=True
    )
    slug: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    pass_percent: Mapped[int] = mapped_column(Integer, default=70, server_default="70")
    published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    position: Mapped[int] = mapped_column(Integer, default=0)

    questions: Mapped[list["Question"]] = relationship(
        back_populates="quiz", order_by="Question.position", cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "question"

    id: Mapped[int] = mapped_column(primary_key=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quiz.id", ondelete="CASCADE"), index=True)
    position: Mapped[int] = mapped_column(Integer, default=0)
    prompt: Mapped[str] = mapped_column(Text)
    options: Mapped[list] = mapped_column(JSON)  # list[str]
    correct_index: Mapped[int] = mapped_column(Integer)
    explanation: Mapped[str] = mapped_column(Text, default="")

    quiz: Mapped[Quiz] = relationship(back_populates="questions")


class QuizAttempt(Base):
    """One submitted attempt. Students may retake a quiz; the best attempt counts."""

    __tablename__ = "quiz_attempt"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    quiz_id: Mapped[int] = mapped_column(ForeignKey("quiz.id", ondelete="CASCADE"), index=True)
    score: Mapped[int] = mapped_column(Integer)
    total: Mapped[int] = mapped_column(Integer)
    passed: Mapped[bool] = mapped_column(Boolean)
    answers: Mapped[dict] = mapped_column(JSON)  # {question_id: chosen_index | null}
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Certificate(Base):
    """Issued once per (user, course) when every part is complete. The name is a snapshot at issue time."""

    __tablename__ = "certificate"
    __table_args__ = (UniqueConstraint("user_id", "course_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    learner_name: Mapped[str] = mapped_column(String(200))
    part_count: Mapped[int] = mapped_column(Integer)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class LiveSession(Base):
    """A scheduled live class. join_url is only handed to signed-in users; the recording is added afterwards."""

    __tablename__ = "live_session"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=60, server_default="60")
    join_url: Mapped[str] = mapped_column(String(500), default="", server_default="")
    recording_youtube_id: Mapped[str | None] = mapped_column(String(11), nullable=True)
    course_id: Mapped[int | None] = mapped_column(ForeignKey("course.id", ondelete="SET NULL"), nullable=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
