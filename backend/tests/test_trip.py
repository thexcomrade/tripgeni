import pytest
from app.core.security import create_access_token

def test_generate_ai_itinerary_offline_fallback(client):
    response = client.post(
        "/api/trips/generate-ai-itinerary",
        json={
            "destination": "Munnar",
            "duration_days": 3,
            "budget": 12000,
            "travelers_count": 2,
            "travel_style": "Leisure",
            "interests": ["Tea Hills", "Scenic Views"],
            "transportation_mode": "Car",
            "preferred_accommodation": "Comfort Hotel",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["destination"] == "Munnar"
    assert data["duration_days"] == 3
    assert len(data["ai_itinerary"]) == 3
    assert len(data["attractions"]) > 0
    assert len(data["recommended_hotels"]) > 0
    assert len(data["recommended_restaurants"]) > 0
    assert data["estimated_trip_cost"] > 0

def test_generate_multi_destination_itinerary(client):
    response = client.post(
        "/api/trips/generate-ai-itinerary",
        json={
            "destination": "Munnar ➔ Thekkady ➔ Alleppey",
            "destinations": ["Munnar", "Thekkady", "Alleppey"],
            "origin": "Kochi",
            "duration_days": 5,
            "budget": 25000,
            "travelers_count": 4,
            "travel_style": "Group",
            "interests": ["Nature", "Backwaters", "Wildlife"],
            "transportation_mode": "Bus",
            "preferred_accommodation": "Comfort Hotel",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["duration_days"] == 5
    assert len(data["ai_itinerary"]) == 5

def test_create_and_fetch_trip(client, test_user):
    token = create_access_token(subject=test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    create_payload = {
        "trip_title": "Ooty Hills Getaway",
        "destination": "Ooty",
        "duration_days": 3,
        "budget": 10000,
        "travelers_count": 2,
        "travel_style": "Leisure",
        "interests": ["Botanical Garden", "Toy Train"],
        "transportation_mode": "Car",
        "preferred_accommodation": "Comfort Hotel",
        "ai_itinerary": [
            {"day": 1, "title": "Arrival", "activities": ["Check-in", "Lake stroll"]},
            {"day": 2, "title": "Botanical Gardens", "activities": ["Garden tour", "Tea museum"]},
            {"day": 3, "title": "Toy Train & Departure", "activities": ["Toy train ride"]},
        ],
    }

    create_res = client.post("/api/trips/create", json=create_payload, headers=headers)
    assert create_res.status_code == 201
    trip_id = create_res.json()["id"]

    fetch_res = client.get(f"/api/trips/{trip_id}", headers=headers)
    assert fetch_res.status_code == 200
    trip_data = fetch_res.json()
    assert trip_data["id"] == trip_id
    assert trip_data["trip_title"] == "Ooty Hills Getaway"
    assert trip_data["destination"] == "Ooty"

def test_favorite_unfavorite_trip(client, test_user):
    token = create_access_token(subject=test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post(
        "/api/trips/create",
        json={
            "trip_title": "Varkala Cliff Vacation",
            "destination": "Varkala",
            "duration_days": 2,
            "budget": 6000,
            "travelers_count": 1,
            "interests": ["Beach", "Cliffs"],
        },
        headers=headers,
    )
    trip_id = create_res.json()["id"]

    fav_res = client.post(f"/api/trips/{trip_id}/favorite", headers=headers)
    assert fav_res.status_code == 200
    assert "added to favorites" in fav_res.json()["message"].lower()

    unfav_res = client.post(f"/api/trips/{trip_id}/unfavorite", headers=headers)
    assert unfav_res.status_code == 200
    assert "removed from favorites" in unfav_res.json()["message"].lower()

def test_record_expense_learning(client, test_user):
    token = create_access_token(subject=test_user.id)
    headers = {"Authorization": f"Bearer {token}"}

    create_res = client.post(
        "/api/trips/create",
        json={
            "trip_title": "Goa Beach Journey",
            "destination": "Goa",
            "duration_days": 4,
            "budget": 16000,
            "travelers_count": 2,
            "interests": ["Beach", "Water sports"],
        },
        headers=headers,
    )
    trip_id = create_res.json()["id"]

    expense_payload = {
        "actual_spent_total": 15200,
        "category_actuals": {
            "accommodation": 6000,
            "food": 4500,
            "transportation": 3200,
            "miscellaneous": 1500,
        },
        "user_notes": "Great trip, stayed within budget!",
        "destination": "Goa",
        "duration_days": 4,
        "budget": 16000,
    }

    record_res = client.post(f"/api/trips/{trip_id}/record-expense", json=expense_payload, headers=headers)
    assert record_res.status_code == 200
    record_data = record_res.json()
    assert "reward_score" in record_data
    assert "variance_ratio" in record_data
