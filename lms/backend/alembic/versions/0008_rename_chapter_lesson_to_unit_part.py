"""rename chapter -> unit and lesson -> part (in place, no data loss)

Tables:  chapter -> unit, lesson -> part, lesson_progress -> part_progress
Columns: chapter.unit -> unit.label (renamed first, so it cannot clash with the new table name),
         part.chapter_id / quiz.chapter_id -> unit_id, part_progress.lesson_id -> part_id,
         certificate.lesson_count -> part_count
Plus the Postgres-generated primary key, foreign key, unique and index names and the id sequences,
so that the models' metadata matches the migrated database exactly (`alembic check` shows no diff).

Revision ID: 0008
Revises: 0007
"""
from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None

# (table, old column, new column): table names here are the OLD names
COLUMNS_ON_OLD_TABLES = [
    ("chapter", "unit", "label"),
]
TABLES = [("chapter", "unit"), ("lesson", "part"), ("lesson_progress", "part_progress")]
# (table, old column, new column): table names here are the NEW names
COLUMNS_ON_NEW_TABLES = [
    ("part", "chapter_id", "unit_id"),
    ("quiz", "chapter_id", "unit_id"),
    ("part_progress", "lesson_id", "part_id"),
    ("certificate", "lesson_count", "part_count"),
]
# (table [new name], old constraint name, new constraint name). Renaming a constraint renames its index too.
CONSTRAINTS = [
    ("unit", "chapter_pkey", "unit_pkey"),
    ("unit", "chapter_course_id_fkey", "unit_course_id_fkey"),
    ("unit", "chapter_course_id_code_key", "unit_course_id_code_key"),
    ("part", "lesson_pkey", "part_pkey"),
    ("part", "lesson_chapter_id_fkey", "part_unit_id_fkey"),
    ("part", "lesson_course_id_fkey", "part_course_id_fkey"),
    ("part", "lesson_course_id_slug_key", "part_course_id_slug_key"),
    ("part_progress", "lesson_progress_pkey", "part_progress_pkey"),
    ("part_progress", "lesson_progress_lesson_id_fkey", "part_progress_part_id_fkey"),
    ("part_progress", "lesson_progress_user_id_fkey", "part_progress_user_id_fkey"),
    ("quiz", "quiz_chapter_id_fkey", "quiz_unit_id_fkey"),
]
INDEXES = [
    ("ix_chapter_course_id", "ix_unit_course_id"),
    ("ix_lesson_chapter_id", "ix_part_unit_id"),
    ("ix_lesson_course_id", "ix_part_course_id"),
    ("ix_quiz_chapter_id", "ix_quiz_unit_id"),
]
SEQUENCES = [("chapter_id_seq", "unit_id_seq"), ("lesson_id_seq", "part_id_seq")]


def upgrade() -> None:
    for table, old, new in COLUMNS_ON_OLD_TABLES:
        op.alter_column(table, old, new_column_name=new)
    for old, new in TABLES:
        op.rename_table(old, new)
    for table, old, new in COLUMNS_ON_NEW_TABLES:
        op.alter_column(table, old, new_column_name=new)
    for table, old, new in CONSTRAINTS:
        op.execute(f'ALTER TABLE "{table}" RENAME CONSTRAINT "{old}" TO "{new}"')
    for old, new in INDEXES:
        op.execute(f'ALTER INDEX "{old}" RENAME TO "{new}"')
    for old, new in SEQUENCES:
        op.execute(f'ALTER SEQUENCE "{old}" RENAME TO "{new}"')


def downgrade() -> None:
    for old, new in reversed(SEQUENCES):
        op.execute(f'ALTER SEQUENCE "{new}" RENAME TO "{old}"')
    for old, new in reversed(INDEXES):
        op.execute(f'ALTER INDEX "{new}" RENAME TO "{old}"')
    for table, old, new in reversed(CONSTRAINTS):
        op.execute(f'ALTER TABLE "{table}" RENAME CONSTRAINT "{new}" TO "{old}"')
    for table, old, new in reversed(COLUMNS_ON_NEW_TABLES):
        op.alter_column(table, new, new_column_name=old)
    for old, new in reversed(TABLES):
        op.rename_table(new, old)
    for table, old, new in reversed(COLUMNS_ON_OLD_TABLES):
        op.alter_column(table, new, new_column_name=old)
