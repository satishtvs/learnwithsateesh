# Catalogue API (backend reference for the frontend)

Browsing path: **University > Branch > Course** (> Unit > Part). A **regulation** (R18, R20, R22, R25) is not a
level: it is an attribute of a course (a course can list several) and a filter. All paths are under `/api`.
Everything is public except `/me/syllabus` (needs the `lws_auth` cookie, else `401`).

Identifiers used in requests: university **slug** (`jntuh`), regulation **code** (`R22`, case-insensitive),
branch **slug** (`cse-aiml`, `cse-ds`, `cse`), year `1-4`, semester `1-2`.
Launch data: JNTUH; branches in this order CSE (AI and ML), CSE (Data Science), CSE; regulations R18, R20, R22, R25.

## GET /catalogue

Universities with their regulations and branches, in display order.

```json
{
  "universities": [
    {
      "slug": "jntuh",
      "name": "Jawaharlal Nehru Technological University Hyderabad",
      "short_name": "JNTUH",
      "regulations": [
        {"code": "R18", "label": "R18 (joined 2018-2019)", "joined_year": 2018},
        {"code": "R20", "label": "R20 (joined 2020-2021)", "joined_year": 2020},
        {"code": "R22", "label": "R22 (joined 2022-2024)", "joined_year": 2022},
        {"code": "R25", "label": "R25 (joined 2025 onwards)", "joined_year": 2025}
      ],
      "branches": [
        {"slug": "cse-aiml", "name": "Computer Science and Engineering (Artificial Intelligence and Machine Learning)", "short_name": "CSE (AI and ML)"},
        {"slug": "cse-ds", "name": "Computer Science and Engineering (Data Science)", "short_name": "CSE (Data Science)"},
        {"slug": "cse", "name": "Computer Science and Engineering", "short_name": "CSE"}
      ]
    }
  ]
}
```

## GET /catalogue/matrix?university=jntuh[&regulation=R22]

Branches across, semesters down. `regulation` is optional (omitted = all regulations).
Counts **published** courses mapped to that branch with that year and semester.
`cells` lists only non-empty cells: **a missing cell means 0**. Cells are sorted by year, semester, branch order.
Errors: `404` unknown university or regulation, `422` missing `university`.

```json
{
  "university": "jntuh",
  "regulation": "R22",
  "branches": [{"slug": "cse-aiml", "short_name": "CSE (AI and ML)"}, {"slug": "cse-ds", "short_name": "CSE (Data Science)"}, {"slug": "cse", "short_name": "CSE"}],
  "semesters": [
    {"key": "1-1", "label": "I-I", "year": 1, "semester": 1},
    {"key": "1-2", "label": "I-II", "year": 1, "semester": 2},
    {"key": "2-1", "label": "II-I", "year": 2, "semester": 1},
    {"key": "2-2", "label": "II-II", "year": 2, "semester": 2},
    {"key": "3-1", "label": "III-I", "year": 3, "semester": 1},
    {"key": "3-2", "label": "III-II", "year": 3, "semester": 2},
    {"key": "4-1", "label": "IV-I", "year": 4, "semester": 1},
    {"key": "4-2", "label": "IV-II", "year": 4, "semester": 2}
  ],
  "cells": [{"branch": "cse-aiml", "year": 3, "semester": 1, "count": 1}]
}
```

`regulation` in the response is the canonical code (or `null` when not filtered). A cell links to
`GET /courses?university=jntuh&branch=cse-aiml&year=3&semester=1[&regulation=R22]`.

## GET /catalogue/suggest-regulation?university=jntuh&joined_year=2022

The regulation with the greatest `joined_year` that is `<=` the given year (for pre-filling "My syllabus").
`joined_year` must be 2015-2035 (else `422`); unknown university `404`.

```json
{"regulation": "R22"}
```
2018-2019 -> R18, 2020-2021 -> R20, 2022-2024 -> R22, 2025+ -> R25, before 2018 -> `null`.

## GET /courses

