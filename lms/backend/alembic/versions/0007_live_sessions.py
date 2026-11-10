"""live sessions

Revision ID: 0007
Revises: 0006
Create Date: 2026-11-10 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "live_session",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), server_default="60", nullable=False),
        sa.Column("join_url", sa.String(length=500), nullable=False, server_default=""),
        sa.Column("recording_youtube_id", sa.String(length=11), nullable=True),
        sa.Column("course_id", sa.Integer(), nullable=True),
        sa.Column("published", sa.Boolean(), server_default="false", nullable=False),
        sa.ForeignKeyConstraint(["course_id"], ["course.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_live_session_starts_at"), "live_session", ["starts_at"])


def downgrade() -> None:
    op.drop_table("live_session")
