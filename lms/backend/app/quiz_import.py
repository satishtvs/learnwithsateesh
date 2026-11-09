"""Import quizzes from content/quizzes/*.yaml. Idempotent: re-running updates quizzes in place.

A quiz is only visible to students when its YAML `status` is `approved`. Questions are replaced
wholesale on each import, so fix them in the YAML file and re-run the seed.
"""
from pathlib import Path

import yaml
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Chapter, Course, Question, Quiz

CONTENT_DIR = Path(__file__).resolve().parent.parent / "content" / "quizzes"
LETTERS = "ABCDEF"


def parse_quiz_file(data: dict, source: str = "") -> dict:
    """Validate one YAML document and return it with `answer` letters converted to indexes."""
    where = f" ({source})" if source else ""
    for key in ("course", "chapter", "quizzes"):
        if key not in data:
            raise ValueError(f"missing '{key}'{where}")
    seen: set[str] = set()
    for quiz in data["quizzes"]:
        slug = quiz.get("slug", "?")
        if slug in seen:
            raise ValueError(f"duplicate quiz slug {slug!r}{where}")
        seen.add(slug)
        if quiz.get("status") not in ("draft", "approved"):
            raise ValueError(f"quiz {slug}: status must be 'draft' or 'approved'{where}")
        if not quiz.get("questions"):
            raise ValueError(f"quiz {slug}: no questions{where}")
        for n, q in enumerate(quiz["questions"], 1):
            label = f"quiz {slug} question {n}{where}"
            opts = q.get("options")
            if not isinstance(opts, list) or not 2 <= len(opts) <= len(LETTERS):
                raise ValueError(f"{label}: needs 2 to {len(LETTERS)} options")
            if len({str(o).strip() for o in opts}) != len(opts):
                raise ValueError(f"{label}: duplicate options")
            letter = str(q.get("answer", "")).strip().upper()
            if letter not in LETTERS[: len(opts)]:
                raise ValueError(f"{label}: answer {q.get('answer')!r} is not one of {LETTERS[:len(opts)]}")
            if not str(q.get("q", "")).strip():
                raise ValueError(f"{label}: empty question")
            q["correct_index"] = LETTERS.index(letter)
    return data


async def import_quiz_data(session: AsyncSession, data: dict, force: bool = False) -> tuple[int, int]:
    """Create the course, chapter, quizzes and questions that do not exist yet. Returns (quizzes, questions) created.

    Existing content is never touched unless `force` is set: once something lives in the database the instructor
    admin owns it, and a deploy must not overwrite edits made there.
    """
    cdata, chdata = data["course"], data["chapter"]
    course = (await session.execute(select(Course).where(Course.slug == cdata["slug"]))).scalar_one_or_none()
    if course is None:
        course = Course(slug=cdata["slug"], title=cdata["title"], description=cdata.get("description", ""),
                        published=bool(cdata.get("published", False)))
        session.add(course)
        await session.flush()
    # An existing course keeps its own published flag/title: the app (or the instructor) owns those.

    chapter = (
        await session.execute(select(Chapter).where(Chapter.course_id == course.id, Chapter.code == chdata["code"]))
    ).scalar_one_or_none()
    if chapter is None or force:
        if chapter is None:
            pos = (await session.execute(select(func.count(Chapter.id)).where(Chapter.course_id == course.id))).scalar_one()
            chapter = Chapter(course_id=course.id, code=chdata["code"], position=pos)
            session.add(chapter)
        chapter.title = chdata["title"]
        chapter.unit = chdata.get("unit")
        chapter.textbook_ref = chdata.get("textbook_ref")
    await session.flush()

    n_quizzes = n_questions = 0
    for pos, qd in enumerate(data["quizzes"]):
        quiz = (
            await session.execute(
                select(Quiz)
                .where(Quiz.course_id == course.id, Quiz.slug == qd["slug"])
                .options(selectinload(Quiz.questions))  # async: the old questions must be loaded to be replaced
            )
        ).scalar_one_or_none()
        if quiz is not None and not force:
            continue  # already in the database: the admin owns it now
        if quiz is None:
            quiz = Quiz(course_id=course.id, slug=qd["slug"])
            session.add(quiz)
        quiz.chapter_id = chapter.id
        quiz.title = qd["title"]
        quiz.pass_percent = int(qd.get("pass_percent", 70))
        quiz.published = qd["status"] == "approved"
        quiz.position = pos
        quiz.questions = [
            Question(
                position=i,
                prompt=q["q"].strip(),
                options=[str(o).strip() for o in q["options"]],
                correct_index=q["correct_index"],
                explanation=str(q.get("explain", "")).strip(),
            )
            for i, q in enumerate(qd["questions"])
        ]
        n_quizzes += 1
        n_questions += len(quiz.questions)
    await session.flush()
    return n_quizzes, n_questions


async def import_all(session: AsyncSession, directory: Path = CONTENT_DIR, force: bool = False) -> tuple[int, int]:
    total_q = total_n = 0
    for path in sorted(directory.glob("*.yaml")):
        data = parse_quiz_file(yaml.safe_load(path.read_text(encoding="utf-8")), path.name)
        nq, nn = await import_quiz_data(session, data, force=force)
        total_q, total_n = total_q + nq, total_n + nn
    return total_q, total_n
