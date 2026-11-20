"""A part is complete only when the video is watched AND its quiz (if any) is passed."""
import pytest_asyncio
from sqlalchemy import select

from app import progress
from app.db import async_session_maker
from app.models import Part, Question, Quiz
from app.seed import seed
from tests.helpers import watch

A = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
C = "/api/courses/ai-y3s1"
PART = "syllabus"


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def signin(client):
    client.cookies.clear()
    await client.post("/api/auth/register", json=A)
    await client.post("/api/auth/login", data={"username": A["email"], "password": A["password"]})


async def add_quiz():
    async with async_session_maker() as s:
        part = (await s.execute(select(Part).where(Part.slug == PART))).scalar_one()
        quiz = Quiz(course_id=part.course_id, slug=PART, title="Q", published=True, pass_percent=50)
        quiz.questions = [Question(position=1, prompt="2+2?", options=["3", "4"], correct_index=1, explanation="")]
        s.add(quiz)
        await s.commit()


async def test_cannot_complete_without_watching(client):
    await signin(client)
    r = await client.put(f"{C}/parts/{PART}/progress", json={"completed": True})
    assert r.status_code == 409 and "Watch" in r.json()["detail"]
    assert (await client.get(f"{C}/progress")).json()["completed"] == 0


async def test_partial_watch_is_not_enough(client):
    await signin(client)
    r = (await watch(client, C, PART, seconds=300, duration=600)).json()
    assert r["watched"] is False and r["watched_seconds"] == 300
    r = (await watch(client, C, PART, seconds=100, duration=600)).json()  # never goes backwards
    assert r["watched_seconds"] == 300
    assert (await client.put(f"{C}/parts/{PART}/progress", json={"completed": True})).status_code == 409


async def test_watching_a_part_without_quiz_completes_it(client):
    await signin(client)
    r = (await watch(client, C, PART)).json()
    assert r["watched"] and r["completed"] and not r["quiz_pending"]
    assert (await client.get(f"{C}/progress")).json()["completed_slugs"] == [PART]
    part = (await client.get(f"{C}/parts/{PART}")).json()
    assert part["watched"] and part["completed"] and part["duration_seconds"] == 600


async def test_quiz_part_needs_both_in_either_order(client):
    await add_quiz()
    await signin(client)
    quiz = (await client.get(f"{C}/quizzes/{PART}")).json()
    qid = quiz["questions"][0]["id"]
    # watch first: not complete until the quiz is passed
    r = (await watch(client, C, PART)).json()
    assert r["watched"] and not r["completed"] and r["quiz_pending"]
    assert (await client.put(f"{C}/parts/{PART}/progress", json={"completed": True})).status_code == 409
    wrong = (await client.post(f"{C}/quizzes/{PART}/attempts", json={"answers": {str(qid): 0}})).json()
    assert wrong["passed"] is False
    assert (await client.get(f"{C}/progress")).json()["completed"] == 0
    ok = (await client.post(f"{C}/quizzes/{PART}/attempts", json={"answers": {str(qid): 1}})).json()
    assert ok["passed"] is True
    assert (await client.get(f"{C}/progress")).json()["completed_slugs"] == [PART]


async def test_passing_quiz_without_watching_does_not_complete(client):
    await add_quiz()
    await signin(client)
    quiz = (await client.get(f"{C}/quizzes/{PART}")).json()
    qid = quiz["questions"][0]["id"]
    ok = (await client.post(f"{C}/quizzes/{PART}/attempts", json={"answers": {str(qid): 1}})).json()
    assert ok["passed"] is True
    assert (await client.get(f"{C}/progress")).json()["completed"] == 0
    r = (await watch(client, C, PART)).json()  # now the video finishes the job
    assert r["completed"] is True


async def test_watch_needs_enough_real_time(client, monkeypatch):
    monkeypatch.setattr(progress, "WALL_CLOCK_CHECK", True)
    await signin(client)
    r = (await watch(client, C, PART)).json()  # claims 10 minutes of video in 0 seconds of real time
    assert r["watched"] is False and not r["completed"]


async def test_watch_requires_a_learner_and_a_known_length(client):
    assert (await watch(client, C, PART)).status_code == 401
    await signin(client)
    assert (await watch(client, C, PART, seconds=5, duration=5)).status_code == 422
    assert (await watch(client, C, "nope")).status_code == 404


async def test_percent_blends_minutes_watched_and_quizzes_passed(client):
    await add_quiz()
    await signin(client)
    base = (await client.get(f"{C}/progress")).json()
    assert base["percent"] == 0 and base["quizzes_total"] >= 1
    await watch(client, C, PART, seconds=300, duration=600)  # half of one of two equal-length parts
    p = (await client.get(f"{C}/progress")).json()
    assert p["minutes_total"] == 20 and p["minutes_watched"] == 5
    assert 0 < p["percent"] < 30  # a quarter of the watch half, no quiz yet
    await watch(client, C, PART)
    qid = (await client.get(f"{C}/quizzes/{PART}")).json()["questions"][0]["id"]
    await client.post(f"{C}/quizzes/{PART}/attempts", json={"answers": {str(qid): 1}})
    p = (await client.get(f"{C}/progress")).json()
    assert p["completed"] == 1 and p["quizzes_passed"] == 1 and p["minutes_watched"] == 10
