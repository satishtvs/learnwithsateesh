from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://lws:lws@localhost:5432/lws"
    # JWT signing + token secret. MUST be overridden in production.
    secret: str = "dev-only-change-me"

    # Where the React app lives, and the public URL of the API (OAuth callback).
    frontend_url: str = "http://localhost:5173"
    public_url: str = "http://localhost:5173"  # origin the browser sees; /api is proxied
    cors_origins: list[str] = ["http://localhost:5173"]

    cookie_secure: bool = False  # True in production (HTTPS)
    require_verified_email: bool = False  # True in production

    google_client_id: str = ""
    google_client_secret: str = ""


settings = Settings()
