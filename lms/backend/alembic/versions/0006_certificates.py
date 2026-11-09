"""certificates

Revision ID: 0006
Revises: 0005
Create Date: 2026-11-10 10:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
import fastapi_users_db_sqlalchemy


revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "certificate",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("code", sa.String(length=24), nullable=False),
        sa.Column("user_id", fastapi_users_db_sqlalchemy.generics.GUID(), nullable=False),
        sa.Column("course_id", sa.Integer(), nullable=False),
        sa.Column("learner_name", sa.String(length=200), nullable=False),
        sa.Column("lesson_count", sa.Integer(), nullable=False),
        sa.Column("issued_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["course.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "course_id"),
    )
    op.create_index(op.f("ix_certificate_code"), "certificate", ["code"], unique=True)
    op.create_index(op.f("ix_certificate_course_id"), "certificate", ["course_id"])
    op.create_index(op.f("ix_certificate_user_id"), "certificate", ["user_id"])


def downgrade() -> None:
    op.drop_table("certificate")
