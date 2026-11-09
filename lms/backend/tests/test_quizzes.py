import copy

import pytest
import pytest_asyncio
import yaml

from app.db import async_session_maker
from app.quiz_import import CONTENT_DIR, import_all, import_quiz_data, parse_quiz_file
from app.seed import seed

A = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
B = {"email": "ravi@example.com", "password": "S3cure-passw0rd!"}
C = "/api/courses/ai-y3s1/quizzes"

DATA = {
    "course": {"slug": "ai-y3s1", "title": "x"},
    "chapter": {"code": "C01", "title": "Introduction", "unit": "Unit - I", "textbook_ref": "AIMA ch. 1"},
    "quizzes": [
        {
            "slug": "intro",
            "title": "Intro quiz",
            "status": "approved",
            "pass_percent": 60,
            "questions": [
                {"q": "Two plus two?", "options": ["3", "4", "5"], "answer": "B", "explain": "Because 2+2=4."},
                {"q": "Capital of India?", "options": ["Delhi", "Mumbai"], "answer": "A", "explain": "New Delhi."},
                {"q": "Sky colour?", "options": ["Blue", "Green", "Red", "Pink"], "answer": "A"},
            ],
        },
        {
            "slug": "hidden",
            "title": "Draft quiz",
            "status": "draft",
            "questions": [{"q": "Q?", "options": ["a", "b"], "answer": "A"}],
        },
    ],
}


async def load(data=DATA, force=False):
    async with async_session_maker() as s:
        await import_quiz_data(s, parse_quiz_file(copy.deepcopy(data)), force=force)
        await s.commit()


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()
    await load()


async def signin(client, creds):
    client.cookies.clear()
    await client.post("/api/auth/register", json=creds)
    await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})
    return client


# ---------------------------------------------------------------- import / validation
def bad(mutator):
    d = copy.deepcopy(DATA)
    mutator(d["quizzes"][0]["questions"][0])
    return d


def test_parse_rejects_answer_outside_options():
    with pytest.raises(ValueError, match="answer"):
        parse_quiz_file(bad(lambda q: q.update(answer="D")))  # only A-C exist


def test_parse_rejects_duplicate_options_and_empty_question():
    with pytest.raises(ValueError, match="duplicate options"):
        parse_quiz_file(bad(lambda q: q.update(options=["3", "3", "5"])))
    with pytest.raises(ValueError, match="empty question"):
        parse_quiz_file(bad(lambda q: q.update(q="  ")))


def test_parse_rejects_unknown_status():
    d = copy.deepcopy(DATA)
    d["quizzes"][0]["status"] = "published"
    with pytest.raises(ValueError, match="status"):
        parse_quiz_file(d)


def test_parse_converts_letters_to_indexes():
    parsed = parse_quiz_file(copy.deepcopy(DATA))
    assert [q["correct_index"] for q in parsed["quizzes"][0]["questions"]] == [1, 0, 0]


def test_shipped_unit1_file_is_valid():
    """Every shipped quiz file must parse; Unit I should have six part-quizzes, all still drafts."""
    path = CONTENT_DIR / "ml-r22-u1.yaml"
    data = parse_quiz_file(yaml.safe_load(path.read_text(encoding="utf-8")), path.name)
    assert [q["slug"] for q in data["quizzes"]] == [f"u1-p{i}" for i in range(1, 7)]
    assert sum(len(q["questions"]) for q in data["quizzes"]) >= 40
    for quiz in data["quizzes"]:
        assert quiz["status"] == "draft"  # Sateesh approves them after review
        for q in quiz["questions"]:
            assert len(q["options"]) >= 3 and q["explain"].strip()


async def test_import_is_idempotent_and_draft_content_stays_hidden(client):
    async with async_session_maker() as s:
        first = await import_all(s)
        await s.commit()
    async with async_session_maker() as s:
        assert await import_all(s) == first
        await s.commit()
    # The ML course is created unpublished, so nothing about it is visible.
    assert (await client.get("/api/courses/machine-learning-r22/quizzes")).status_code == 404
    assert "machine-learning-r22" not in [c["slug"] for c in (await client.get("/api/courses")).json()]


async def test_plain_reimport_never_overwrites_existing_quizzes(client):
    """Once a quiz is in the database the admin owns it: a deploy-time seed must leave it alone."""
    d = copy.deepcopy(DATA)
    d["quizzes"][0]["questions"] = d["quizzes"][0]["questions"][:2]
    d["quizzes"][0]["title"] = "Changed in the file"
    await load(d)
    quiz = (await client.get(C)).json()[0]
    assert quiz["question_count"] == 3 and quiz["title"] == "Intro quiz"


async def test_forced_reimport_replaces_questions_instead_of_duplicating(client):
    d = copy.deepcopy(DATA)
    d["quizzes"][0]["questions"] = d["quizzes"][0]["questions"][:2]
    await load(d, force=True)
    quizzes = (await client.get(C)).json()
    assert quizzes[0]["question_count"] == 2


# ---------------------------------------------------------------- API
async def test_listing_is_public_and_hides_drafts(client):
    r = await client.get(C)
    assert r.status_code == 200
    body = r.json()
    assert [q["slug"] for q in body] == ["intro"]
    assert body[0]["question_count"] == 3 and body[0]["chapter_code"] == "C01"
    assert body[0]["best_percent"] is None and body[0]["passed"] is False


async def test_all_quizzes_listing_spans_courses_and_hides_drafts(client):
    r = await client.get("/api/quizzes")
    assert r.status_code == 200
    body = r.json()
    assert [(q["course_slug"], q["slug"]) for q in body] == [("ai-y3s1", "intro")]
    assert body[0]["course_title"] and body[0]["question_count"] == 3


