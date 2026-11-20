import copy

import pytest
import pytest_asyncio
import yaml
from sqlalchemy import func, select, update
from sqlalchemy.orm import selectinload

from app.catalogue_import import CATALOGUE_FILE, import_catalogue, import_catalogue_data, parse_catalogue
from app.db import async_session_maker
from app.models import Base, Branch, Course, Quiz, Regulation, University
from app.seed import seed

CREDS = {"email": "student@example.com", "password": "S3cure-passw0rd!"}
ML = "machine-learning-r22"
AI = "ai-y3s1"


@pytest_asyncio.fixture(autouse=True)
async def seeded(fresh_db):
    await seed()
    await seed()  # idempotent


@pytest_asyncio.fixture
async def logged_in(client):
    await client.post("/api/auth/register", json=CREDS)
    await client.post("/api/auth/login", data={"username": CREDS["email"], "password": CREDS["password"]})
    return client


async def _course(slug):
    async with async_session_maker() as s:
        return (await s.execute(
            select(Course).where(Course.slug == slug)
            .options(selectinload(Course.university), selectinload(Course.regulations), selectinload(Course.branches))
        )).scalar_one()


async def _set_course(slug, **values):
    async with async_session_maker() as s:
        await s.execute(update(Course).where(Course.slug == slug).values(**values))
        await s.commit()


async def _count(model):
    async with async_session_maker() as s:
        return (await s.execute(select(func.count()).select_from(model))).scalar_one()


async def _add_university(slug="ou", branches=("cse",), regulations=("R22",)):
    async with async_session_maker() as s:
        await import_catalogue_data(s, parse_catalogue({"universities": [{
            "slug": slug, "name": "Other University", "short_name": slug.upper(),
            "regulations": [{"code": c, "label": c, "joined_year": 2022} for c in regulations],
            "branches": [{"slug": b, "name": b.upper(), "short_name": b.upper()} for b in branches],
        }]}))
        await s.commit()


async def slugs(client, **params):
    r = await client.get("/api/courses", params=params)
    assert r.status_code == 200, r.text
    return sorted(c["slug"] for c in r.json())


# ---------------------------------------------------------------- schema / migration objects
def test_tables_and_columns_exist_in_metadata():
    tables = Base.metadata.tables
    for name in ("university", "regulation", "branch", "course_branch", "course_regulation"):
        assert name in tables
    for col in ("university_id", "year", "semester", "subject_code"):
        assert tables["course"].c[col].nullable
    for col in ("university_id", "regulation_id", "branch_id", "joined_year", "year", "semester"):
        assert tables["user"].c[col].nullable


async def test_seed_fills_ml_course_metadata():
    ml = await _course(ML)
    assert ml.university.slug == "jntuh"
    assert [r.code for r in ml.regulations] == ["R22"]
    assert [b.slug for b in ml.branches] == ["cse-aiml"]
    assert (ml.year, ml.semester, ml.subject_code) == (3, 1, "AM502PC")
    ai = await _course(AI)
    assert (ai.year, ai.semester, ai.subject_code) == (3, 1, None)


async def test_seed_creates_launch_scope_once():
    assert await _count(University) == 1
    assert await _count(Regulation) == 4
    assert await _count(Branch) == 3


# ---------------------------------------------------------------- importer
async def test_importer_is_idempotent():
    async with async_session_maker() as s:
        counts = await import_catalogue(s)
        await s.commit()
    assert counts == {"universities": 0, "regulations": 0, "branches": 0, "courses": 0}
    ml = await _course(ML)
    assert len(ml.regulations) == 1 and len(ml.branches) == 1


async def test_importer_never_overwrites_admin_changes():
    await _set_course(ML, year=2, semester=2, subject_code="CHANGED")
    async with async_session_maker() as s:
        await s.execute(update(Branch).where(Branch.slug == "cse").values(name="Renamed by admin"))
        course = (await s.execute(select(Course).where(Course.slug == ML).options(selectinload(Course.branches)))).scalar_one()
        course.branches = [(await s.execute(select(Branch).where(Branch.slug == "cse-ds"))).scalar_one()]
        await s.commit()
    await seed()
    ml = await _course(ML)
    assert (ml.year, ml.semester, ml.subject_code) == (2, 2, "CHANGED")
    assert [b.slug for b in ml.branches] == ["cse-ds"]
    async with async_session_maker() as s:
        assert (await s.execute(select(Branch.name).where(Branch.slug == "cse"))).scalar_one() == "Renamed by admin"


