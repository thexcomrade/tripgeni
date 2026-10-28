import pytest
from app.services.rental_pricing_service import (
    calculate_rental_estimate,
    detect_rental_category,
    VEHICLE_RENTAL_TIERS,
)
from app.services.ai_service import get_ai_service

def test_detect_rental_category():
    assert detect_rental_category("scooter") == "scooter"
    assert detect_rental_category("bike rental") == "bike_cruiser"
    assert detect_rental_category("self-drive hatchback") == "self_drive_hatchback"
    assert detect_rental_category("suv") == "self_drive_suv"
    assert detect_rental_category("bus", travelers_count=40) == "college_tour_bus"
    assert detect_rental_category("bus", travelers_count=120) == "multi_bus_fleet"

def test_calculate_rental_estimate():
    package = calculate_rental_estimate(
        transport_mode="scooter",
        duration_days=3,
        travelers_count=2,
        destination="Goa",
    )
    assert package is not None
    assert package["is_rental"] is True
    assert package["vehicle_category"] == "scooter"
    assert package["daily_rental_rate"] > 0
    assert package["total_rental_cost"] > 0
    assert package["security_deposit"] is not None

def test_day_trip_nostay_budget_allocation():
    svc = get_ai_service()
    cost = svc.estimate_trip_cost(
        budget=5000,
        duration_days=1,
        travelers_count=2,
        travel_style="leisure",
        preferred_accommodation="NoStay",
    )
    # When preferred accommodation is NoStay, accommodation cost must be 0!
    assert cost["accommodation_cost"] == 0.0
    assert cost["food_cost"] > 0
    assert cost["transportation_cost"] > 0
