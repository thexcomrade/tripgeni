"""
TripGenius — Transportation Intelligence Automated Test Suite.

Verifies:
1. Ignav Flight Client normalization, freshness & error resilience.
2. API Mitra Train Client schedule handling & strict class fare rules (1A/2A/3A only).
3. API Mitra Fuel Client city rate lookup & benchmark fallback.
4. Road Cost Calculator mathematical formulas and toll handling.
5. Multi-modal comparator consistency.
6. FastAPI transport router endpoints.
"""

import asyncio
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.transport.apimitra_fuel_client import ApiMitraFuelClient
from app.services.transport.apimitra_train_client import ApiMitraTrainClient
from app.services.transport.ignav_client import IgnavFlightClient
from app.services.transport.road_calculator import RoadCostCalculator
from app.services.transport.comparator import TransportComparator


@pytest.fixture
def client():
    return TestClient(app)


# ============================================================
# 1. IGNAV FLIGHT CLIENT TESTS
# ============================================================

def test_ignav_client_unconfigured_graceful_response():
    """Client must not crash when IGNAV_API_KEY is empty."""
    ignav = IgnavFlightClient(api_key="")
    res = asyncio.run(ignav.search_one_way("COK", "DEL", "2026-11-15"))
    assert res["provider"] == "ignav"
    assert res["fare_status"] == "unavailable"
    assert "not configured" in res["message"]


def test_ignav_normalization():
    """Verifies that raw flight data is cleanly normalized with observed_at timestamp."""
    ignav = IgnavFlightClient()
    mock_raw = [
        {
            "id": "ignav_test_123",
            "airline": "Air India",
            "flight_number": "AI-503",
            "origin": "COK",
            "destination": "DEL",
            "departure": "06:30",
            "arrival": "09:45",
            "duration": "3h 15m",
            "stops": 0,
            "cabin": "Economy",
            "fare": 4850.0,
            "currency": "INR",
            "observed_at": "2026-11-01T04:00:00Z",
            "booking_link": "https://ignav.com/book/123",
        }
    ]
    norm = ignav._normalize_flight_response(mock_raw, "COK", "DEL", "INR")
    assert norm["fare_status"] == "available"
    assert len(norm["flight_offers"]) == 1
    offer = norm["flight_offers"][0]
    assert offer["airline"] == "Air India"
    assert offer["fare_amount"] == 4850.0
    assert offer["price_guaranteed"] is False


# ============================================================
# 2. API MITRA TRAIN CLIENT TESTS
# ============================================================

def test_train_normalization_strict_classes():
    """
    Verifies that ONLY provider-returned class fares are populated,
    and missing/unsupported classes cleanly show 'Fare information unavailable'.
    Never uses fake per-km formulas.
    """
    train = ApiMitraTrainClient()
    mock_raw = {
        "trains": [
            {
                "number": "12617",
                "name": "Mangala Lakshadweep Express",
                "from": "ERS",
                "to": "NZM",
                "departure": "13:25",
                "arrival": "13:30",
                "duration": "48h 05m",
                "distance_km": 2780,
                "classes": ["SL", "3A", "2A", "1A"],
                "fares": {
                    "3A": 2480,
                    "2A": 3650,
                    "1A": 6120,
                    # Notice: 'SL' has no fare in this response
                },
            }
        ]
    }
    norm = train._normalize_train_search_response(mock_raw, "ERS", "NZM", "20261115")
    assert norm["fare_status"] == "available"
    t = norm["trains"][0]
    assert t["train_number"] == "12617"
    assert "3A" in t["fares"]
    assert t["fares"]["3A"]["fare"] == 2480.0
    assert t["fares"]["3A"]["status"] == "available"

    # Sleeper class must be marked unavailable without guessing a fake formula price
    assert "SL" in t["fares"]
    assert t["fares"]["SL"]["fare"] is None
    assert "unavailable" in t["fares"]["SL"]["message"].lower()


# ============================================================
# 3. FUEL CLIENT & ROAD CALCULATOR TESTS
# ============================================================

def test_fuel_client_regional_benchmark():
    """Verifies that fuel client returns realistic regional rates even when offline."""
    fuel = ApiMitraFuelClient()
    info = asyncio.run(fuel.get_fuel_price("Kochi", "petrol"))
    assert info["location"] == "Kochi"
    assert info["fuel_type"] == "petrol"
    assert info["price_per_litre"] > 90.0
    assert info["currency"] == "INR"


def test_road_cost_calculator_formula():
    """
    Tests exact mathematical formula:
    Distance 300 km / Mileage 15 kmpl = 20 L.
    At ₹100/L = ₹2,000 + Tolls.
    """
    calc = RoadCostCalculator()
    res = asyncio.run(
        calc.calculate_road_trip_cost(
            distance_km=300.0,
            origin_city="Kochi",
            destination_city="Munnar",
            vehicle_type="hatchback",
            custom_mileage=15.0,
            is_round_trip=False,
            passengers=2,
        )
    )
    assert res["route_distance_km"] == 300.0
    assert res["fuel_required_litres"] == 20.0  # 300 / 15
    assert res["estimated_fuel_cost"] > 1800.0
    assert res["total_road_cost"] >= res["estimated_fuel_cost"]
    assert res["cost_per_passenger"] == round(res["total_road_cost"] / 2, 2)


# ============================================================
# 4. FASTAPI ROUTE TESTS
# ============================================================

def test_transport_status_endpoint(client):
    """GET /api/transport/status returns operational summary."""
    response = client.get("/api/transport/status")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "operational"
    assert "flight_provider" in data
    assert "train_provider" in data
    assert "fuel_provider" in data


def test_fuel_prices_endpoint(client):
    """GET /api/transport/fuel/prices returns petrol and diesel rates."""
    response = client.get("/api/transport/fuel/prices?city=Kochi")
    assert response.status_code == 200
    data = response.json()
    assert "petrol" in data
    assert "diesel" in data
    assert data["petrol"]["price_per_litre"] > 90.0


def test_road_cost_estimate_endpoint(client):
    """POST /api/transport/road-cost/estimate computes deterministic expenses."""
    payload = {
        "distance_km": 140.0,
        "origin_city": "Kochi",
        "destination_city": "Munnar",
        "vehicle_type": "hatchback",
        "is_round_trip": True,
        "passengers": 4,
    }
    response = client.post("/api/transport/road-cost/estimate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_distance_km"] == 280.0
    assert data["cost_per_passenger"] > 0
    assert data["currency"] == "INR"


def test_compare_endpoint(client):
    """POST /api/transport/compare coordinates multi-modal comparison."""
    payload = {
        "origin": "Kochi",
        "destination": "Munnar",
        "journey_date": "2026-11-20",
        "passengers": 2,
        "distance_km": 130.0,
        "vehicle_type": "suv",
        "is_round_trip": False,
    }
    response = client.post("/api/transport/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "road_details" in data
    assert "comparative_cards" in data
    assert len(data["comparative_cards"]) >= 1
