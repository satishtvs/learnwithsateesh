import pytest
import pytest_asyncio

from app.admin import parse_youtube_id, slugify
from app.promote import promote
from app.seed import seed

STUDENT = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
TEACHER = {"email": "sateesh@example.com", "password": "S3cure-passw0rd!"}
YT = "dQw4w9WgXcQ"


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def signin(client, creds, role=None):
    client.cookies.clear()
    await client.post("/api/auth/register", json=creds)
    if role:
        assert await promote(creds["email"], role)
    await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})
    return client


@pytest_asyncio.fixture
async def admin(client):
    return await signin(client, TEACHER, "admin")


async def make_course(admin, title="Machine Learning", **extra):
    r = await admin.post("/api/admin/courses", json={"title": title, **extra})
    assert r.status_code == 201, r.text
    return r.json()


# ---------------------------------------------------------------- helpers
@pytest.mark.parametrize(
    "value",
    [
        YT,
        f"https://www.youtube.com/watch?v={YT}",
        f"https://www.youtube.com/watch?feature=share&v={YT}&t=42s",
        f"https://youtu.be/{YT}?si=abc",
        f"https://www.youtube.com/embed/{YT}",
        f"https://www.youtube.com/shorts/{YT}",
        f"  https://youtu.be/{YT}  ",
    ],
)
def test_parse_youtube_id_accepts_common_link_shapes(value):
    assert parse_youtube_id(value) == YT


@pytest.mark.parametrize("value", ["", "short", "https://example.com/watch?v=nope", "x" * 40])
def test_parse_youtube_id_rejects_junk(value):
    with pytest.raises(ValueError):
        parse_youtube_id(value)


def test_slugify():
    assert slugify("Unit I: Learning & Linear Models!") == "unit-i-learning-linear-models"
    assert slugify("   ") == "item"
    assert slugify("Café Déjà Vu") == "cafe-deja-vu"


# ---------------------------------------------------------------- access control
async def test_admin_api_requires_login_and_role(client):
    assert (await client.get("/api/admin/courses")).status_code == 401
    await signin(client, STUDENT)
    assert (await client.get("/api/admin/courses")).status_code == 403
    assert (await client.post("/api/admin/courses", json={"title": "x"})).status_code == 403
    await signin(client, TEACHER, "instructor")
    assert (await client.get("/api/admin/courses")).status_code == 200


async def test_users_cannot_promote_themselves(client):
    await signin(client, STUDENT)
    await client.patch("/api/users/me", json={"role": "admin"})
    assert (await client.get("/api/me")).json()["role"] == "student"
    assert (await client.get("/api/admin/courses")).status_code == 403


async def test_promote_unknown_user_returns_false():
    assert await promote("nobody@example.com", "admin") is False


# ---------------------------------------------------------------- courses
async def test_course_create_list_and_unique_slugs(admin):
    a = await make_course(admin)
    b = await make_course(admin)  # same title -> suffixed slug
    assert (a["slug"], b["slug"]) == ("machine-learning", "machine-learning-2")
    assert a["published"] is False
    slugs = [c["slug"] for c in (await admin.get("/api/admin/courses")).json()]
    assert "ai-y3s1" in slugs and "machine-learning-2" in slugs  # unpublished ones are listed too


async def test_course_explicit_slug_validation_and_conflict(admin):
    assert (await admin.post("/api/admin/courses", json={"title": "x", "slug": "Bad Slug"})).status_code == 422
    await make_course(admin, slug="ml")
    assert (await admin.post("/api/admin/courses", json={"title": "y", "slug": "ml"})).status_code == 409


async def test_publishing_a_course_makes_it_public(admin, client):
    c = await make_course(admin, description="Unit-wise videos")
    assert c["slug"] not in [x["slug"] for x in (await client.get("/api/courses")).json()]
    r = await admin.patch(f"/api/admin/courses/{c['id']}", json={"published": True, "title": "Machine Learning R22"})
    assert r.status_code == 200 and r.json()["title"] == "Machine Learning R22"
    assert c["slug"] in [x["slug"] for x in (await client.get("/api/courses")).json()]


# ---------------------------------------------------------------- chapters and lessons
async def test_chapter_crud_and_duplicate_code(admin):
    c = await make_course(admin)
    r = await admin.post(f"/api/admin/courses/{c['id']}/chapters", json={"code": "U1", "title": "Unit I", "unit": "Unit - I"})
    assert r.status_code == 201
    assert (await admin.post(f"/api/admin/courses/{c['id']}/chapters", json={"code": "U1", "title": "Again"})).status_code == 409
    assert (await admin.post(f"/api/admin/courses/{c['id']}/chapters", json={"code": "bad code!", "title": "x"})).status_code == 422
    ch = r.json()
    assert (await admin.patch(f"/api/admin/chapters/{ch['id']}", json={"title": "Learning"})).json()["title"] == "Learning"
    assert (await admin.delete(f"/api/admin/chapters/{ch['id']}")).status_code == 204


