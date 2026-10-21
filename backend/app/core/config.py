from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = Field(default="Trip Geni")
    APP_ENV: str = Field(default="production")
    APP_DEBUG: bool = Field(default=False)

    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)

    SECRET_KEY: str = Field(default="tripgeni-production-secret-key-398247198273491823")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440)

    DATABASE_URL: str = Field(default="sqlite:///./tripgeni.db")

    TOURISM_DATASET_PATH: str = Field(default="database/tourism.csv")

    GEMINI_API_KEY: str = Field(default="")
    OPENWEATHER_API_KEY: str = Field(default="")

    CORS_ORIGINS: str = Field(
    default="https://tripgenius-kohl.vercel.app,http://localhost:3000,http://127.0.0.1:3000")

    LOG_LEVEL: str = Field(default="INFO")

    # SMTP Email Configuration
    SMTP_HOST: str = Field(default="smtp.gmail.com")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: str = Field(default="")
    SMTP_PASSWORD: str = Field(default="")
    SMTP_FROM_EMAIL: str = Field(default="noreply@tripgeni.com")
    SMTP_FROM_NAME: str = Field(default="Trip Geni Security")
    SMTP_TLS: bool = Field(default=True)

    @property
    def tourism_dataset_path(self) -> Path:
        candidates = [
            ROOT_DIR / self.TOURISM_DATASET_PATH,
            ROOT_DIR / "database" / "tourism.csv",
            BACKEND_DIR / "tourism.csv",
            BACKEND_DIR / "database" / "tourism.csv",
            Path.cwd() / "tourism.csv",
            Path.cwd() / "database" / "tourism.csv",
        ]
        for candidate in candidates:
            if candidate.exists():
                return candidate

        return BACKEND_DIR / "tourism.csv"

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]

    @property
    def sqlite_database_file(self) -> Path:
        if self.DATABASE_URL.startswith("sqlite:///"):
            database_name = self.DATABASE_URL.replace("sqlite:///", "")
            if database_name.startswith("./"):
                database_name = database_name[2:]
            return BACKEND_DIR / database_name

        return BACKEND_DIR / "tripgeni.db"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
