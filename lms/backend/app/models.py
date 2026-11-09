import uuid
from datetime import datetime, timezone

from fastapi_users.db import SQLAlchemyBaseOAuthAccountTableUUID, SQLAlchemyBaseUserTableUUID
from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    full_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    # "student" | "instructor" | "admin". Only changeable server-side / by an admin.
    role: Mapped[str] = mapped_column(String(20), default="student", server_default="student")

    oauth_accounts: Mapped[list[OAuthAccount]] = relationship("OAuthAccount", lazy="joined")


class Course(Base):
    __tablename__ = "course"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    position: Mapped[int] = mapped_column(Integer, default=0)

    chapters: Mapped[list["Chapter"]] = relationship(
        back_populates="course", order_by="Chapter.position", cascade="all, delete-orphan"
    )
    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="course", order_by="Lesson.position", cascade="all, delete-orphan"
    )


class Chapter(Base):
    __tablename__ = "chapter"
    __table_args__ = (UniqueConstraint("course_id", "code"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(10))  # "C01"
    title: Mapped[str] = mapped_column(String(200))
    unit: Mapped[str | None] = mapped_column(String(20), nullable=True)  # "Unit - I"
    textbook_ref: Mapped[str | None] = mapped_column(String(200), nullable=True)  # "AIMA ch. 2"
    position: Mapped[int] = mapped_column(Integer, default=0)

    course: Mapped[Course] = relationship(back_populates="chapters")
    lessons: Mapped[list["Lesson"]] = relationship(
        back_populates="chapter", order_by="Lesson.position"
    )


class Lesson(Base):
    """One video (plus notes/slides). chapter_id is NULL for course-level lessons (e.g. the syllabus)."""

    __tablename__ = "lesson"
    __table_args__ = (UniqueConstraint("course_id", "slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    chapter_id: Mapped[int | None] = mapped_column(
        ForeignKey("chapter.id", ondelete="SET NULL"), nullable=True, index=True
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

    course: Mapped[Course] = relationship(back_populates="lessons")
    chapter: Mapped[Chapter | None] = relationship(back_populates="lessons")


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class LessonProgress(Base):
    """One row per (user, lesson) the user has opened. completed_at is set once they mark it complete."""

    __tablename__ = "lesson_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), primary_key=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lesson.id", ondelete="CASCADE"), primary_key=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Quiz(Base):
    """A set of multiple-choice questions for one chapter (unit part). Only published quizzes are visible."""

    __tablename__ = "quiz"
    __table_args__ = (UniqueConstraint("course_id", "slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    chapter_id: Mapped[int | None] = mapped_column(
        ForeignKey("chapter.id", ondelete="SET NULL"), nullable=True, index=True
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
    """Issued once per (user, course) when every lesson is complete. The name is a snapshot at issue time."""

    __tablename__ = "certificate"
    __table_args__ = (UniqueConstraint("user_id", "course_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id", ondelete="CASCADE"), index=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("course.id", ondelete="CASCADE"), index=True)
    learner_name: Mapped[str] = mapped_column(String(200))
    lesson_count: Mapped[int] = mapped_column(Integer)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