async def test_importer_fills_only_null_fields():
    await _set_course(ML, subject_code=None, year=4)
    await seed()
    ml = await _course(ML)
    assert ml.subject_code == "AM502PC" and ml.year == 4


async def test_importer_skips_missing_courses():
    async with async_session_maker() as s:
        data = parse_catalogue({"courses": [{"slug": "does-not-exist", "year": 1}]})
        assert (await import_catalogue_data(s, data))["courses"] == 0


def test_shipped_catalogue_is_valid():
    data = parse_catalogue(yaml.safe_load(CATALOGUE_FILE.read_text(encoding="utf-8")))
    (jntuh,) = data["universities"]
    assert [b["slug"] for b in jntuh["branches"]] == ["cse-aiml", "cse-ds", "cse"]
    assert [r["code"] for r in jntuh["regulations"]] == ["R18", "R20", "R22", "R25"]


@pytest.mark.parametrize("change", [
    {"regulations": ["R99"]},
    {"branches": ["nope"]},
    {"university": "nope"},
    {"year": 5},
    {"semester": 3},
])
def test_parse_rejects_bad_references(change):
    data = yaml.safe_load(CATALOGUE_FILE.read_text(encoding="utf-8"))
    bad = copy.deepcopy(data)
    bad["courses"][0].update(change)
    with pytest.raises(ValueError):
        parse_catalogue(bad)


# ---------------------------------------------------------------- GET /catalogue
async def test_catalogue_endpoint(client):
    r = await client.get("/api/catalogue")
    assert r.status_code == 200
    (uni,) = r.json()["universities"]
    assert uni["slug"] == "jntuh" and uni["short_name"] == "JNTUH"
    assert [r["code"] for r in uni["regulations"]] == ["R18", "R20", "R22", "R25"]
    assert uni["regulations"][2]["joined_year"] == 2022
    assert [b["slug"] for b in uni["branches"]] == ["cse-aiml", "cse-ds", "cse"]
    assert uni["branches"][0]["short_name"] == "CSE (AI and ML)"


# ---------------------------------------------------------------- matrix
async def test_matrix_counts_only_published(client):
    body = (await client.get("/api/catalogue/matrix", params={"university": "jntuh", "regulation": "R22"})).json()
    assert [b["slug"] for b in body["branches"]] == ["cse-aiml", "cse-ds", "cse"]
    assert [s["label"] for s in body["semesters"]] == ["I-I", "I-II", "II-I", "II-II", "III-I", "III-II", "IV-I", "IV-II"]
    assert body["semesters"][4] == {"key": "3-1", "label": "III-I", "year": 3, "semester": 1}
    # ai-y3s1 is published by the seed, machine-learning-r22 is not
    assert body["cells"] == [{"branch": "cse-aiml", "year": 3, "semester": 1, "count": 1}]

    await _set_course(ML, published=True)
    body = (await client.get("/api/catalogue/matrix", params={"university": "jntuh"})).json()
    assert body["regulation"] is None
    assert body["cells"] == [{"branch": "cse-aiml", "year": 3, "semester": 1, "count": 2}]

    await _set_course(AI, published=False)
    await _set_course(ML, year=None)  # not placed in a semester: not counted
    body = (await client.get("/api/catalogue/matrix", params={"university": "jntuh"})).json()
    assert body["cells"] == []


async def test_matrix_regulation_filter(client):
    await _set_course(ML, published=True)
    body = (await client.get("/api/catalogue/matrix", params={"university": "jntuh", "regulation": "R18"})).json()
    assert body["cells"] == []
    assert (await client.get("/api/catalogue/matrix", params={"university": "jntuh", "regulation": "r22"})).json()["cells"][0]["count"] == 2


