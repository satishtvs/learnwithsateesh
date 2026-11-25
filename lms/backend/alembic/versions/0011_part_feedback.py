"""part feedback: learners report mistakes or suggest improvements on a part; the instructor triages them

Adds one new table only.

Revision ID: 0011
Revises: 0010
Create Date: 2026-11-25 12:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


revision = "0011"
down_revision = "0010"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "part_feedback",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("part_id", sa.Integer(), sa.ForeignKey("part.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("user.id", ondelete="SET NULL"), nullable=True),
        sa.Column("kind", sa.String(20), nullable=False, server_default="mistake"),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("video_time_seconds", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="new"),
        sa.Column("admin_note", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_part_feedback_part_id", "part_feedback", ["part_id"])
    op.create_index("ix_part_feedback_user_id", "part_feedback", ["user_id"])
    op.create_index("ix_part_feedback_status", "part_feedback", ["status"])


def downgrade() -> None:
    op.drop_table("part_feedback")