Published courses, ordered by course position then title. All query parameters are optional and combine with AND;
without any, the result is exactly what it was before (plus the new fields).

| param | meaning |
|---|---|
| `university` | university slug |
| `regulation` | regulation code (case-insensitive); course lists that regulation |
| `branch` | branch slug; course is mapped to that branch |
| `year` | 1-4 (`422` otherwise) |
| `semester` | 1-2 (`422` otherwise) |
| `q` | case-insensitive substring of the title or subject code (max 100 chars; `%`/`_` are literal) |

When `university` is given, `regulation` and `branch` are matched within that university. Unknown values return `[]`.
"Also show other regulations" = simply leave `regulation` out.

Each item (counts in this example are illustrative):

```json
{
  "slug": "machine-learning-r22",
  "title": "Machine Learning: JNTUH R22 B.Tech CSE (AI&ML), III-I",
  "description": "...",
  "previews": [{"slug": "u1-p1", "title": "Part 1: ...", "is_preview": true}],
  "university": {"slug": "jntuh", "name": "Jawaharlal Nehru Technological University Hyderabad", "short_name": "JNTUH"},
  "regulations": [{"code": "R22", "label": "R22 (joined 2022-2024)"}],
  "branches": [{"slug": "cse-aiml", "name": "Computer Science and Engineering (Artificial Intelligence and Machine Learning)", "short_name": "CSE (AI and ML)"}],
  "year": 3,
  "semester": 1,
  "subject_code": "AM502PC",
  "unit_count": 5,
  "part_count": 26,
  "quiz_count": 2,
  "has_preview": true
}
```

- `university` may be `null`; `regulations`/`branches` may be `[]`; `year`, `semester`, `subject_code` may be `null`.
- `unit_count`: units of the course (same list as the course page). `part_count`: published parts.
  `quiz_count`: published quizzes. `has_preview`: at least one published free-preview part.

## GET /courses/{slug}

Unchanged fields (`slug`, `title`, `description`, `overview_parts`, `units`) plus the same metadata fields as
above: `university`, `regulations`, `branches`, `year`, `semester`, `subject_code`, `unit_count`, `part_count`,
`quiz_count`, `has_preview`. `404` for unknown or unpublished courses.

## GET /me/syllabus (signed in)

The student's default filter. Every field may be `null` (nothing saved yet).

```json
{
  "university": "jntuh", "university_name": "Jawaharlal Nehru Technological University Hyderabad", "university_short_name": "JNTUH",
  "regulation": "R22", "regulation_label": "R22 (joined 2022-2024)",
  "branch": "cse-aiml", "branch_name": "Computer Science and Engineering (Artificial Intelligence and Machine Learning)", "branch_short_name": "CSE (AI and ML)",
  "joined_year": 2023, "year": 3, "semester": 1
}
```

## PUT /me/syllabus (signed in)

Body (all optional), **replaces** the whole syllabus: fields left out or `null` are cleared.

```json
{"university": "jntuh", "regulation": "R22", "branch": "cse-aiml", "joined_year": 2023, "year": 3, "semester": 1}
```

Returns the same shape as GET. Errors (nothing is saved):

| status | `detail` | cause |
|---|---|---|
| 401 | | not signed in |
| 422 | `unknown_university` | no such university slug |
| 422 | `regulation_needs_university` / `branch_needs_university` | regulation or branch without a university |
| 422 | `unknown_regulation` / `unknown_branch` | not found in that university (also: belongs to another university) |
| 422 | (pydantic list) | `year` not 1-4, `semester` not 1-2, `joined_year` not 2015-2035 |

Suggested flow: user picks university + year of joining -> call suggest-regulation -> pre-select it -> PUT.

## Data source

`content/catalogue.yaml`, loaded by `app/catalogue_import.py` in `python -m app.seed` (the deploy seed step).
Create-only for universities, regulations and branches; course metadata is only filled while empty, so values
changed later in the database are kept. Add branches (ECE, EEE, ME, CE, ...) by appending them to that file.