async def test_cannot_delete_a_chapter_that_still_has_lessons(admin):
    c = await make_course(admin)
    ch = (await admin.post(f"/api/admin/courses/{c['id']}/chapters", json={"code": "U1", "title": "Unit I"})).json()
    await admin.post(f"/api/admin/courses/{c['id']}/lessons", json={"title": "L1", "youtube": YT, "chapter_id": ch["id"]})
    assert (await admin.delete(f"/api/admin/chapters/{ch['id']}")).status_code == 409


async def test_lesson_create_from_url_and_visible_publicly(admin, client):
    c = await make_course(admin, published=True)
    ch = (await admin.post(f"/api/admin/courses/{c['id']}/chapters", json={"code": "U1", "title": "Unit I"})).json()
    r = await admin.post(
        f"/api/admin/courses/{c['id']}/lessons",
        json={"title": "What is learning?", "youtube": f"https://youtu.be/{YT}", "chapter_id": ch["id"], "is_preview": True},
    )
    assert r.status_code == 201
    lesson = r.json()
    assert (lesson["slug"], lesson["youtube_id"], lesson["position"]) == ("what-is-learning", YT, 0)
    pub = await client.get(f"/api/courses/{c['slug']}/lessons/what-is-learning")
    assert pub.status_code == 200 and pub.json()["youtube_id"] == YT
    # unpublish: gone from the public API again
    await admin.patch(f"/api/admin/lessons/{lesson['id']}", json={"published": False})
    assert (await client.get(f"/api/courses/{c['slug']}/lessons/what-is-learning")).status_code == 404


async def test_lesson_validation(admin):
    c = await make_course(admin)
    base = f"/api/admin/courses/{c['id']}/lessons"
    assert (await admin.post(base, json={"title": "x", "youtube": "not a link"})).status_code == 422
    assert (await admin.post(base, json={"title": "x", "youtube": YT, "chapter_id": 99999})).status_code == 422
    other = await make_course(admin, "Other")
    och = (await admin.post(f"/api/admin/courses/{other['id']}/chapters", json={"code": "U1", "title": "t"})).json()
    # a chapter of a different course is refused
    assert (await admin.post(base, json={"title": "x", "youtube": YT, "chapter_id": och["id"]})).status_code == 422


async def test_lesson_edit_move_and_delete(admin):
    c = await make_course(admin)
    base = f"/api/admin/courses/{c['id']}/lessons"
    ids = [(await admin.post(base, json={"title": t, "youtube": YT})).json()["id"] for t in ("A", "B", "C")]
    # move C up once -> A, C, B
    assert (await admin.post(f"/api/admin/lessons/{ids[2]}/move", json={"direction": "up"})).status_code == 204
    detail = (await admin.get(f"/api/admin/courses/{c['id']}")).json()
    assert [le["title"] for le in detail["lessons"]] == ["A", "C", "B"]
    # moving the first one up is a harmless no-op
    await admin.post(f"/api/admin/lessons/{ids[0]}/move", json={"direction": "up"})
    assert [le["title"] for le in (await admin.get(f"/api/admin/courses/{c['id']}")).json()["lessons"]] == ["A", "C", "B"]
    r = await admin.patch(f"/api/admin/lessons/{ids[0]}", json={"title": "A2", "notes_md": "# Notes", "youtube": f"https://youtu.be/{'a' * 11}"})
    assert r.json()["youtube_id"] == "a" * 11 and r.json()["notes_md"] == "# Notes"
    assert (await admin.delete(f"/api/admin/lessons/{ids[1]}")).status_code == 204
    assert (await admin.get(f"/api/admin/courses/{c['id']}")).json()["course"]["lesson_count"] == 2


async def test_invalid_move_direction_rejected(admin):
    c = await make_course(admin)
    lid = (await admin.post(f"/api/admin/courses/{c['id']}/lessons", json={"title": "A", "youtube": YT})).json()["id"]
    assert (await admin.post(f"/api/admin/lessons/{lid}/move", json={"direction": "sideways"})).status_code == 422


# ---------------------------------------------------------------- quizzes
async def make_quiz(admin, course_id, **extra):
    r = await admin.post(f"/api/admin/courses/{course_id}/quizzes", json={"title": "Part 1", **extra})
    assert r.status_code == 201, r.text
    return r.json()


def question(**over):
    return {"prompt": "2 + 2 = ?", "options": ["3", "4", "5"], "correct_index": 1, "explanation": "Because.", **over}


async def test_quiz_needs_a_question_before_publishing(admin):
    c = await make_course(admin, published=True)
    q = await make_quiz(admin, c["id"])
    assert q["published"] is False and q["question_count"] == 0
    assert (await admin.patch(f"/api/admin/quizzes/{q['id']}", json={"published": True})).status_code == 422


