from datetime import datetime, timedelta, timezone

import pytest_asyncio

from app.promote import promote
from app.seed import seed

STUDENT = {"email": "asha@example.com", "password": "S3cure-passw0rd!"}
TEACHER = {"email": "sateesh@example.com", "password": "S3cure-passw0rd!"}
YT = "dQw4w9WgXcQ"
JOIN = "https://meet.google.com/abc-defg-hij"


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()


async def signin(client, creds, role=None):
    client.cookies.clear()
    await client.post("/api/auth/register", json=creds)
    if role:
        assert await promote(creds["email"], role)
    await client.post("/api/auth/login", data={"username": creds["email"], "password": creds["password"]})


def body(hours_from_now, **kw):
    start = datetime.now(timezone.utc) + timedelta(hours=hours_from_now)
    return {"title": "Doubt clearing", "starts_at": start.isoformat(), "duration_minutes": 60, "join_url": JOIN,
            "published": True, **kw}


async def test_admin_endpoints_are_staff_only(client):
    assert (await client.get("/api/admin/live-sessions")).status_code == 401
    await signin(client, STUDENT)
    assert (await client.post("/api/admin/live-sessions", json=body(2))).status_code == 403


async def test_schedule_list_and_join_link_visibility(client):
    await signin(client, TEACHER, "admin")
    up = (await client.post("/api/admin/live-sessions", json=body(48, title="Later"))).json()
    now = (await client.post("/api/admin/live-sessions", json=body(-0.5, title="Right now"))).json()
    past = (await client.post("/api/admin/live-sessions", json=body(-72, title="Old", recording=f"https://youtu.be/{YT}"))).json()
    await client.post("/api/admin/live-sessions", json=body(5, title="Hidden draft", published=False))
    assert (up["status"], now["status"], past["status"]) == ("upcoming", "live", "past")

    client.cookies.clear()  # visitor: no join links, drafts hidden
    anon = (await client.get("/api/live-sessions")).json()
    assert [s["title"] for s in anon] == ["Right now", "Later", "Old"]  # upcoming/live by time, then past
    assert all(s["join_url"] is None for s in anon)
    assert anon[2]["recording_youtube_id"] == YT

    await signin(client, STUDENT)
    mine = {s["title"]: s for s in (await client.get("/api/live-sessions")).json()}
    assert mine["Later"]["join_url"] == JOIN and mine["Right now"]["join_url"] == JOIN
    assert mine["Old"]["join_url"] is None  # no join link once it is over


async def test_validation_edit_and_delete(client):
    await signin(client, TEACHER, "admin")
    assert (await client.post("/api/admin/live-sessions", json=body(2, join_url="javascript:alert(1)"))).status_code == 422
    assert (await client.post("/api/admin/live-sessions", json=body(2, recording="nope"))).status_code == 422
    assert (await client.post("/api/admin/live-sessions", json=body(2, course_id=999))).status_code == 422
    s = (await client.post("/api/admin/live-sessions", json=body(2, course_id=1))).json()
    assert s["course_slug"]
    r = await client.put(f"/api/admin/live-sessions/{s['id']}", json=body(2, title="Renamed", published=False))
    assert r.json()["title"] == "Renamed"
    client.cookies.clear()
    assert (await client.get("/api/live-sessions")).json() == []
    await signin(client, TEACHER)
    assert (await client.delete(f"/api/admin/live-sessions/{s['id']}")).status_code == 204
    assert (await client.delete(f"/api/admin/live-sessions/{s['id']}")).status_code == 404
