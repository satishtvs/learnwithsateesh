# lws-lms – LearnWithSateesh LMS

FastAPI + React (Vite, TypeScript) + PostgreSQL. Free for students; sign-in with email or Google.
This layout is the standard template for FastAPI + React projects.

    backend/    FastAPI, SQLAlchemy 2 (async), Alembic, fastapi-users (cookie JWT + Google OAuth)
    frontend/   React, React Router, TanStack Query (Vite dev server proxies /api -> :8000)
    deploy/     EC2 / Nginx / backup scripts (not written yet)

## Run locally (WSL)

    cp .env.example .env
    docker compose up -d db
    cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
    .venv/bin/alembic upgrade head
    .venv/bin/python -m app.seed                   # AI Y3S1 course: 10 chapters + the uploaded videos
    .venv/bin/uvicorn app.main:app --reload        # http://localhost:8000/docs
    cd ../frontend && npm install && npm run dev   # http://localhost:5173

## Tests

    cd backend && .venv/bin/python -m pytest

## Google sign-in

Create an OAuth client (Web) in Google Cloud Console, add redirect URI
`<PUBLIC_URL>/api/auth/google/callback`, then set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env`.
The "Continue with Google" button only appears when these are set.

## Production checklist

- `SECRET` long and random; `COOKIE_SECURE=true`; `REQUIRE_VERIFIED_EMAIL=true`
- Implement SES in `backend/app/emailer.py` (currently logs emails to the console)
- HTTPS in front (Nginx + Let's Encrypt); only ports 80/443 public
- Never commit `.env`

## Build order

1. ~~Scaffold, Compose, DB, migrations~~  2. ~~Auth (email + Google)~~
3. ~~Course / chapter / lesson API + pages~~  4. Progress  5. Quizzes
6. Instructor admin + content importer  7. EC2 deployment  8. v2 features
