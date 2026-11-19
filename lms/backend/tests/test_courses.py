import pytest
import pytest_asyncio
from sqlalchemy import update

from app.db import async_session_maker
from app.models import Part
from app.seed import seed

CREDS = {"email": "student@example.com", "password": "S3cure-passw0rd!"}


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()
    await seed()  # idempotent: running twice must not duplicate anything


@pytest_asyncio.fixture
async def logged_in(client):
    await client.post("/api/auth/register", json=CREDS)
    await client.post("/api/auth/login", data={"username": CREDS["email"], "password": CREDS["password"]})
    return client


async def _set(slug: str, **values):
    async with async_session_maker() as s:
        await s.execute(update(Part).where(Part.slug == slug).values(**values))
        await s.commit()


async def test_catalogue_is_public_with_previews(client):
    r = await client.get("/api/courses")
    assert r.status_code == 200
    (course,) = r.json()
    assert course["slug"] == "ai-y3s1"
    assert course["part_count"] == 2
    assert [p["slug"] for p in course["previews"]] == ["syllabus", "c01-introduction-part-1"]


async def test_outline_is_public_and_ordered(client):
    body = (await client.get("/api/courses/ai-y3s1")).json()
    assert [c["code"] for c in body["units"]] == [f"C{i:02d}" for i in range(1, 11)]
    assert [le["slug"] for le in body["overview_parts"]] == ["syllabus"]
    assert body["units"][0]["parts"][0]["slug"] == "c01-introduction-part-1"
    assert "youtube_id" not in str(body)  # outline never leaks video ids


async def test_unknown_course_404(client):
    assert (await client.get("/api/courses/nope")).status_code == 404


async def test_preview_part_is_public(client):
    r = await client.get("/api/courses/ai-y3s1/parts/syllabus")  # no login
    assert r.status_code == 200
    assert r.json()["youtube_id"] == "zN6yG0iReXY"
    assert r.json()["is_preview"] is True


async def test_locked_part_needs_login_and_hides_video_id(client):
    await _set("c01-introduction-part-1", is_preview=False)
    r = await client.get("/api/courses/ai-y3s1/parts/c01-introduction-part-1")
    assert r.status_code == 401
    assert "f3LHSSHeHdU" not in r.text
    # but the outline still lists it (that is the "what you get" showcase)
    outline = (await client.get("/api/courses/ai-y3s1")).json()
    locked = outline["units"][0]["parts"][0]
    assert locked["slug"] == "c01-introduction-part-1" and locked["is_preview"] is False


async def test_locked_part_opens_after_login(logged_in):
    await _set("c01-introduction-part-1", is_preview=False)
    r = await logged_in.get("/api/courses/ai-y3s1/parts/c01-introduction-part-1")
    assert r.status_code == 200
    body = r.json()
    assert body["youtube_id"] == "f3LHSSHeHdU" and body["unit_code"] == "C01"
    assert body["prev"]["slug"] == "syllabus" and body["next"] is None


async def test_navigation(logged_in):
    first = (await logged_in.get("/api/courses/ai-y3s1/parts/syllabus")).json()
    assert first["prev"] is None and first["next"]["slug"] == "c01-introduction-part-1"


async def test_unpublished_part_hidden_even_if_preview(logged_in):
    await _set("syllabus", published=False)
    assert (await logged_in.get("/api/courses/ai-y3s1/parts/syllabus")).status_code == 404
    outline = (await logged_in.get("/api/courses/ai-y3s1")).json()
    assert outline["overview_parts"] == []


@pytest.mark.parametrize("bad", ["short", "has space!!", "way-too-long-id-x"])
async def test_seed_rejects_bad_youtube_ids(bad):
    from app import seed as seed_mod

    original = seed_mod.PARTS
    seed_mod.PARTS = [(None, "bad", "Bad", bad, False)]
    try:
        with pytest.raises(ValueError):
            await seed_mod.seed()
    finally:
        seed_mod.PARTS = original
