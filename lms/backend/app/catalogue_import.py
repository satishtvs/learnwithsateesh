"""Import the catalogue (universities, regulations, branches, course metadata) from content/catalogue.yaml.

Idempotent and create-only, like the part and quiz importers:
- universities, regulations and branches are created when missing and never modified afterwards;
- a course's university, year, semester and subject_code are only filled while they are NULL, and its
  regulations/branches only while the course has none, so values changed later in the database win;
- courses that do not exist yet are skipped (they are created by the part/quiz importers or the admin).
Positions follow the order in the file.
"""
from pathlib import Path

import yaml
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Branch, Course, Regulation, University

CATALOGUE_FILE = Path(__file__).resolve().parent.parent / "content" / "catalogue.yaml"


def parse_catalogue(data: dict, source: str = "") -> dict:
    """Validate the YAML document (references between sections included) and return it."""
    where = f" ({source})" if source else ""
    known: dict[str, tuple[set[str], set[str]]] = {}
    for u in data.get("universities") or []:
        for key in ("slug", "name", "short_name"):
            if not u.get(key):
                raise ValueError(f"university {u.get('slug', '?')}: missing '{key}'{where}")
        if u["slug"] in known:
            raise ValueError(f"duplicate university {u['slug']!r}{where}")
        codes: set[str] = set()
        for r in u.get("regulations") or []:
            if not r.get("code") or r["code"] in codes:
                raise ValueError(f"university {u['slug']}: missing or duplicate regulation code{where}")
            codes.add(r["code"])
        slugs: set[str] = set()
        for b in u.get("branches") or []:
            if not b.get("slug") or not b.get("name") or b["slug"] in slugs:
                raise ValueError(f"university {u['slug']}: branch needs a unique slug and a name{where}")
            slugs.add(b["slug"])
        known[u["slug"]] = (codes, slugs)

    for c in data.get("courses") or []:
        label = f"course {c.get('slug', '?')}{where}"
        if not c.get("slug"):
            raise ValueError(f"{label}: missing 'slug'")
        uni = c.get("university")
        if uni is not None and uni not in known:
            raise ValueError(f"{label}: unknown university {uni!r}")
        if (c.get("regulations") or c.get("branches")) and uni is None:
            raise ValueError(f"{label}: regulations/branches need a university")
        codes, slugs = known.get(uni, (set(), set()))
        for code in c.get("regulations") or []:
            if code not in codes:
                raise ValueError(f"{label}: unknown regulation {code!r} for {uni}")
        for slug in c.get("branches") or []:
            if slug not in slugs:
                raise ValueError(f"{label}: unknown branch {slug!r} for {uni}")
        if c.get("year") is not None and c["year"] not in (1, 2, 3, 4):
            raise ValueError(f"{label}: year must be 1-4")
        if c.get("semester") is not None and c["semester"] not in (1, 2):
            raise ValueError(f"{label}: semester must be 1 or 2")
        if c.get("subject_code") is not None and len(str(c["subject_code"])) > 20:
            raise ValueError(f"{label}: subject_code is longer than 20 characters")
    return data


async def import_catalogue_data(session: AsyncSession, data: dict) -> dict[str, int]:
    """Create what is missing; returns counts of created rows and of courses that got metadata."""
    counts = {"universities": 0, "regulations": 0, "branches": 0, "courses": 0}
    unis: dict[str, University] = {}
    regs: dict[tuple[str, str], Regulation] = {}
    branches: dict[tuple[str, str], Branch] = {}

    for upos, u in enumerate(data.get("universities") or []):
        uni = (await session.execute(select(University).where(University.slug == u["slug"]))).scalar_one_or_none()
        if uni is None:
            uni = University(slug=u["slug"], name=u["name"], short_name=u["short_name"], position=upos)
            session.add(uni)
            await session.flush()
            counts["universities"] += 1
        unis[u["slug"]] = uni

        have_regs = {r.code: r for r in (await session.execute(
            select(Regulation).where(Regulation.university_id == uni.id))).scalars()}
        for pos, r in enumerate(u.get("regulations") or []):
            reg = have_regs.get(r["code"])
            if reg is None:
                reg = Regulation(university_id=uni.id, code=r["code"], label=r.get("label") or r["code"],
                                 joined_year=r.get("joined_year"), position=pos)
                session.add(reg)
                counts["regulations"] += 1
            regs[(u["slug"], r["code"])] = reg

        have_branches = {b.slug: b for b in (await session.execute(
            select(Branch).where(Branch.university_id == uni.id))).scalars()}
        for pos, b in enumerate(u.get("branches") or []):
            br = have_branches.get(b["slug"])
            if br is None:
                br = Branch(university_id=uni.id, slug=b["slug"], name=b["name"],
                            short_name=b.get("short_name") or b["name"], position=pos)
                session.add(br)
                counts["branches"] += 1
            branches[(u["slug"], b["slug"])] = br
        await session.flush()

    for c in data.get("courses") or []:
        course = (await session.execute(
            select(Course).where(Course.slug == c["slug"])
            .options(selectinload(Course.regulations), selectinload(Course.branches))
        )).scalar_one_or_none()
        if course is None:
            continue
        uni_slug = c.get("university")
        changed = False
        if course.university_id is None and uni_slug:
            course.university_id = unis[uni_slug].id
            changed = True
        for field in ("year", "semester", "subject_code"):
            if getattr(course, field) is None and c.get(field) is not None:
                setattr(course, field, str(c[field]) if field == "subject_code" else int(c[field]))
                changed = True
        if not course.regulations and c.get("regulations"):
            course.regulations = [regs[(uni_slug, code)] for code in c["regulations"]]
            changed = True
        if not course.branches and c.get("branches"):
            course.branches = [branches[(uni_slug, slug)] for slug in c["branches"]]
            changed = True
        counts["courses"] += changed
    await session.flush()
    return counts


async def import_catalogue(session: AsyncSession, path: Path = CATALOGUE_FILE) -> dict[str, int]:
    if not path.exists():
        return {"universities": 0, "regulations": 0, "branches": 0, "courses": 0}
    data = parse_catalogue(yaml.safe_load(path.read_text(encoding="utf-8")) or {}, path.name)
    return await import_catalogue_data(session, data)
