import os

# Must be set before the app is imported.
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"

import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402

from app.db import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Base  # noqa: E402


@pytest_asyncio.fixture(autouse=True)
async def fresh_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield


@pytest.fixture(autouse=True)
def no_wall_clock(monkeypatch):
    """Tests report a whole video instantly; the real server also checks the learner stayed long enough."""
    from app import progress

    monkeypatch.setattr(progress, "WALL_CLOCK_CHECK", False)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
