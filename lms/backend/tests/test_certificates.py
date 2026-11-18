import pytest_asyncio

from app.db import async_session_maker
from app.quiz_import import import_quiz_data, parse_quiz_file
from app.seed import seed

A = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
B = {"email": "ravi@example.com", "password": "S3cure-passw0rd!"}
C = "/api/courses/ai-y3s1"


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def signin(client, creds, name=None):
    client.cookies.clear()
    await client.post("/api/auth/register", json={**creds, **({"full_name": name} if name else {})})
    await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})
    return client


async def finish_course(client):
    course = (await client.get(C)).json()
    slugs = [l["slug"] for l in course["overview_lessons"]] + [l["slug"] for ch in course["chapters"] for l in ch["lessons"]]
    for s in slugs:
        assert (await client.put(f"{C}/lessons/{s}/progress", json={"completed": True})).status_code == 200
    return len(slugs)


async def test_requires_login(client):
    assert (await client.post(f"{C}/certificate")).status_code == 401
    assert (await client.get("/api/me/certificates")).status_code == 401


async def test_cannot_claim_before_finishing(client):
    await signin(client, A)
    assert (await client.post(f"{C}/certificate")).status_code == 409
    assert (await client.get("/api/me/certificates")).json() == []


async def test_claim_verify_and_idempotent(client):
    await signin(client, A, "Asha Rao")
    n = await finish_course(client)
    r = await client.post(f"{C}/certificate")
    assert r.status_code == 200
    cert = r.json()
    assert cert["learner_name"] == "Asha Rao" and cert["lesson_count"] == n and cert["code"].startswith("LWS-")
    assert (await client.post(f"{C}/certificate")).json()["code"] == cert["code"]
    assert len((await client.get("/api/me/certificates")).json()) == 1
    # public verification, no login, case-insensitive
    client.cookies.clear()
    v = await client.get(f"/api/certificates/{cert['code'].lower()}")
    assert v.status_code == 200 and v.json()["course_slug"] == "ai-y3s1"
    assert (await client.get("/api/certificates/LWS-NOPE")).status_code == 404


async def test_certificates_are_per_user(client):
    await signin(client, A)
    await finish_course(client)
    await client.post(f"{C}/certificate")
    await signin(client, B)
    assert (await client.get("/api/me/certificates")).json() == []
    assert (await client.post(f"{C}/certificate")).status_code == 409


QUIZ_DATA = {
    "course": {"slug": "ai-y3s1", "title": "x"},
    "chapter": {"code": "C01", "title": "Introduction", "unit": "Unit - I", "textbook_ref": "AIMA ch. 1"},
    "quizzes": [
        {"slug": "q1", "title": "Quiz one", "status": "approved", "pass_percent": 100,
         "questions": [{"q": "Two plus two?", "options": ["3", "4"], "answer": "B", "explain": "4"}]},
        {"slug": "q2", "title": "Draft", "status": "draft",
         "questions": [{"q": "Hidden?", "options": ["a", "b"], "answer": "A"}]},
    ],
}


async def attempt(client, choice):
    qs = (await client.get(f"{C}/quizzes/q1")).json()["questions"]
    r = await client.post(f"{C}/quizzes/q1/attempts", json={"answers": {str(qs[0]["id"]): choice}})
    assert r.status_code == 200


async def test_visible_quizzes_must_be_passed_before_claiming(client):
    async with async_session_maker() as s:
        await import_quiz_data(s, parse_quiz_file(QUIZ_DATA))
        await s.commit()
    await signin(client, A)
    await finish_course(client)
    prog = (await client.get(f"{C}/progress")).json()
    assert (prog["quizzes_total"], prog["quizzes_passed"]) == (1, 0)  # the draft quiz does not count
    assert (await client.post(f"{C}/certificate")).status_code == 409
    await attempt(client, 0)  # wrong answer: fails
    assert (await client.post(f"{C}/certificate")).status_code == 409
    await attempt(client, 1)  # passes
    assert (await client.get(f"{C}/progress")).json()["quizzes_passed"] == 1
    assert (await client.post(f"{C}/certificate")).status_code == 200
