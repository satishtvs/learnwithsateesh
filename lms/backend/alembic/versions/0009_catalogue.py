"""catalogue: university, regulation, branch + course metadata + the student's "My syllabus"

Only adds tables and nullable columns, so existing courses, users, progress and quizzes are untouched.
The rows themselves (JNTUH, R18..R25, branches, per-course metadata) are created by the seed step
(app/catalogue_import.py, from content/catalogue.yaml), not here.

Revision ID: 0009
Revises: 0008
Create Date: 2026-11-20 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "0009"
down_revision = "0008"
branch_labels = None
depends_on = None

USER_COLUMNS = [("university_id", "university"), ("regulation_id", "regulation"), ("branch_id", "branch")]
USER_NUMBERS = ["joined_year", "year", "semester"]


def upgrade() -> None:
    op.create_table(
        "university",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("short_name", sa.String(length=50), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "regulation",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("university_id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("label", sa.String(length=100), nullable=False),
        sa.Column("joined_year", sa.Integer(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["university_id"], ["university.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("university_id", "code"),
    )
    op.create_table(
        "branch",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("university_id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=50), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("short_name", sa.String(length=50), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["university_id"], ["university.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("university_id", "slug"),
    )
    op.create_table(
        "course_branch",
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("branch_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["course.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["branch_id"], ["branch.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("course_id", "branch_id"),
    )
    op.create_table(
        "course_regulation",
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("regulation_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["course.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["regulation_id"], ["regulation.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("course_id", "regulation_id"),
    )

    op.add_column("course", sa.Column("university_id", sa.Integer(), nullable=True))
    op.add_column("course", sa.Column("year", sa.SmallInteger(), nullable=True))
    op.add_column("course", sa.Column("semester", sa.SmallInteger(), nullable=True))
    op.add_column("course", sa.Column("subject_code", sa.String(length=20), nullable=True))
    op.create_foreign_key(
        "course_university_id_fkey", "course", "university", ["university_id"], ["id"], ondelete="SET NULL"
    )
    op.create_index(op.f("ix_course_university_id"), "course", ["university_id"])

    for column, table in USER_COLUMNS:
        op.add_column("user", sa.Column(column, sa.Integer(), nullable=True))
        op.create_foreign_key(f"user_{column}_fkey", "user", table, [column], ["id"], ondelete="SET NULL")
    for column in USER_NUMBERS:
        op.add_column("user", sa.Column(column, sa.SmallInteger(), nullable=True))


def downgrade() -> None:
    for column in reversed(USER_NUMBERS):
        op.drop_column("user", column)
    for column, _table in reversed(USER_COLUMNS):
        op.drop_constraint(f"user_{column}_fkey", "user", type_="foreignkey")
        op.drop_column("user", column)

    op.drop_index(op.f("ix_course_university_id"), table_name="course")
    op.drop_constraint("course_university_id_fkey", "course", type_="foreignkey")
    for column in ("subject_code", "semester", "year", "university_id"):
        op.drop_column("course", column)

    op.drop_table("course_regulation")
    op.drop_table("course_branch")
    op.drop_table("branch")
    op.drop_table("regulation")
    op.drop_table("university")
