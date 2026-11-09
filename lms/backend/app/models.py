from fastapi_users.db import SQLAlchemyBaseOAuthAccountTableUUID, SQLAlchemyBaseUserTableUUID
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
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
