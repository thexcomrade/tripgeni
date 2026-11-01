"""
TripGenius — Multi-Modal Transportation Comparison & Aggregation Engine.

Coordinates real quotes across Trains (API Mitra), Flights (Ignav), and Road Fuel (API Mitra)
to present a unified, honest side-by-side comparison for travel planning.
Never ranks or fabricates missing provider data.
"""

from typing import Any, Dict, List, Optional
from app.services.transport.apimitra_fuel_client import ApiMitraFuelClient
from app.services.transport.apimitra_train_client import ApiMitraTrainClient
from app.services.transport.ignav_client import IgnavFlightClient
from app.services.transport.road_calculator import RoadCostCalculator


class TransportComparator:
    """Multi-modal transportation aggregator and comparative analyzer."""

    def __init__(
        self,
        flight_client: Optional[IgnavFlightClient] = None,
        train_client: Optional[ApiMitraTrainClient] = None,
        fuel_client: Optional[ApiMitraFuelClient] = None,
        road_calculator: Optional[RoadCostCalculator] = None,
    ):
        self.flight_client = flight_client or IgnavFlightClient()
        self.train_client = train_client or ApiMitraTrainClient()
        self.fuel_client = fuel_client or ApiMitraFuelClient()
        self.road_calculator = road_calculator or RoadCostCalculator(self.fuel_client)

    async def compare_all_modes(
        self,
        origin: str,
        destination: str,
        journey_date: str,
        passengers: int = 1,
        distance_km: float = 250.0,
        origin_station_code: Optional[str] = None,
        destination_station_code: Optional[str] = None,
        origin_airport_code: Optional[str] = None,
        destination_airport_code: Optional[str] = None,
        vehicle_type: str = "hatchback",
        is_round_trip: bool = False,
    ) -> Dict[str, Any]:
        """
        Gathers live data across all 3 modes and returns an objective comparison.
        """
        passengers = max(1, passengers)

        # 1. Road Calculation (Always available via verified mathematical formula + live fuel)
        road_summary = await self.road_calculator.calculate_road_trip_cost(
            distance_km=distance_km,
            origin_city=origin,
            destination_city=destination,
            vehicle_type=vehicle_type,
            is_round_trip=is_round_trip,
            passengers=passengers,
        )

        # 2. Train Search (API Mitra)
        train_summary: Dict[str, Any] = {
            "mode": "train",
            "status": "not_requested",
            "message": "Station codes not provided.",
        }
        if origin_station_code and destination_station_code:
            train_results = await self.train_client.search_trains(
                from_station=origin_station_code,
                to_station=destination_station_code,
                journey_date=journey_date,
            )
            train_summary = {
                "mode": "train",
                "provider": "apimitra",
                "origin_station": origin_station_code.upper(),
                "destination_station": destination_station_code.upper(),
                "status": train_results.get("fare_status", "unavailable"),
                "services_count": len(train_results.get("trains", [])),
                "trains": train_results.get("trains", [])[:5],  # top 5 options
                "source": "API Mitra",
                "message": train_results.get("message"),
            }

        # 3. Flight Search (Ignav)
        flight_summary: Dict[str, Any] = {
            "mode": "flight",
            "status": "not_requested",
            "message": "Airport codes not provided.",
        }
        if origin_airport_code and destination_airport_code:
            flight_results = await self.flight_client.search_one_way(
                origin_airport=origin_airport_code,
                destination_airport=destination_airport_code,
                departure_date=journey_date,
                passengers=passengers,
            )
            flight_summary = {
                "mode": "flight",
                "provider": "ignav",
                "origin_airport": origin_airport_code.upper(),
                "destination_airport": destination_airport_code.upper(),
                "status": flight_results.get("fare_status", "unavailable"),
                "offers_count": len(flight_results.get("flight_offers", [])),
                "offers": flight_results.get("flight_offers", [])[:5],
                "currency": flight_results.get("currency", "INR"),
                "source": "Ignav Flights",
                "message": flight_results.get("message"),
            }

        # Comparative overview cards
        comparative_cards: List[Dict[str, Any]] = [
            {
                "mode": "Road",
                "headline": f"Road Trip ({road_summary['vehicle_type']})",
                "total_estimated_cost": road_summary["total_road_cost"],
                "cost_per_passenger": road_summary["cost_per_passenger"],
                "currency": "INR",
                "nature": "deterministic_estimate",
                "fuel_type": road_summary["fuel_type"],
                "fuel_rate": f"₹{road_summary['fuel_rate_per_litre']}/L ({road_summary['fuel_rate_source']})",
                "key_benefit": "Full route flexibility, scenic door-to-door transit, baggage freedom",
                "suitable_for": f"{passengers} traveler(s) seeking independent exploration",
            }
        ]

        # Add train card if available
        if train_summary.get("status") in ("available", "partial") and train_summary.get("trains"):
            sample_train = train_summary["trains"][0]
            comparative_cards.append({
                "mode": "Train",
                "headline": f"Indian Railways ({sample_train['train_name']})",
                "train_number": sample_train["train_number"],
                "duration": sample_train["duration"],
                "available_classes": sample_train["available_classes"],
                "fares": sample_train["fares"],
                "currency": "INR",
                "nature": "provider_verified_fare",
                "key_benefit": "Eco-friendly, comfortable overnight sleeper/chair journey, zero highway fatigue",
                "suitable_for": "Budget & scenic comfort travelers",
            })

        # Add flight card if available
        if flight_summary.get("status") == "available" and flight_summary.get("offers"):
            sample_flight = flight_summary["offers"][0]
            fare_per_pax = sample_flight.get("fare_amount")
            total_flight_fare = fare_per_pax * passengers if fare_per_pax is not None else None
            comparative_cards.append({
                "mode": "Flight",
                "headline": f"{sample_flight['airline']} ({sample_flight['flight_number']})",
                "duration": sample_flight["duration"],
                "stops": sample_flight["stops"],
                "fare_per_passenger": fare_per_pax,
                "total_estimated_cost": total_flight_fare,
                "currency": sample_flight["currency"],
                "nature": "provider_live_quote",
                "booking_link": sample_flight.get("booking_link"),
                "key_benefit": "Fastest transit time, ideal for long distances or tight vacation schedules",
                "suitable_for": "Time-sensitive travelers & long-distance corridors",
            })

        return {
            "origin": origin.title(),
            "destination": destination.title(),
            "journey_date": journey_date,
            "passengers": passengers,
            "distance_km": distance_km,
            "road_details": road_summary,
            "train_details": train_summary,
            "flight_details": flight_summary,
            "comparative_cards": comparative_cards,
            "transparency_note": "Fares reflect real provider records from API Mitra and Ignav. TripGenius never fabricates live ticket rates.",
        }
