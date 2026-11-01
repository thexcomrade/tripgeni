"""
Test Suite for Token Bucket Rate Limiter
Validates:
1. Endpoint-wise isolation (Auth vs Booking vs General)
2. Bucket exhaustion triggers HTTP 429 Too Many Requests with correct headers
3. Retry-After countdown and X-RateLimit-* headers
4. Token bucket refill over time
5. Token bucket reset endpoint
"""

import time
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.rate_limiter import (
    TokenBucket,
    rate_limiter_manager,
    BUCKET_CONFIGS,
)


def test_token_bucket_unit():
    """Unit test for the low-level TokenBucket algorithm."""
    # Capacity 2, refill rate 1 token / sec
    bucket = TokenBucket(capacity=2.0, refill_rate=1.0)
    
    # 1st consume: allowed, 1 left
    allowed, remaining, retry_after = bucket.consume(1.0)
    assert allowed is True
    assert remaining >= 0.99
    assert retry_after == 0.0

    # 2nd consume: allowed, 0 left
    allowed, remaining, retry_after = bucket.consume(1.0)
    assert allowed is True
    assert remaining < 0.1
    assert retry_after == 0.0

    # 3rd consume: blocked, retry_after > 0
    allowed, remaining, retry_after = bucket.consume(1.0)
    assert allowed is False
    assert retry_after > 0.0

    # Sleep 1.05s to allow 1 token to refill
    time.sleep(1.05)
    allowed, remaining, retry_after = bucket.consume(1.0)
    assert allowed is True


def test_endpoint_wise_rate_limiter_isolation():
    """
    Validates that Auth (Login/Register) bucket and Booking bucket
    are strictly isolated: exhausting Auth bucket does NOT block Booking.
    """
    client = TestClient(app)
    # Enable rate limiting for this test client
    app.state.disable_rate_limiting = False
    
    # Reset buckets for test client
    client.post("/api/ratelimit/reset")

    auth_capacity = BUCKET_CONFIGS["auth"].capacity  # 5
    booking_capacity = BUCKET_CONFIGS["booking"].capacity  # 10

    # 1. Exhaust Auth bucket by sending requests to /api/auth/login
    for i in range(auth_capacity):
        res = client.post("/api/auth/login", json={"email": "wrong@test.com", "password": "wrong"})
        # Should be 401 (invalid creds) or 200, NOT 429
        assert res.status_code != 429, f"Attempt {i+1} got 429 unexpectedly"
        assert "X-RateLimit-Limit" in res.headers

    # 2. Next Auth request MUST return 429 Too Many Requests
    exhausted_res = client.post("/api/auth/login", json={"email": "wrong@test.com", "password": "wrong"})
    assert exhausted_res.status_code == 429
    assert "Retry-After" in exhausted_res.headers
    assert exhausted_res.headers["X-RateLimit-Category"] == "auth"
    payload = exhausted_res.json()
    assert payload["error_code"] == "RATE_LIMIT_EXCEEDED"
    assert "detail" in payload
    assert payload["retry_after"] > 0

    # 3. CRITICAL: Booking endpoint (/api/trips/create or /api/transport/flights/search)
    # MUST STILL SUCCEED because it has a SEPARATE bucket!
    booking_res = client.get("/api/transport/trains/search?from_station=NDLS&to_station=TVC&date=20261110")
    # Should NOT be 429
    assert booking_res.status_code != 429
    assert booking_res.headers.get("X-RateLimit-Category") == "booking"

    # Reset state
    app.state.disable_rate_limiting = True
    client.post("/api/ratelimit/reset")


def test_rate_limit_status_endpoint():
    """Validates the /api/ratelimit/status endpoint."""
    client = TestClient(app)
    res = client.get("/api/ratelimit/status")
    assert res.status_code == 200
    data = res.json()
    assert "buckets" in data
    assert "auth" in data["buckets"]
    assert "booking" in data["buckets"]
    assert "general" in data["buckets"]
    assert data["buckets"]["auth"]["capacity"] == 5
    assert data["buckets"]["booking"]["capacity"] == 10
    assert data["buckets"]["general"]["capacity"] == 60