async def test_matrix_unknown_values(client):
    assert (await client.get("/api/catalogue/matrix", params={"university": "nope"})).status_code == 404
    assert (await client.get("/api/catalogue/matrix", params={"university": "jntuh", "regulation": "R99"})).status_code == 404
    assert (await client.get("/api/catalogue/matrix")).status_code == 422


# ---------------------------------------------------------------- course list filters + metadata
async def test_course_list_unfiltered_and_metadata(client):
    (course,) = (await client.get("/api/courses")).json()
    assert course["slug"] == AI
    assert course["university"] == {"slug": "jntuh", "name": "Jawaharlal Nehru Technological University Hyderabad", "short_name": "JNTUH"}
    assert course["regulations"] == [{"code": "R22", "label": "R22 (joined 2022-2024)"}]
    assert [b["slug"] for b in course["branches"]] == ["cse-aiml"]
    assert (course["year"], course["semester"], course["subject_code"]) == (3, 1, None)
    assert course["unit_count"] == 10 and course["part_count"] == 2
    assert course["has_preview"] is True and course["quiz_count"] == 0


async def test_course_counts_for_ml(client):
    await _set_course(ML, published=True)
    body = (await client.get("/api/courses", params={"q": "am502"})).json()
    (ml,) = body
    async with async_session_maker() as s:
        course_id = (await s.execute(select(Course.id).where(Course.slug == ML))).scalar_one()
        published = (await s.execute(select(func.count()).select_from(Quiz).where(
            Quiz.course_id == course_id, Quiz.published.is_(True)))).scalar_one()
        await s.execute(update(Quiz).where(Quiz.course_id == course_id).values(published=False))
        await s.commit()
    assert ml["quiz_count"] == published
    assert ml["part_count"] > 0 and ml["unit_count"] > 0
    assert (await client.get("/api/courses", params={"q": "am502"})).json()[0]["quiz_count"] == 0


async def test_course_filters(client):
    await _set_course(ML, published=True)
    both = [AI, ML]
    assert await slugs(client) == both
    assert await slugs(client, university="jntuh") == both
    assert await slugs(client, university="nope") == []
    assert await slugs(client, regulation="R22") == both
    assert await slugs(client, regulation="r22") == both
    assert await slugs(client, regulation="R18") == []
    assert await slugs(client, branch="cse-aiml") == both
    assert await slugs(client, branch="cse") == []
    assert await slugs(client, year=3) == both
    assert await slugs(client, year=2) == []
    assert await slugs(client, semester=1) == both
    assert await slugs(client, semester=2) == []
    await _set_course(AI, semester=2)
    assert await slugs(client, university="jntuh", regulation="R22", branch="cse-aiml", year=3, semester=1) == [ML]
    assert await slugs(client, university="jntuh", regulation="R22", branch="cse-aiml", year=3, semester=2) == [AI]
    assert await slugs(client, university="jntuh", branch="cse-ds", year=3) == []


async def test_course_filters_stay_within_university(client):
    await _add_university("ou", branches=("cse-aiml",), regulations=("R22",))
    # the course is mapped to JNTUH's cse-aiml, not OU's
    assert await slugs(client, university="ou", branch="cse-aiml") == []
    assert await slugs(client, university="jntuh", branch="cse-aiml") == [AI]
    assert await slugs(client, university="ou", regulation="R22") == []


async def test_course_q_search(client):
    await _set_course(ML, published=True)
    assert await slugs(client, q="machine") == [ML]
    assert await slugs(client, q="MACHINE LEARNING") == [ML]
    assert await slugs(client, q="AM502PC") == [ML]
    assert await slugs(client, q="artificial") == [AI]
    assert await slugs(client, q="%") == []  # wildcards are literal
    assert await slugs(client, q="zzz") == []


async def test_course_filter_validation(client):
    assert (await client.get("/api/courses", params={"year": 5})).status_code == 422
    assert (await client.get("/api/courses", params={"semester": 3})).status_code == 422


async def test_course_page_has_metadata(client):
    body = (await client.get(f"/api/courses/{AI}")).json()
    assert body["university"]["slug"] == "jntuh"
    assert body["regulations"][0]["code"] == "R22"
    assert body["branches"][0]["slug"] == "cse-aiml"
    assert (body["year"], body["semester"]) == (3, 1)
    assert body["unit_count"] == 10 and body["part_count"] == 2 and body["has_preview"] is True
    assert "youtube_id" not in str(body)


