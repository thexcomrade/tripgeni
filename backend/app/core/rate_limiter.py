"""
TripGenius Token Bucket Rate Limiter
Provides endpoint-wise rate limiting based on the classic Token Bucket algorithm.

Key Features:
- Separate buckets for Authentication (Login, Register, Password Reset)
- Separate buckets for Booking & Trip operations (Flight Booking, Trip Creation, Itinerary Generation)
- Separate bucket for General API traffic
- High precision time tracking using time.monotonic()
- Detailed 429 Too Many Requests response payload and headers (Retry-After, X-RateLimit-*)
- Memory-safe automatic bucket pruning for stale clients
"""

import math
import os
import threading
import time
from typing import Dict, Optional, Tuple
from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse, Response


class TokenBucket:
    """
    Thread-safe implementation of a Token Bucket.
    
    Tokens refill continuously at a rate of `refill_rate` tokens per second
    up to a maximum burst `capacity`.
    """

    def __init__(self, capacity: float, refill_rate: float):
        self.capacity = float(capacity)
        self.refill_rate = float(refill_rate)
        self.tokens = float(capacity)
        self.last_refill = time.monotonic()
        self.last_accessed = time.time()
        self.lock = threading.Lock()

    def consume(self, amount: float = 1.0) -> Tuple[bool, float, float]:
        """
        Attempts to consume `amount` tokens.
        
        Returns:
            (allowed: bool, remaining_tokens: float, retry_after_seconds: float)
        """
        with self.lock:
            now = time.monotonic()
            self.last_accessed = time.time()
            elapsed = now - self.last_refill
            self.last_refill = now

            # Refill tokens proportional to elapsed time
            self.tokens = min(self.capacity, self.tokens + (elapsed * self.refill_rate))

            if self.tokens >= amount:
                self.tokens -= amount
                return True, self.tokens, 0.0
            else:
                missing = amount - self.tokens
                retry_after = missing / self.refill_rate if self.refill_rate > 0 else 60.0
                return False, self.tokens, max(1.0, retry_after)

    def get_remaining(self) -> float:
        with self.lock:
            now = time.monotonic()
            elapsed = now - self.last_refill
            refilled = min(self.capacity, self.tokens + (elapsed * self.refill_rate))
            return refilled


class BucketConfig:
    """Configuration for an endpoint bucket category."""

    def __init__(self, name: str, capacity: int, refill_rate_per_sec: float, description: str):
        self.name = name
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.description = description


# Endpoint-specific rate limiting configurations
# - Auth / Login: Strict burst control (5 requests, refills 1 token every 12s -> 5 per minute)
# - Booking & Trips: Dedicated burst (10 requests, refills 1 token every 6s -> 10 per minute)
# - General: Generous burst (60 requests, refills 1 token per second -> 60 per minute)
BUCKET_CONFIGS: Dict[str, BucketConfig] = {
    "auth": BucketConfig(
        name="auth",
        capacity=5,
        refill_rate_per_sec=5.0 / 60.0,  # 5 per minute
        description="Authentication and Login Security Bucket",
    ),
    "booking": BucketConfig(
        name="booking",
        capacity=10,
        refill_rate_per_sec=10.0 / 60.0,  # 10 per minute
        description="Booking and Itinerary Generation Protection Bucket",
    ),
    "general": BucketConfig(
        name="general",
        capacity=60,
        refill_rate_per_sec=60.0 / 60.0,  # 60 per minute
        description="General API Operation Bucket",
    ),
}


class TokenBucketManager:
    """Manages token buckets for clients across endpoint categories."""

    def __init__(self):
        self._buckets: Dict[str, TokenBucket] = {}
        self._lock = threading.Lock()
        self._last_cleanup = time.time()

    def get_bucket(self, key: str, category: str) -> TokenBucket:
        config = BUCKET_CONFIGS.get(category, BUCKET_CONFIGS["general"])
        composite_key = f"{category}:{key}"

        with self._lock:
            self._maybe_cleanup_stale_buckets()
            if composite_key not in self._buckets:
                self._buckets[composite_key] = TokenBucket(
                    capacity=config.capacity,
                    refill_rate=config.refill_rate,
                )
            return self._buckets[composite_key]

    def reset_bucket(self, key: str, category: str) -> None:
        composite_key = f"{category}:{key}"
        with self._lock:
            if composite_key in self._buckets:
                config = BUCKET_CONFIGS.get(category, BUCKET_CONFIGS["general"])
                self._buckets[composite_key] = TokenBucket(
                    capacity=config.capacity,
                    refill_rate=config.refill_rate,
                )

    def _maybe_cleanup_stale_buckets(self, max_idle_seconds: float = 3600.0) -> None:
        """Evicts buckets that have not been touched for over 1 hour."""
        now = time.time()
        if now - self._last_cleanup < 300.0:
            return  # Run cleanup at most every 5 minutes

        self._last_cleanup = now
        stale_keys = [
            k for k, b in self._buckets.items()
            if now - b.last_accessed > max_idle_seconds
        ]
        for k in stale_keys:
            self._buckets.pop(k, None)


