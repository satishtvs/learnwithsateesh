"""watch tracking: a part is complete only when the video is watched and its quiz (if any) is passed

Adds nullable/defaulted columns only. Parts already marked complete are treated as watched.

Revision ID: 0010
Revises: 0009
Create Date: 2026-11-20 15:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "0010"
down_revision = "0009"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("part", sa.Column("duration_seconds", sa.Integer(), nullable=True))
    op.add_column("part_progress", sa.Column("watch_started_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("part_progress", sa.Column("watched_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("part_progress", sa.Column("watched_seconds", sa.Integer(), nullable=False, server_default="0"))
    op.execute("UPDATE part_progress SET watched_at = completed_at WHERE completed_at IS NOT NULL")


def downgrade() -> None:
    op.drop_column("part_progress", "watched_seconds")
    op.drop_column("part_progress", "watched_at")
    op.drop_column("part_progress", "watch_started_at")
    op.drop_column("part", "duration_seconds")
