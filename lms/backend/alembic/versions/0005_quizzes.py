"""quizzes, questions and attempts

Revision ID: 0005
Revises: 0004
Create Date: 2026-11-09 14:30:00.000000
"""
from alembic import op
import sqlalchemy as sa
import fastapi_users_db_sqlalchemy


revision = '0005'
down_revision = '0004'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('quiz',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('course_id', sa.Integer(), nullable=False),
    sa.Column('chapter_id', sa.Integer(), nullable=True),
    sa.Column('slug', sa.String(length=100), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('pass_percent', sa.Integer(), server_default='70', nullable=False),
    sa.Column('published', sa.Boolean(), server_default='false', nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['chapter_id'], ['chapter.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['course_id'], ['course.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('course_id', 'slug')
    )
    op.create_index(op.f('ix_quiz_chapter_id'), 'quiz', ['chapter_id'], unique=False)
    op.create_index(op.f('ix_quiz_course_id'), 'quiz', ['course_id'], unique=False)

    op.create_table('question',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('quiz_id', sa.Integer(), nullable=False),
    sa.Column('position', sa.Integer(), nullable=False),
    sa.Column('prompt', sa.Text(), nullable=False),
    sa.Column('options', sa.JSON(), nullable=False),
    sa.Column('correct_index', sa.Integer(), nullable=False),
    sa.Column('explanation', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['quiz_id'], ['quiz.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_question_quiz_id'), 'question', ['quiz_id'], unique=False)

    op.create_table('quiz_attempt',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', fastapi_users_db_sqlalchemy.generics.GUID(), nullable=False),
    sa.Column('quiz_id', sa.Integer(), nullable=False),
    sa.Column('score', sa.Integer(), nullable=False),
    sa.Column('total', sa.Integer(), nullable=False),
    sa.Column('passed', sa.Boolean(), nullable=False),
    sa.Column('answers', sa.JSON(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['quiz_id'], ['quiz.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_attempt_quiz_id'), 'quiz_attempt', ['quiz_id'], unique=False)
    op.create_index(op.f('ix_quiz_attempt_user_id'), 'quiz_attempt', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_table('quiz_attempt')
    op.drop_table('question')
    op.drop_table('quiz')
