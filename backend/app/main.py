from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.core.config import settings
from app.database.db import create_database
from app.api.auth import router as auth_router
from app.api.trip import router as trip_router
from app.services.ai_service import get_ai_service
from app.services.weather_service import WeatherService
from app.services.focus_points_service import get_focus_points_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_database()

    print()
    print("=" * 60)
    print(f"{settings.APP_NAME} Backend Started")
    print("=" * 60)
    print()

    yield

    print()
    print("=" * 60)
    print(f"{settings.APP_NAME} Backend Stopped")
    print("=" * 60)
    print()


app = FastAPI(
    title=settings.APP_NAME,
    description="AI Powered Sustainable Travel Planning Platform",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


cors_origins = settings.cors_origins_list
is_wildcard = "*" in cors_origins or settings.CORS_ORIGINS.strip() == "*"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if is_wildcard else cors_origins,
    allow_origin_regex=r".*" if is_wildcard else r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(trip_router)


class ChatHistoryItem(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatHistoryItem]] = None
    user_name: Optional[str] = None


@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest) -> dict:
    ai_service = get_ai_service()
    raw_history = (
        [h.model_dump() for h in request.history] if request.history else None
    )
    result = ai_service.generate_chat_response(
        request.message, raw_history, user_name=request.user_name
    )
    return result


@app.get("/api/weather")
async def get_weather(city: str = "Thiruvananthapuram") -> dict:
    weather_svc = WeatherService()
    try:
        data = weather_svc.get_current_weather(city)
        return data
    except Exception:
        ai_service = get_ai_service()
        return ai_service.get_weather_context(city)


@app.get("/api/destinations/focus-points")
async def get_destination_focus_points(destination: str = "") -> dict:
    svc = get_focus_points_service()
    return svc.get_focus_points(destination)


@app.get("/")
async def root() -> dict:
    return {
        "application": settings.APP_NAME,
        "status": "running",
        "version": "1.0.0",
        "environment": settings.APP_ENV,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/version")
async def version() -> dict:
    return {
        "application": settings.APP_NAME,
        "version": "1.0.0",
        "environment": settings.APP_ENV,
    }


@app.get("/status")
async def status() -> dict:
    return {
        "healthy": True,
        "database": True,
        "authentication": True,
        "trip_service": True,
        "ai_service": True,
        "weather_service": True,
        "recommendation_service": True,
    }
