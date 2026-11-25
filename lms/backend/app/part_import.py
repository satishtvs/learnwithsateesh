"""Import video parts from content/parts/*.yaml (create-only, like the quiz importer).

A part with a `youtube_id` is created (once) in its unit; a part whose `youtube_id` is empty is skipped until
the video has been uploaded, so this file can list the whole planned course. Optional per-part notes are read from
content/part_notes/<part slug>.md. Existing courses, units and parts are never modified: after the first import
the instructor admin owns them.
"""
import re
from pathlib import Path

import yaml
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Unit, Course, Part

CONTENT = Path(__file__).resolve().parent.parent / "content"
PARTS_DIR = CONTENT / "parts"
NOTES_DIR = CONTENT / "part_notes"
# Courses whose notes live in content/part_notes/<course slug>__<part slug>.md (part slugs repeat across courses; the
# older courses keep the bare <part slug>.md files).
NAMESPACED_NOTES = {"deep-learning-r22", "data-analytics-r22", "natural-language-processing-r22"}
YOUTUBE_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")


def parse_part_file(data: dict, source: str = "") -> dict:
    where = f" ({source})" if source else ""
    for key in ("course", "units"):
        if key not in data:
            raise ValueError(f"missing '{key}'{where}")
    slugs: set[str] = set()
    for ch in data["units"]:
        for key in ("code", "title", "parts"):
            if not ch.get(key):
                raise ValueError(f"unit {ch.get('code', '?')}: missing '{key}'{where}")
        for le in ch["parts"]:
            slug = le.get("slug", "")
            if not slug or not le.get("title"):
                raise ValueError(f"unit {ch['code']}: every part needs a slug and a title{where}")
            if slug in slugs:
                raise ValueError(f"duplicate part slug {slug!r}{where}")
            slugs.add(slug)
            yt = le.get("youtube_id")
            if yt and not YOUTUBE_ID.match(str(yt)):
                raise ValueError(f"part {slug}: bad YouTube id {yt!r}{where}")
    return data


async def import_part_data(session: AsyncSession, data: dict, notes_dir: Path = NOTES_DIR) -> int:
    """Create missing units and the parts that have a video. Returns the number of parts created."""
    cdata = data["course"]
    course = (await session.execute(select(Course).where(Course.slug == cdata["slug"]))).scalar_one_or_none()
    if course is None:
        course = Course(slug=cdata["slug"], title=cdata["title"], description=cdata.get("description", ""),
                        published=bool(cdata.get("published", False)))
        session.add(course)
        await session.flush()

    created = 0
    for chdata in data["units"]:
        has_video = any(le.get("youtube_id") for le in chdata["parts"])
        unit = (
            await session.execute(select(Unit).where(Unit.course_id == course.id, Unit.code == chdata["code"]))
        ).scalar_one_or_none()
        if unit is None:
            if not has_video:
                continue  # nothing to show in this unit yet
            pos = (await session.execute(select(func.count(Unit.id)).where(Unit.course_id == course.id))).scalar_one()
            unit = Unit(course_id=course.id, code=chdata["code"], title=chdata["title"], label=chdata.get("label"),
                              textbook_ref=chdata.get("textbook_ref"), position=pos)
            session.add(unit)
            await session.flush()
        have = {le.slug for le in (await session.execute(select(Part).where(Part.course_id == course.id))).scalars()}
        pos = (await session.execute(select(func.count(Part.id)).where(Part.course_id == course.id))).scalar_one()
        for le in chdata["parts"]:
            if not le.get("youtube_id") or le["slug"] in have:
                continue
            notes_file = notes_dir / (f"{course.slug}__{le['slug']}.md" if course.slug in NAMESPACED_NOTES else f"{le['slug']}.md")
            session.add(Part(
                course_id=course.id, unit_id=unit.id, slug=le["slug"], title=le["title"].strip(),
                youtube_id=str(le["youtube_id"]), position=pos, is_preview=bool(le.get("preview", False)),
                notes_md=notes_file.read_text(encoding="utf-8") if notes_file.exists() else "",
            ))
            pos += 1
            created += 1
    await session.flush()
    return created


async def import_all_parts(session: AsyncSession, directory: Path = PARTS_DIR) -> int:
    total = 0
    for path in sorted(directory.glob("*.yaml")):
        data = parse_part_file(yaml.safe_load(path.read_text(encoding="utf-8")), path.name)
        total += await import_part_data(session, data)
    return total