async def test_taking_a_quiz_needs_login(client):
    assert (await client.get(f"{C}/intro")).status_code == 401
    assert (await client.post(f"{C}/intro/attempts", json={"answers": {}})).status_code == 401


async def test_quiz_questions_do_not_reveal_answers(client):
    await signin(client, A)
    r = await client.get(f"{C}/intro")
    assert r.status_code == 200
    text = r.text
    assert "correct_index" not in text and "explain" not in text and "Because 2+2=4." not in text
    assert len(r.json()["questions"]) == 3


async def test_draft_quiz_is_not_found(client):
    await signin(client, A)
    assert (await client.get(f"{C}/hidden")).status_code == 404
    assert (await client.post(f"{C}/hidden/attempts", json={"answers": {}})).status_code == 404


async def test_perfect_attempt_passes_and_reveals_answers(client):
    await signin(client, A)
    qs = (await client.get(f"{C}/intro")).json()["questions"]
    r = await client.post(f"{C}/intro/attempts", json={"answers": {str(qs[0]["id"]): 1, str(qs[1]["id"]): 0, str(qs[2]["id"]): 0}})
    assert r.status_code == 200
    out = r.json()
    assert (out["score"], out["total"], out["percent"], out["passed"]) == (3, 3, 100, True)
    assert out["results"][0]["explanation"] == "Because 2+2=4."
    assert all(x["correct"] for x in out["results"])


async def test_partial_attempt_and_pass_threshold(client):
    await signin(client, A)
    qs = (await client.get(f"{C}/intro")).json()["questions"]
    # 2 of 3 right = 67% >= 60 (pass); the skipped/wrong one is marked incorrect.
    r = await client.post(f"{C}/intro/attempts", json={"answers": {str(qs[0]["id"]): 1, str(qs[1]["id"]): 0, str(qs[2]["id"]): None}})
    out = r.json()
    assert (out["score"], out["percent"], out["passed"]) == (2, 67, True)
    assert out["results"][2]["chosen"] is None and out["results"][2]["correct"] is False
    # 1 of 3 = 33% (fail)
    r = await client.post(f"{C}/intro/attempts", json={"answers": {str(qs[0]["id"]): 1}})
    assert (r.json()["score"], r.json()["passed"]) == (1, False)


async def test_best_score_is_kept_across_retakes(client):
    await signin(client, A)
    qs = (await client.get(f"{C}/intro")).json()["questions"]
    ids = [str(q["id"]) for q in qs]
    await client.post(f"{C}/intro/attempts", json={"answers": {ids[0]: 1, ids[1]: 0, ids[2]: 0}})  # 100%
    await client.post(f"{C}/intro/attempts", json={"answers": {}})  # 0% later
    listing = (await client.get(C)).json()[0]
    assert (listing["best_percent"], listing["passed"]) == (100, True)
    assert (await client.get(f"{C}/intro")).json()["best_percent"] == 100


async def test_attempts_are_per_user(client):
    await signin(client, A)
    qs = (await client.get(f"{C}/intro")).json()["questions"]
    await client.post(f"{C}/intro/attempts", json={"answers": {str(qs[0]["id"]): 1}})
    await signin(client, B)
    assert (await client.get(C)).json()[0]["best_percent"] is None


async def _attempt(client, answers_ok: bool):
    qs = (await client.get(f"{C}/intro")).json()["questions"]
    answers = {str(qs[0]["id"]): 1, str(qs[1]["id"]): 0, str(qs[2]["id"]): 0} if answers_ok else {}
    return (await client.post(f"{C}/intro/attempts", json={"answers": answers})).json()


async def test_my_attempts_requires_login(client):
    assert (await client.get("/api/me/quiz-attempts")).status_code == 401


async def test_my_attempts_are_private_newest_first_and_limited(client):
    await signin(client, A)
    await _attempt(client, False)  # 0%
    await _attempt(client, True)  # 100%, newest
    mine = (await client.get("/api/me/quiz-attempts")).json()
    assert [(a["percent"], a["passed"]) for a in mine] == [(100, True), (0, False)]
    assert mine[0]["quiz_title"] == "Intro quiz" and mine[0]["course_slug"] == "ai-y3s1" and mine[0]["total"] == 3
    assert len((await client.get("/api/me/quiz-attempts?limit=1")).json()) == 1
    assert (await client.get("/api/me/quiz-attempts?limit=0")).status_code == 422
    await signin(client, B)  # someone else sees none of it
    assert (await client.get("/api/me/quiz-attempts")).json() == []


async def test_my_attempts_hide_quizzes_that_are_no_longer_published(client):
    from sqlalchemy import update

    from app.models import Quiz

    await signin(client, A)
    await _attempt(client, True)
    assert len((await client.get("/api/me/quiz-attempts")).json()) == 1
    async with async_session_maker() as s:
        await s.execute(update(Quiz).where(Quiz.slug == "intro").values(published=False))
        await s.commit()
    assert (await client.get("/api/me/quiz-attempts")).json() == []


async def test_invalid_answers_are_rejected(client):
    await signin(client, A)
    qs = (await client.get(f"{C}/intro")).json()["questions"]
    assert (await client.post(f"{C}/intro/attempts", json={"answers": {"999999": 0}})).status_code == 422
    assert (await client.post(f"{C}/intro/attempts", json={"answers": {str(qs[0]["id"]): 7}})).status_code == 422
    assert (await client.post(f"{C}/intro/attempts", json={"answers": {str(qs[0]["id"]): -1}})).status_code == 422