# ---------------------------------------------------------------- suggest-regulation
@pytest.mark.parametrize("joined, expected", [
    (2018, "R18"), (2019, "R18"), (2020, "R20"), (2021, "R20"),
    (2022, "R22"), (2024, "R22"), (2025, "R25"), (2030, "R25"), (2016, None),
])
async def test_suggest_regulation(client, joined, expected):
    r = await client.get("/api/catalogue/suggest-regulation", params={"university": "jntuh", "joined_year": joined})
    assert r.status_code == 200
    assert r.json() == {"regulation": expected}


async def test_suggest_regulation_errors(client):
    assert (await client.get("/api/catalogue/suggest-regulation", params={"university": "nope", "joined_year": 2022})).status_code == 404
    assert (await client.get("/api/catalogue/suggest-regulation", params={"university": "jntuh", "joined_year": 1999})).status_code == 422


# ---------------------------------------------------------------- My syllabus
FULL = {"university": "jntuh", "regulation": "R22", "branch": "cse-aiml", "joined_year": 2023, "year": 3, "semester": 1}


async def test_syllabus_requires_login(client):
    assert (await client.get("/api/me/syllabus")).status_code == 401
    assert (await client.put("/api/me/syllabus", json=FULL)).status_code == 401


async def test_syllabus_empty_by_default(logged_in):
    body = (await logged_in.get("/api/me/syllabus")).json()
    assert all(v is None for v in body.values())


async def test_syllabus_put_and_get(logged_in):
    r = await logged_in.put("/api/me/syllabus", json=FULL)
    assert r.status_code == 200, r.text
    body = (await logged_in.get("/api/me/syllabus")).json()
    assert body == {
        "university": "jntuh", "university_name": "Jawaharlal Nehru Technological University Hyderabad",
        "university_short_name": "JNTUH",
        "regulation": "R22", "regulation_label": "R22 (joined 2022-2024)",
        "branch": "cse-aiml",
        "branch_name": "Computer Science and Engineering (Artificial Intelligence and Machine Learning)",
        "branch_short_name": "CSE (AI and ML)",
        "joined_year": 2023, "year": 3, "semester": 1,
    }
    assert r.json() == body
    # PUT replaces: left-out fields are cleared
    body = (await logged_in.put("/api/me/syllabus", json={"university": "jntuh"})).json()
    assert body["university"] == "jntuh" and body["regulation"] is None and body["year"] is None
    # /me and registration still work with the new columns
    assert (await logged_in.get("/api/me")).json()["email"] == CREDS["email"]


@pytest.mark.parametrize("change, status", [
    ({"university": "nope"}, 422),
    ({"regulation": "R99"}, 422),
    ({"branch": "nope"}, 422),
    ({"university": None}, 422),  # regulation/branch without a university
    ({"year": 5}, 422),
    ({"year": 0}, 422),
    ({"semester": 3}, 422),
    ({"joined_year": 2014}, 422),
    ({"joined_year": 2036}, 422),
])
async def test_syllabus_validation(logged_in, change, status):
    r = await logged_in.put("/api/me/syllabus", json={**FULL, **change})
    assert r.status_code == status
    assert (await logged_in.get("/api/me/syllabus")).json()["university"] is None  # nothing saved


async def test_syllabus_rejects_regulation_or_branch_of_another_university(logged_in):
    await _add_university("ou", branches=("ece",), regulations=("R19",))
    r = await logged_in.put("/api/me/syllabus", json={**FULL, "regulation": "R19"})
    assert r.status_code == 422 and r.json()["detail"] == "unknown_regulation"
    r = await logged_in.put("/api/me/syllabus", json={**FULL, "branch": "ece"})
    assert r.status_code == 422 and r.json()["detail"] == "unknown_branch"
    r = await logged_in.put("/api/me/syllabus", json={"university": "ou", "regulation": "R22"})
    assert r.status_code == 422
    r = await logged_in.put("/api/me/syllabus", json={"university": "ou", "regulation": "R19", "branch": "ece"})
    assert r.status_code == 200 and r.json()["branch"] == "ece"
