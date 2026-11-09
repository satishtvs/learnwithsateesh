import uuid
from collections.abc import AsyncGenerator

from fastapi import Depends, Request
from fastapi.responses import RedirectResponse
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import AuthenticationBackend, CookieTransport, JWTStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from httpx_oauth.clients.google import GoogleOAuth2
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_async_session
from app.emailer import send_email
from app.models import OAuthAccount, User

COOKIE_NAME = "lws_auth"
LIFETIME = 60 * 60 * 24 * 7  # 7 days


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.secret
    verification_token_secret = settings.secret

    async def on_after_register(self, user: User, request: Request | None = None):
        if not user.is_verified:
            await self.request_verify(user, request)

    async def on_after_forgot_password(self, user: User, token: str, request: Request | None = None):
        link = f"{settings.frontend_url}/reset-password?token={token}"
        await send_email(user.email, "Reset your LearnWithSateesh password", f"Reset link: {link}")

    async def on_after_request_verify(self, user: User, token: str, request: Request | None = None):
        link = f"{settings.frontend_url}/verify?token={token}"
        await send_email(user.email, "Verify your LearnWithSateesh email", f"Verify link: {link}")


async def get_user_db(session: AsyncSession = Depends(get_async_session)) -> AsyncGenerator:
    yield SQLAlchemyUserDatabase(session, User, OAuthAccount)


async def get_user_manager(user_db=Depends(get_user_db)) -> AsyncGenerator[UserManager, None]:
    yield UserManager(user_db)


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=settings.secret, lifetime_seconds=LIFETIME)


def _cookie_kwargs() -> dict:
    return dict(
        cookie_name=COOKIE_NAME,
        cookie_max_age=LIFETIME,
        cookie_secure=settings.cookie_secure,
        cookie_httponly=True,
        cookie_samesite="lax",
    )


class RedirectCookieTransport(CookieTransport):
    """After the Google round-trip, send the browser back to the React app."""

    async def get_login_response(self, token: str):
        response = RedirectResponse(settings.frontend_url, status_code=302)
        return self._set_login_cookie(response, token)


# Password login (called via fetch from the SPA -> 204 + cookie)
auth_backend = AuthenticationBackend(
    name="cookie", transport=CookieTransport(**_cookie_kwargs()), get_strategy=get_jwt_strategy
)
# Google login (browser redirect flow -> 302 to the SPA + same cookie)
google_backend = AuthenticationBackend(
    name="google", transport=RedirectCookieTransport(**_cookie_kwargs()), get_strategy=get_jwt_strategy
)

google_client = GoogleOAuth2(settings.google_client_id, settings.google_client_secret)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend, google_backend])

current_active_user = fastapi_users.current_user(active=True, verified=settings.require_verified_email)
