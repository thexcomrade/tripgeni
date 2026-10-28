import pytest
from app.core.security import create_access_token

def test_register_user_success(client):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Alice Explorer",
            "email": "alice@tripgenius.com",
            "password": "SecurePassword123!",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert data["email"] == "alice@tripgenius.com"
    assert "user_id" in data

def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Test Traveler",
            "email": test_user.email,
            "password": "Password123!",
        },
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()

def test_login_success(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "Password123!",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "Bearer"

def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={
            "email": test_user.email,
            "password": "WrongPassword999!",
        },
    )
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()

def test_get_profile(client, test_user):
    token = create_access_token(subject=test_user.id)
    response = client.get(
        "/api/auth/profile",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user.id
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name
    assert data["username"] == "test_traveler"  # Dynamically derived from email!
    assert data["eco_travel_score"] == 90

def test_get_profile_unauthorized(client):
    response = client.get("/api/auth/profile")
    assert response.status_code == 401