# Global singleton instance
rate_limiter_manager = TokenBucketManager()


def get_client_identifier(request: Request) -> str:
    """Extracts a reliable client identifier (IP address)."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    if request.client and request.client.host:
        return request.client.host
    return "127.0.0.1"


def classify_endpoint(path: str, method: str) -> Optional[str]:
    """
    Categorizes request path to its dedicated token bucket:
    - 'auth': /api/auth/login, /api/auth/register, /api/auth/send-password-otp, /api/auth/change-password
    - 'booking': /api/trips/create, /api/transport/flights/booking-links, /api/trips/generate-ai-itinerary,
                 /api/trips/export-pdf, /api/transport/flights/*, /api/transport/trains/*
    - 'general': all other /api/* endpoints
    - None: non-API static or doc paths
    """
    normalized_path = path.lower().rstrip("/")

    # Exclude non-API, documentation, and health endpoints from rate limiting
    if not normalized_path.startswith("/api") or normalized_path in {
        "/docs", "/redoc", "/openapi.json", "/api/ratelimit/status"
    }:
        return None

    # AUTHENTICATION ENDPOINTS (Login, Register, Password Reset)
    if (
        "/api/auth/login" in normalized_path
        or "/api/auth/register" in normalized_path
        or "/api/auth/send-password-otp" in normalized_path
        or "/api/auth/change-password" in normalized_path
    ):
        return "auth"

    # BOOKING & TRIP CREATION / EXPENSIVE GENERATION ENDPOINTS
    if (
        "/api/trips/create" in normalized_path
        or "/api/trips/generate-ai-itinerary" in normalized_path
        or "/api/transport/flights/booking-links" in normalized_path
        or "/api/trips/export-pdf" in normalized_path
        or "/api/transport/flights" in normalized_path
        or "/api/transport/trains" in normalized_path
    ):
        return "booking"

    # ALL OTHER API TRAFFIC (Profile, Weather, Chat, History, etc.)
    return "general"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI / Starlette middleware enforcing token bucket rate limits per category.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        category = classify_endpoint(request.url.path, request.method)

        # Skip rate limiting for excluded routes
        if not category:
            return await call_next(request)

        # Allow tests to selectively bypass rate limiting via header or app state
        bypass_header = request.headers.get("x-bypass-ratelimit")
        is_test_client = request.client and request.client.host == "testclient"
        disable_rate_limiting = getattr(request.app.state, "disable_rate_limiting", False)

        # Allow test client by default UNLESS testing explicitly tests rate limits
        if bypass_header == "true" or (is_test_client and disable_rate_limiting):
            return await call_next(request)

        client_id = get_client_identifier(request)
        bucket = rate_limiter_manager.get_bucket(client_id, category)
        allowed, remaining, retry_after = bucket.consume(1.0)

        if not allowed:
            retry_seconds = int(math.ceil(retry_after))
            category_label = "Login" if category == "auth" else ("Booking" if category == "booking" else "API")
            headers = {
                "Retry-After": str(retry_seconds),
                "X-RateLimit-Limit": str(int(bucket.capacity)),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(retry_seconds),
                "X-RateLimit-Category": category,
            }
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please try again after sometime.",
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "category": category,
                    "retry_after": retry_seconds,
                    "message": f"{category_label} rate limit exceeded. Please try again after sometime ({retry_seconds}s).",
                },
                headers=headers,
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(int(bucket.capacity))
        response.headers["X-RateLimit-Remaining"] = str(max(0, int(remaining)))
        response.headers["X-RateLimit-Category"] = category
        return response


def require_token_bucket(category: str, cost: float = 1.0):
    """
    FastAPI dependency for explicit endpoint-level enforcement.
    """
    async def dependency(request: Request):
        client_id = get_client_identifier(request)
        bucket = rate_limiter_manager.get_bucket(client_id, category)
        allowed, remaining, retry_after = bucket.consume(cost)
        if not allowed:
            retry_seconds = int(math.ceil(retry_after))
            category_label = "Login" if category == "auth" else ("Booking" if category == "booking" else "API")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again after sometime.",
                headers={
                    "Retry-After": str(retry_seconds),
                    "X-RateLimit-Limit": str(int(bucket.capacity)),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(retry_seconds),
                },
            )
        return {"category": category, "remaining": remaining}

    return dependency