async def test_question_validation(admin):
    c = await make_course(admin)
    q = await make_quiz(admin, c["id"])
    url = f"/api/admin/quizzes/{q['id']}/questions"
    assert (await admin.post(url, json=question(options=["only one"]))).status_code == 422
    assert (await admin.post(url, json=question(options=["a", "A"]))).status_code == 422  # duplicate (case-insensitive)
    assert (await admin.post(url, json=question(options=["a", " "]))).status_code == 422
    assert (await admin.post(url, json=question(correct_index=3))).status_code == 422
    assert (await admin.post(url, json=question(prompt="   "))).status_code == 422
    assert (await admin.post(url, json=question())).status_code == 201


async def test_full_quiz_lifecycle_visible_to_students_only_when_published(admin, client):
    c = await make_course(admin, published=True)
    quiz = await make_quiz(admin, c["id"], pass_percent=60)
    base = f"/api/admin/quizzes/{quiz['id']}"
    q1 = (await admin.post(f"{base}/questions", json=question())).json()
    q2 = (await admin.post(f"{base}/questions", json=question(prompt="Capital of India?", options=["Delhi", "Pune"], correct_index=0))).json()
    assert (q1["position"], q2["position"]) == (0, 1)
    # still a draft: students cannot see it
    assert (await client.get(f"/api/courses/{c['slug']}/quizzes")).json() == []
    await admin.patch(base, json={"published": True})
    listed = (await client.get(f"/api/courses/{c['slug']}/quizzes")).json()
    assert [x["slug"] for x in listed] == ["part-1"] and listed[0]["question_count"] == 2
    # a student takes it
    await signin(client, STUDENT)
    taken = (await client.get(f"/api/courses/{c['slug']}/quizzes/part-1")).json()
    answers = {str(taken["questions"][0]["id"]): 1, str(taken["questions"][1]["id"]): 0}
    res = (await client.post(f"/api/courses/{c['slug']}/quizzes/part-1/attempts", json={"answers": answers})).json()
    assert (res["score"], res["passed"]) == (2, True)


async def test_edit_reorder_and_delete_questions(admin):
    c = await make_course(admin)
    quiz = await make_quiz(admin, c["id"])
    base = f"/api/admin/quizzes/{quiz['id']}"
    ids = [(await admin.post(f"{base}/questions", json=question(prompt=f"Q{i}"))).json()["id"] for i in range(3)]
    await admin.post(f"/api/admin/questions/{ids[2]}/move", json={"direction": "up"})
    assert [x["prompt"] for x in (await admin.get(base)).json()["questions"]] == ["Q0", "Q2", "Q1"]
    r = await admin.patch(f"/api/admin/questions/{ids[0]}", json={"prompt": "Edited", "options": ["x", "y"], "correct_index": 1})
    assert r.status_code == 200 and r.json()["options"] == ["x", "y"]
    # shrinking the options below the current answer index is refused
    assert (await admin.patch(f"/api/admin/questions/{ids[1]}", json={"options": ["only", "two"]})).status_code == 200
    assert (await admin.patch(f"/api/admin/questions/{ids[1]}", json={"correct_index": 5})).status_code == 422
    assert (await admin.delete(f"/api/admin/questions/{ids[1]}")).status_code == 204


async def test_cannot_delete_the_last_question_of_a_published_quiz(admin):
    c = await make_course(admin)
    quiz = await make_quiz(admin, c["id"])
    qid = (await admin.post(f"/api/admin/quizzes/{quiz['id']}/questions", json=question())).json()["id"]
    await admin.patch(f"/api/admin/quizzes/{quiz['id']}", json={"published": True})
    assert (await admin.delete(f"/api/admin/questions/{qid}")).status_code == 409
    await admin.patch(f"/api/admin/quizzes/{quiz['id']}", json={"published": False})
    assert (await admin.delete(f"/api/admin/questions/{qid}")).status_code == 204


async def test_deleting_a_quiz_removes_it(admin):
    c = await make_course(admin)
    quiz = await make_quiz(admin, c["id"])
    assert (await admin.delete(f"/api/admin/quizzes/{quiz['id']}")).status_code == 204
    assert (await admin.get(f"/api/admin/quizzes/{quiz['id']}")).status_code == 404


# ---------------------------------------------------------------- seed must not clobber admin edits
async def test_reseed_keeps_admin_edits(admin):
    ai = next(c for c in (await admin.get("/api/admin/courses")).json() if c["slug"] == "ai-y3s1")
    detail = (await admin.get(f"/api/admin/courses/{ai['id']}")).json()
    lesson = next(le for le in detail["lessons"] if le["slug"] == "syllabus")
    await admin.patch(f"/api/admin/lessons/{lesson['id']}", json={"title": "Edited title", "is_preview": False})
    await seed()  # a later deploy runs the seed again
    again = (await admin.get(f"/api/admin/courses/{ai['id']}")).json()
    edited = next(le for le in again["lessons"] if le["slug"] == "syllabus")
    assert edited["title"] == "Edited title" and edited["is_preview"] is False
    assert len(again["lessons"]) == len(detail["lessons"])  # and nothing got duplicated
