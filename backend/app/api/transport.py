"""
TripGenius — Transportation Intelligence & Live Fare API Router.

Provides verified endpoints for:
- Indian Railways train schedule & class fare discovery (API Mitra)
- Real flight search & booking link generation (Ignav)
- City-wise live Petrol & Diesel rates (API Mitra)
- Deterministic road trip fuel & toll cost calculation
- Multi-modal comparative cost analysis
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.services.transport.apimitra_fuel_client import ApiMitraFuelClient
from app.services.transport.apimitra_train_client import ApiMitraTrainClient
from app.services.transport.comparator import TransportComparator
from app.services.transport.ignav_client import IgnavFlightClient
from app.services.transport.road_calculator import RoadCostCalculator

router = APIRouter(prefix="/api/transport", tags=["Transportation Intelligence"])

# Shared service instances
ignav_client = IgnavFlightClient()
train_client = ApiMitraTrainClient()
fuel_client = ApiMitraFuelClient()
road_calculator = RoadCostCalculator(fuel_client)
transport_comparator = TransportComparator(
    flight_client=ignav_client,
    train_client=train_client,
    fuel_client=fuel_client,
    road_calculator=road_calculator,
)


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class FlightSearchRequest(BaseModel):
    origin_airport: str = Field(..., description="3-letter IATA origin airport code (e.g. COK, DEL)")
    destination_airport: str = Field(..., description="3-letter IATA destination airport code (e.g. DEL, BLR)")
    departure_date: str = Field(..., description="Flight departure date (YYYY-MM-DD)")
    passengers: int = Field(default=1, ge=1, le=9)
    cabin_class: str = Field(default="ECONOMY")
    currency: str = Field(default="INR")


class BookingLinksRequest(BaseModel):
    itinerary_id: str = Field(..., description="Verified Ignav itinerary identifier")


class RoadCostRequest(BaseModel):
    distance_km: float = Field(..., gt=0, description="Total one-way route distance in kilometres")
    origin_city: str = Field(..., description="Origin city / town name")
    destination_city: str = Field(..., description="Destination city / town name")
    vehicle_type: str = Field(default="hatchback", description="Category: hatchback, sedan, suv, muv, motorcycle, scooter")
    custom_mileage: Optional[float] = Field(default=None, description="Custom vehicle mileage in km/L")
    custom_fuel_type: Optional[str] = Field(default="petrol", description="Fuel type: petrol or diesel")
    is_round_trip: bool = Field(default=False)
    passengers: int = Field(default=1, ge=1)


class CompareModesRequest(BaseModel):
    origin: str = Field(..., description="Departure city or region")
    destination: str = Field(..., description="Arrival destination city or region")
    journey_date: str = Field(..., description="Journey date in YYYY-MM-DD format")
    passengers: int = Field(default=1, ge=1)
    distance_km: float = Field(default=250.0, gt=0)
    origin_station_code: Optional[str] = Field(default=None, description="Railway station code (e.g. NDLS, ERS)")
    destination_station_code: Optional[str] = Field(default=None, description="Railway station code (e.g. TVC, MAO)")
    origin_airport_code: Optional[str] = Field(default=None, description="IATA airport code (e.g. DEL, COK)")
    destination_airport_code: Optional[str] = Field(default=None, description="IATA airport code (e.g. TRV, GOI)")
    vehicle_type: str = Field(default="hatchback")
    is_round_trip: bool = Field(default=False)


# ============================================================
# TRAIN ENDPOINTS (API MITRA)
# ============================================================

@router.get("/trains/search", summary="Search Indian Railways trains between stations")
async def search_trains(
    from_station: str = Query(..., description="Origin railway station code (e.g. NDLS, ERS, SBC)"),
    to_station: str = Query(..., description="Destination railway station code (e.g. TVC, CAN, MAS)"),
    date: str = Query(..., description="Journey date in YYYYMMDD or YYYY-MM-DD"),
):
    """Discovers scheduled train services and available class fares strictly from API Mitra."""
    result = await train_client.search_trains(from_station, to_station, date)
    return result


@router.get("/trains/{train_number}", summary="Get verified train schedule and metadata")
async def get_train_info(train_number: str):
    """Retrieves verified schedule details for a specific train service."""
    result = await train_client.get_train_info(train_number)
    return result


@router.get("/trains/{train_number}/route", summary="Get train intermediate route stations")
async def get_train_route(train_number: str):
    """Retrieves route stations and rail distances for a train number."""
    result = await train_client.get_train_route(train_number)
    return result


@router.get("/trains/{train_number}/live", summary="Get live train running status")
async def get_train_live(
    train_number: str,
    date: str = Query(..., description="Journey date (YYYYMMDD or YYYY-MM-DD)"),
):
    """Fetches real-time running status and confirmed fares where exposed."""
    result = await train_client.get_train_live(train_number, date)
    return result


# ============================================================
# FLIGHT ENDPOINTS (IGNAV)
# ============================================================

@router.get("/flights/search", summary="Search one-way verified flight offers")
async def search_flights_get(
    origin: str = Query(..., description="IATA code (e.g. COK, DEL)"),
    destination: str = Query(..., description="IATA code (e.g. DEL, BLR)"),
    date: str = Query(..., description="Departure date (YYYY-MM-DD)"),
    passengers: int = Query(default=1, ge=1, le=9),
    cabin: str = Query(default="ECONOMY"),
    currency: str = Query(default="INR"),
):
    """Searches live flight offers from Ignav with price freshness tracking."""
    result = await ignav_client.search_one_way(
        origin_airport=origin,
        destination_airport=destination,
        departure_date=date,
        passengers=passengers,
        cabin_class=cabin,
        currency=currency,
    )
    return result


@router.post("/flights/search", summary="Search flight offers via POST")
async def search_flights_post(payload: FlightSearchRequest):
    """POST payload flight search supporting advanced filters."""
    result = await ignav_client.search_one_way(
        origin_airport=payload.origin_airport,
        destination_airport=payload.destination_airport,
        departure_date=payload.departure_date,
        passengers=payload.passengers,
        cabin_class=payload.cabin_class,
        currency=payload.currency,
    )
    return result


@router.post("/flights/booking-links", summary="Generate verified flight booking links")
async def get_flight_booking_links(payload: BookingLinksRequest):
    """Requests official booking redirect links for a verified Ignav itinerary ID."""
    result = await ignav_client.get_booking_links(payload.itinerary_id)
    return result


# ============================================================
# FUEL ENDPOINTS (API MITRA)
# ============================================================

@router.get("/fuel/prices", summary="Get city-wise live petrol and diesel rates")
async def get_fuel_prices(
    city: str = Query(default="Kochi", description="City name (e.g. Kochi, Munnar, Delhi, Mumbai)"),
    fuel: Optional[str] = Query(default=None, description="Optional 'petrol' or 'diesel' filter"),
):
    """Retrieves verified petroleum prices with update timestamp from API Mitra."""
    if fuel and fuel.lower() in ("petrol", "diesel"):
        return await fuel_client.get_fuel_price(city, fuel)
    return await fuel_client.get_city_fuel_bundle(city)


# ============================================================
# ROAD & COMPARISON ENDPOINTS
# ============================================================

@router.post("/road-cost/estimate", summary="Calculate deterministic road trip fuel expense")
async def estimate_road_cost(payload: RoadCostRequest):
    """Computes exact fuel quantity, live petrol/diesel cost, and highway tolls mathematically."""
    result = await road_calculator.calculate_road_trip_cost(
        distance_km=payload.distance_km,
        origin_city=payload.origin_city,
        destination_city=payload.destination_city,
        vehicle_type=payload.vehicle_type,
        custom_mileage=payload.custom_mileage,
        custom_fuel_type=payload.custom_fuel_type,
        is_round_trip=payload.is_round_trip,
        passengers=payload.passengers,
    )
    return result


@router.post("/compare", summary="Multi-modal transportation comparison (Train vs Flight vs Road)")
async def compare_transport_modes(payload: CompareModesRequest):
    """Runs simultaneous verified checks across Road, Train (API Mitra), and Flights (Ignav)."""
    result = await transport_comparator.compare_all_modes(
        origin=payload.origin,
        destination=payload.destination,
        journey_date=payload.journey_date,
        passengers=payload.passengers,
        distance_km=payload.distance_km,
        origin_station_code=payload.origin_station_code,
        destination_station_code=payload.destination_station_code,
        origin_airport_code=payload.origin_airport_code,
        destination_airport_code=payload.destination_airport_code,
        vehicle_type=payload.vehicle_type,
        is_round_trip=payload.is_round_trip,
    )
    return result


@router.get("/status", summary="Provider connection and configuration status")
async def get_transport_provider_status():
    """Returns configuration and availability state of configured transport providers."""
    return {
        "flight_provider": {
            "name": "Ignav",
            "configured": ignav_client.is_configured,
            "base_url": ignav_client.base_url,
        },
        "train_provider": {
            "name": "API Mitra",
            "configured": train_client.is_configured,
            "base_url": train_client.base_url,
            "supported_classes": list(train_client.is_configured and ["1A", "2A", "3A"]),
        },
        "fuel_provider": {
            "name": "API Mitra Fuel",
            "base_url": fuel_client.base_url,
            "cache_ttl_seconds": fuel_client.CACHE_TTL_SECONDS,
        },
        "status": "operational",
    }
