"""Give a registered user a role. Roles can only be changed here, never through the public API.

    python -m app.promote you@example.com admin          # or: instructor / student
    docker compose -f docker-compose.prod.yml --env-file .env exec backend python -m app.promote you@example.com admin
"""
import argparse
import asyncio

from sqlalchemy import func, select

from app.db import async_session_maker
from app.models import User

ROLES = ("student", "instructor", "admin")


async def promote(email: str, role: str) -> bool:
    async with async_session_maker() as s:
        # .unique(): User eager-loads its OAuth accounts (a collection), which SQLAlchemy requires for joined loads.
        result = await s.execute(select(User).where(func.lower(User.email) == email.strip().lower()))
        user = result.unique().scalar_one_or_none()
        if user is None:
            return False
        user.role = role
        await s.commit()
        return True


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("email")
    p.add_argument("role", nargs="?", default="admin", choices=ROLES)
    args = p.parse_args()
    if asyncio.run(promote(args.email, args.role)):
        print(f"{args.email} is now {args.role}")
    else:
        raise SystemExit(f"No user with email {args.email}. Register on the site first, then run this again.")


if __name__ == "__main__":
    main()
