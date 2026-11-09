"""Instructor admin API: manage courses, chapters, lessons, quizzes and questions without touching code.

Everything here needs a signed-in user whose role is "instructor" or "admin". Roles are only ever changed
server-side (see app/promote.py); the public API deliberately has no way to self-promote.
"""
import re
import unicodedata

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_async_session
from app.models import Chapter, Course, Lesson, Question, Quiz, User
from app.users import current_active_user


async def require_instructor(user: User = Depends(current_active_user)) -> User:
    if user.role not in ("instructor", "admin"):
        raise HTTPException(403, "Instructor access required")
    return user


router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_instructor)])

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
CODE_RE = re.compile(r"^[A-Za-z0-9_-]{1,10}$")
YT_BARE = re.compile(r"^[A-Za-z0-9_-]{11}$")
YT_URL = re.compile(r"(?:[?&]v=|youtu\.be/|/embed/|/shorts/|/live/)([A-Za-z0-9_-]{11})")


# ---------------------------------------------------------------- helpers
def parse_youtube_id(value: str) -> str:
    """Accept a watch/share/embed/shorts URL or a bare 11-character video id."""
    v = value.strip()
    if YT_BARE.match(v):
        return v
    m = YT_URL.search(v)
    if m:
        return m.group(1)
    raise ValueError("Not a valid YouTube link or video id")


def slugify(text: str) -> str:
    ascii_text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_text.lower()).strip("-")[:90].strip("-")
    return slug or "item"


def check_slug(slug: str) -> str:
    if not SLUG_RE.match(slug) or len(slug) > 100:
        raise HTTPException(422, "Slug may only contain lowercase letters, digits and single hyphens")
    return slug


async def unique_slug(session: AsyncSession, model, base: str, *scope) -> str:
    cand, n = base, 1
    while (await session.execute(select(model.id).where(model.slug == cand, *scope))).first() is not None:
        n += 1
        cand = f"{base}-{n}"
    return cand


async def next_position(session: AsyncSession, model, *scope) -> int:
    top = (await session.execute(select(func.max(model.position)).where(*scope))).scalar_one()
    return 0 if top is None else top + 1


async def get_or_404(session: AsyncSession, model, obj_id: int, label: str):
    obj = await session.get(model, obj_id)
    if obj is None:
        raise HTTPException(404, f"{label} not found")
    return obj


async def commit_or_409(session: AsyncSession, message: str) -> None:
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(409, message) from None


async def check_chapter(session: AsyncSession, course_id: int, chapter_id: int | None) -> None:
    if chapter_id is None:
        return
    ch = await session.get(Chapter, chapter_id)
    if ch is None or ch.course_id != course_id:
        raise HTTPException(422, "Chapter does not belong to this course")


async def move_within(session: AsyncSession, siblings: list, item_id: int, direction: str) -> None:
    """Swap an item with its neighbour; positions are normalised to 0..n-1 first."""
    ordered = sorted(siblings, key=lambda s: (s.position, s.id))
    for i, s in enumerate(ordered):
        s.position = i
    idx = next(i for i, s in enumerate(ordered) if s.id == item_id)
    j = idx - 1 if direction == "up" else idx + 1
    if 0 <= j < len(ordered):
        ordered[idx].position, ordered[j].position = ordered[j].position, ordered[idx].position
    await session.commit()


# ---------------------------------------------------------------- schemas
class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    description: str
    published: bool
    position: int
    chapter_count: int = 0
    lesson_count: int = 0
    quiz_count: int = 0


class CourseIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = None
    description: str = ""
    published: bool = False


class CoursePatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = None
    description: str | None = None
    published: bool | None = None


class ChapterOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    title: str
    unit: str | None
    textbook_ref: str | None
    position: int


class ChapterIn(BaseModel):
    code: str
    title: str = Field(min_length=1, max_length=200)
    unit: str | None = Field(default=None, max_length=20)
    textbook_ref: str | None = Field(default=None, max_length=200)

    @field_validator("code")
    @classmethod
    def _code(cls, v: str) -> str:
        v = v.strip()
        if not CODE_RE.match(v):
            raise ValueError("Code must be 1-10 letters, digits, - or _")
        return v


class ChapterPatch(BaseModel):
    code: str | None = None
    title: str | None = Field(default=None, min_length=1, max_length=200)
    unit: str | None = Field(default=None, max_length=20)
    textbook_ref: str | None = Field(default=None, max_length=200)

    @field_validator("code")
    @classmethod
    def _code(cls, v: str | None) -> str | None:
        if v is not None and not CODE_RE.match(v.strip()):
            raise ValueError("Code must be 1-10 letters, digits, - or _")
        return v.strip() if v else v


class LessonOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    chapter_id: int | None
    slug: str
    title: str
    youtube_id: str
    notes_md: str
    slides_url: str | None
    position: int
    published: bool
    is_preview: bool


class LessonIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = None
    youtube: str
    chapter_id: int | None = None
    notes_md: str = ""
    slides_url: str | None = Field(default=None, max_length=500)
    published: bool = True
    is_preview: bool = False

    @field_validator("youtube")
    @classmethod
    def _yt(cls, v: str) -> str:
        return parse_youtube_id(v)


class LessonPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    slug: str | None = None
    youtube: str | None = None
    chapter_id: int | None = None
    notes_md: str | None = None
    slides_url: str | None = Field(default=None, max_length=500)
    published: bool | None = None
    is_preview: bool | None = None

    @field_validator("youtube")
    @classmethod
    def _yt(cls, v: str | None) -> str | None:
        return parse_youtube_id(v) if v is not None else None


class QuizOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    course_id: int
    slug: str
    title: str
    chapter_id: int | None
    pass_percent: int
    published: bool
    position: int
    question_count: int = 0


class QuizIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str | None = None
    chapter_id: int | None = None
    pass_percent: int = Field(default=70, ge=1, le=100)


class QuizPatch(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    chapter_id: int | None = None
    pass_percent: int | None = Field(default=None, ge=1, le=100)
    published: bool | None = None


class QuestionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    position: int
    prompt: str
    options: list[str]
    correct_index: int
    explanation: str


def _clean_options(options: list[str]) -> list[str]:
    opts = [o.strip() for o in options]
    if not 2 <= len(opts) <= 6:
        raise ValueError("A question needs 2 to 6 options")
    if any(not o for o in opts):
        raise ValueError("Options cannot be empty")
    if len({o.lower() for o in opts}) != len(opts):
        raise ValueError("Options must be different from each other")
    return opts


class QuestionIn(BaseModel):
    prompt: str = Field(min_length=1)
    options: list[str]
    correct_index: int = Field(ge=0)
    explanation: str = ""

    @field_validator("prompt")
    @classmethod
    def _prompt(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Question text cannot be empty")
        return v.strip()

    @field_validator("options")
    @classmethod
    def _opts(cls, v: list[str]) -> list[str]:
        return _clean_options(v)

    def check(self) -> None:
        if self.correct_index >= len(self.options):
            raise HTTPException(422, "The correct answer must be one of the options")


class QuestionPatch(BaseModel):
    prompt: str | None = Field(default=None, min_length=1)
    options: list[str] | None = None
    correct_index: int | None = Field(default=None, ge=0)
    explanation: str | None = None

    @field_validator("options")
    @classmethod
    def _opts(cls, v: list[str] | None) -> list[str] | None:
        return _clean_options(v) if v is not None else None


class MoveIn(BaseModel):
    direction: str = Field(pattern="^(up|down)$")


class QuizDetail(BaseModel):
    quiz: QuizOut
    questions: list[QuestionOut]


class CourseDetail(BaseModel):
    course: CourseOut
    chapters: list[ChapterOut]
    lessons: list[LessonOut]
    quizzes: list[QuizOut]


async def _counts(session: AsyncSession) -> tuple[dict, dict, dict]:
    ch = dict((await session.execute(select(Chapter.course_id, func.count()).group_by(Chapter.course_id))).all())
    le = dict((await session.execute(select(Lesson.course_id, func.count()).group_by(Lesson.course_id))).all())
    qz = dict((await session.execute(select(Quiz.course_id, func.count()).group_by(Quiz.course_id))).all())
    return ch, le, qz


def _course_out(c: Course, counts: tuple[dict, dict, dict]) -> CourseOut:
    out = CourseOut.model_validate(c)
    out.chapter_count, out.lesson_count, out.quiz_count = (d.get(c.id, 0) for d in counts)
    return out


async def _quiz_out(session: AsyncSession, quiz: Quiz) -> QuizOut:
    n = (await session.execute(select(func.count()).select_from(Question).where(Question.quiz_id == quiz.id))).scalar_one()
    out = QuizOut.model_validate(quiz)
    out.question_count = n
    return out


# ---------------------------------------------------------------- courses
@router.get("/courses", response_model=list[CourseOut])
async def list_courses(session: AsyncSession = Depends(get_async_session)):
    courses = (await session.execute(select(Course).order_by(Course.position, Course.title))).scalars().all()
    counts = await _counts(session)
    return [_course_out(c, counts) for c in courses]


@router.post("/courses", response_model=CourseOut, status_code=201)
async def create_course(body: CourseIn, session: AsyncSession = Depends(get_async_session)):
    slug = check_slug(body.slug) if body.slug else await unique_slug(session, Course, slugify(body.title))
    course = Course(
        slug=slug, title=body.title.strip(), description=body.description, published=body.published,
        position=await next_position(session, Course),
    )
    session.add(course)
    await commit_or_409(session, "A course with this slug already exists")
    return _course_out(course, ({}, {}, {}))


@router.get("/courses/{course_id}", response_model=CourseDetail)
async def course_detail(course_id: int, session: AsyncSession = Depends(get_async_session)):
    course = await get_or_404(session, Course, course_id, "Course")
    chapters = (await session.execute(select(Chapter).where(Chapter.course_id == course_id).order_by(Chapter.position, Chapter.id))).scalars().all()
    lessons = (await session.execute(select(Lesson).where(Lesson.course_id == course_id).order_by(Lesson.position, Lesson.id))).scalars().all()
    quizzes = (await session.execute(select(Quiz).where(Quiz.course_id == course_id).order_by(Quiz.position, Quiz.id))).scalars().all()
    return CourseDetail(
        course=_course_out(course, await _counts(session)),
        chapters=[ChapterOut.model_validate(c) for c in chapters],
        lessons=[LessonOut.model_validate(le) for le in lessons],
        quizzes=[await _quiz_out(session, q) for q in quizzes],
    )


@router.patch("/courses/{course_id}", response_model=CourseOut)
async def update_course(course_id: int, body: CoursePatch, session: AsyncSession = Depends(get_async_session)):
    course = await get_or_404(session, Course, course_id, "Course")
    data = body.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"] is not None:
        course.slug = check_slug(data.pop("slug"))
    data.pop("slug", None)
    for k, v in data.items():
        if v is not None:
            setattr(course, k, v.strip() if k == "title" else v)
    await commit_or_409(session, "A course with this slug already exists")
    return _course_out(course, await _counts(session))


# ---------------------------------------------------------------- chapters
@router.post("/courses/{course_id}/chapters", response_model=ChapterOut, status_code=201)
async def create_chapter(course_id: int, body: ChapterIn, session: AsyncSession = Depends(get_async_session)):
    await get_or_404(session, Course, course_id, "Course")
    ch = Chapter(
        course_id=course_id, code=body.code, title=body.title.strip(), unit=body.unit, textbook_ref=body.textbook_ref,
        position=await next_position(session, Chapter, Chapter.course_id == course_id),
    )
    session.add(ch)
    await commit_or_409(session, f"This course already has a chapter with code {body.code}")
    return ch


@router.patch("/chapters/{chapter_id}", response_model=ChapterOut)
async def update_chapter(chapter_id: int, body: ChapterPatch, session: AsyncSession = Depends(get_async_session)):
    ch = await get_or_404(session, Chapter, chapter_id, "Chapter")
    for k, v in body.model_dump(exclude_unset=True).items():
        if k in ("code", "title") and v is None:
            continue
        setattr(ch, k, v)
    await commit_or_409(session, "This course already has a chapter with that code")
    return ch


@router.delete("/chapters/{chapter_id}", status_code=204)
async def delete_chapter(chapter_id: int, session: AsyncSession = Depends(get_async_session)):
    ch = await get_or_404(session, Chapter, chapter_id, "Chapter")
    used = (await session.execute(select(func.count()).select_from(Lesson).where(Lesson.chapter_id == chapter_id))).scalar_one()
    used += (await session.execute(select(func.count()).select_from(Quiz).where(Quiz.chapter_id == chapter_id))).scalar_one()
    if used:
        raise HTTPException(409, "Move or delete this chapter's lessons and quizzes first")
    await session.delete(ch)
    await session.commit()


@router.post("/chapters/{chapter_id}/move", status_code=204)
async def move_chapter(chapter_id: int, body: MoveIn, session: AsyncSession = Depends(get_async_session)):
    ch = await get_or_404(session, Chapter, chapter_id, "Chapter")
    sibs = (await session.execute(select(Chapter).where(Chapter.course_id == ch.course_id))).scalars().all()
    await move_within(session, list(sibs), chapter_id, body.direction)


# ---------------------------------------------------------------- lessons
@router.post("/courses/{course_id}/lessons", response_model=LessonOut, status_code=201)
async def create_lesson(course_id: int, body: LessonIn, session: AsyncSession = Depends(get_async_session)):
    await get_or_404(session, Course, course_id, "Course")
    await check_chapter(session, course_id, body.chapter_id)
    scope = (Lesson.course_id == course_id,)
    slug = check_slug(body.slug) if body.slug else await unique_slug(session, Lesson, slugify(body.title), *scope)
    lesson = Lesson(
        course_id=course_id, chapter_id=body.chapter_id, slug=slug, title=body.title.strip(), youtube_id=body.youtube,
        notes_md=body.notes_md, slides_url=body.slides_url or None, published=body.published, is_preview=body.is_preview,
        position=await next_position(session, Lesson, *scope, Lesson.chapter_id == body.chapter_id if body.chapter_id else Lesson.chapter_id.is_(None)),
    )
    session.add(lesson)
    await commit_or_409(session, "A lesson with this slug already exists in the course")
    return lesson


@router.patch("/lessons/{lesson_id}", response_model=LessonOut)
async def update_lesson(lesson_id: int, body: LessonPatch, session: AsyncSession = Depends(get_async_session)):
    lesson = await get_or_404(session, Lesson, lesson_id, "Lesson")
    data = body.model_dump(exclude_unset=True)
    if "chapter_id" in data:
        await check_chapter(session, lesson.course_id, data["chapter_id"])
        lesson.chapter_id = data.pop("chapter_id")
        lesson.position = await next_position(
            session, Lesson, Lesson.course_id == lesson.course_id,
            Lesson.chapter_id == lesson.chapter_id if lesson.chapter_id else Lesson.chapter_id.is_(None),
        )
    if "slug" in data:
        slug = data.pop("slug")
        if slug is not None:
            lesson.slug = check_slug(slug)
    if "youtube" in data:
        yt = data.pop("youtube")
        if yt is not None:
            lesson.youtube_id = yt
    for k, v in data.items():
        if k == "title" and v is None:
            continue
        if k in ("published", "is_preview", "notes_md") and v is None:
            continue
        setattr(lesson, k, (v.strip() or None) if k == "slides_url" and v is not None else (v.strip() if k == "title" else v))
    await commit_or_409(session, "A lesson with this slug already exists in the course")
    return lesson


@router.delete("/lessons/{lesson_id}", status_code=204)
async def delete_lesson(lesson_id: int, session: AsyncSession = Depends(get_async_session)):
    lesson = await get_or_404(session, Lesson, lesson_id, "Lesson")
    await session.delete(lesson)  # learners' progress rows for it go too (ON DELETE CASCADE)
    await session.commit()


@router.post("/lessons/{lesson_id}/move", status_code=204)
async def move_lesson(lesson_id: int, body: MoveIn, session: AsyncSession = Depends(get_async_session)):
    lesson = await get_or_404(session, Lesson, lesson_id, "Lesson")
    same_chapter = Lesson.chapter_id == lesson.chapter_id if lesson.chapter_id else Lesson.chapter_id.is_(None)
    sibs = (await session.execute(select(Lesson).where(Lesson.course_id == lesson.course_id, same_chapter))).scalars().all()
    await move_within(session, list(sibs), lesson_id, body.direction)


# ---------------------------------------------------------------- quizzes and questions
@router.post("/courses/{course_id}/quizzes", response_model=QuizOut, status_code=201)
async def create_quiz(course_id: int, body: QuizIn, session: AsyncSession = Depends(get_async_session)):
    await get_or_404(session, Course, course_id, "Course")
    await check_chapter(session, course_id, body.chapter_id)
    scope = (Quiz.course_id == course_id,)
    slug = check_slug(body.slug) if body.slug else await unique_slug(session, Quiz, slugify(body.title), *scope)
    quiz = Quiz(
        course_id=course_id, chapter_id=body.chapter_id, slug=slug, title=body.title.strip(),
        pass_percent=body.pass_percent, published=False, position=await next_position(session, Quiz, *scope),
    )
    session.add(quiz)
    await commit_or_409(session, "A quiz with this slug already exists in the course")
    return await _quiz_out(session, quiz)


@router.get("/quizzes/{quiz_id}", response_model=QuizDetail)
async def quiz_detail(quiz_id: int, session: AsyncSession = Depends(get_async_session)):
    quiz = await get_or_404(session, Quiz, quiz_id, "Quiz")
    qs = (await session.execute(select(Question).where(Question.quiz_id == quiz_id).order_by(Question.position, Question.id))).scalars().all()
    return QuizDetail(quiz=await _quiz_out(session, quiz), questions=[QuestionOut.model_validate(q) for q in qs])


@router.patch("/quizzes/{quiz_id}", response_model=QuizOut)
async def update_quiz(quiz_id: int, body: QuizPatch, session: AsyncSession = Depends(get_async_session)):
    quiz = await get_or_404(session, Quiz, quiz_id, "Quiz")
    data = body.model_dump(exclude_unset=True)
    if "chapter_id" in data:
        await check_chapter(session, quiz.course_id, data["chapter_id"])
        quiz.chapter_id = data.pop("chapter_id")
    if data.get("published"):
        n = (await session.execute(select(func.count()).select_from(Question).where(Question.quiz_id == quiz_id))).scalar_one()
        if n == 0:
            raise HTTPException(422, "Add at least one question before publishing")
    for k, v in data.items():
        if v is not None:
            setattr(quiz, k, v.strip() if k == "title" else v)
    await session.commit()
    return await _quiz_out(session, quiz)


@router.delete("/quizzes/{quiz_id}", status_code=204)
async def delete_quiz(quiz_id: int, session: AsyncSession = Depends(get_async_session)):
    quiz = await get_or_404(session, Quiz, quiz_id, "Quiz")
    await session.delete(quiz)  # questions and learners' attempts go with it
    await session.commit()


@router.post("/quizzes/{quiz_id}/move", status_code=204)
async def move_quiz(quiz_id: int, body: MoveIn, session: AsyncSession = Depends(get_async_session)):
    quiz = await get_or_404(session, Quiz, quiz_id, "Quiz")
    sibs = (await session.execute(select(Quiz).where(Quiz.course_id == quiz.course_id))).scalars().all()
    await move_within(session, list(sibs), quiz_id, body.direction)


@router.post("/quizzes/{quiz_id}/questions", response_model=QuestionOut, status_code=201)
async def create_question(quiz_id: int, body: QuestionIn, session: AsyncSession = Depends(get_async_session)):
    await get_or_404(session, Quiz, quiz_id, "Quiz")
    body.check()
    q = Question(
        quiz_id=quiz_id, prompt=body.prompt, options=body.options, correct_index=body.correct_index,
        explanation=body.explanation.strip(), position=await next_position(session, Question, Question.quiz_id == quiz_id),
    )
    session.add(q)
    await session.commit()
    return q


@router.patch("/questions/{question_id}", response_model=QuestionOut)
async def update_question(question_id: int, body: QuestionPatch, session: AsyncSession = Depends(get_async_session)):
    q = await get_or_404(session, Question, question_id, "Question")
    data = body.model_dump(exclude_unset=True)
    options = data.get("options", q.options)
    correct = data.get("correct_index", q.correct_index)
    if correct is None or correct >= len(options):
        raise HTTPException(422, "The correct answer must be one of the options")
    if "prompt" in data and data["prompt"] is not None:
        if not data["prompt"].strip():
            raise HTTPException(422, "Question text cannot be empty")
        q.prompt = data["prompt"].strip()
    q.options = list(options)
    q.correct_index = correct
    if data.get("explanation") is not None:
        q.explanation = data["explanation"].strip()
    await session.commit()
    return q


@router.delete("/questions/{question_id}", status_code=204)
async def delete_question(question_id: int, session: AsyncSession = Depends(get_async_session)):
    q = await get_or_404(session, Question, question_id, "Question")
    quiz = await session.get(Quiz, q.quiz_id)
    n = (await session.execute(select(func.count()).select_from(Question).where(Question.quiz_id == q.quiz_id))).scalar_one()
    if quiz is not None and quiz.published and n <= 1:
        raise HTTPException(409, "Unpublish the quiz before deleting its last question")
    await session.delete(q)
    await session.commit()


@router.post("/questions/{question_id}/move", status_code=204)
async def move_question(question_id: int, body: MoveIn, session: AsyncSession = Depends(get_async_session)):
    q = await get_or_404(session, Question, question_id, "Question")
    sibs = (await session.execute(select(Question).where(Question.quiz_id == q.quiz_id))).scalars().all()
    await move_within(session, list(sibs), question_id, body.direction)
