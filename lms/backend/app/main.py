from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import User
from app.schemas import UserCreate, UserRead, UserUpdate
from app.users import auth_backend, current_active_user, fastapi_users, google_backend, google_client

app = FastAPI(title="LearnWithSateesh LMS API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")


@api.get("/health")
async def health():
    return {"status": "ok"}


api.include_router(fastapi_users.get_auth_router(auth_backend), prefix="/auth", tags=["auth"])
api.include_router(fastapi_users.get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])
api.include_router(fastapi_users.get_reset_password_router(), prefix="/auth", tags=["auth"])
api.include_router(fastapi_users.get_verify_router(UserRead), prefix="/auth", tags=["auth"])
api.include_router(fastapi_users.get_users_router(UserRead, UserUpdate), prefix="/users", tags=["users"])

if settings.google_client_id:
    api.include_router(
        fastapi_users.get_oauth_router(
            google_client,
            google_backend,
            settings.secret,
            redirect_url=f"{settings.public_url}/api/auth/google/callback",
            associate_by_email=True,
            is_verified_by_default=True,  # Google has already verified the email
        ),
        prefix="/auth/google",
        tags=["auth"],
    )


@api.get("/me", response_model=UserRead)
async def me(user: User = Depends(current_active_user)):
    return user


@api.get("/auth/providers")
async def providers():
    return {"google": bool(settings.google_client_id)}


app.include_router(api)
