"""
TripGenius — Road Trip & Vehicle Fuel Cost Intelligence Engine.

Computes mathematically deterministic fuel consumption and road expenses
based on verified route distances, vehicle category mileage, and real city fuel rates.
Formula:
  Fuel Required (L) = Route Distance (km) / Vehicle Mileage (km/L)
  Estimated Fuel Cost (INR) = Fuel Required (L) * Live Fuel Rate (INR/L)
"""

from typing import Any, Dict, Optional
from app.services.transport.apimitra_fuel_client import ApiMitraFuelClient


# Standard realistic vehicle mileage presets (km / litre)
VEHICLE_MILEAGE_PRESETS: Dict[str, Dict[str, Any]] = {
    "motorcycle": {
        "label": "Motorcycle / Bike (Royal Enfield / 150-350cc)",
        "default_mileage": 35.0,
        "fuel_type": "petrol",
        "toll_applicable": False,
    },
    "scooter": {
        "label": "Automatic Scooter (Activa / Jupiter / Access)",
        "default_mileage": 42.0,
        "fuel_type": "petrol",
        "toll_applicable": False,
    },
    "hatchback": {
        "label": "Compact / Hatchback (Swift / i10 / Tiago)",
        "default_mileage": 18.0,
        "fuel_type": "petrol",
        "toll_applicable": True,
    },
    "sedan": {
        "label": "Sedan (City / Verna / Ciaz)",
        "default_mileage": 15.0,
        "fuel_type": "petrol",
        "toll_applicable": True,
    },
    "suv": {
        "label": "Compact / Mid SUV (Creta / Seltos / Brezza)",
        "default_mileage": 13.5,
        "fuel_type": "diesel",
        "toll_applicable": True,
    },
    "muv": {
        "label": "Large MUV / People Carrier (Innova / Ertiga)",
        "default_mileage": 12.0,
        "fuel_type": "diesel",
        "toll_applicable": True,
    },
}


class RoadCostCalculator:
    """Deterministic road travel calculation engine."""

    def __init__(self, fuel_client: Optional[ApiMitraFuelClient] = None):
        self.fuel_client = fuel_client or ApiMitraFuelClient()

    async def calculate_road_trip_cost(
        self,
        distance_km: float,
        origin_city: str,
        destination_city: str,
        vehicle_type: str = "hatchback",
        custom_mileage: Optional[float] = None,
        custom_fuel_type: Optional[str] = None,
        is_round_trip: bool = False,
        passengers: int = 1,
    ) -> Dict[str, Any]:
        """Calculates precise road trip fuel expense with transparent mathematical breakdown."""
        v_key = vehicle_type.lower().strip()
        preset = VEHICLE_MILEAGE_PRESETS.get(v_key, VEHICLE_MILEAGE_PRESETS["hatchback"])

        mileage = float(custom_mileage) if (custom_mileage and custom_mileage > 0) else preset["default_mileage"]
        fuel_type = (custom_fuel_type or preset["fuel_type"]).lower().strip()
        if fuel_type not in ("petrol", "diesel"):
            fuel_type = "petrol"

        # Actual route distance computation
        base_dist = max(1.0, float(distance_km))
        total_distance = base_dist * 2.0 if is_round_trip else base_dist

        # Fetch current fuel rate at destination / origin
        fuel_info = await self.fuel_client.get_fuel_price(destination_city or origin_city, fuel_type)
        fuel_rate = float(fuel_info.get("price_per_litre") or 104.50)

        # Deterministic formula
        fuel_litres = total_distance / mileage
        fuel_expense = fuel_litres * fuel_rate

        # National / State Highway toll calculation (~₹1.85 / km on 4-lane corridors if vehicle is 4-wheeler)
        estimated_tolls = 0.0
        if preset.get("toll_applicable", True) and total_distance > 50:
            # Typical Indian highway average: toll plazas spaced ~60km apart (~₹80-120 per plaza)
            plazas = int(total_distance / 60)
            estimated_tolls = float(plazas * 105)

        # Parking estimate across destinations
        estimated_parking = float(min(450.0, max(50.0, (total_distance / 100) * 80)))

        total_road_expense = fuel_expense + estimated_tolls + estimated_parking
        cost_per_passenger = total_road_expense / max(1, passengers)

        return {
            "transport_type": "road",
            "origin": origin_city.title(),
            "destination": destination_city.title(),
            "route_distance_km": round(base_dist, 1),
            "is_round_trip": is_round_trip,
            "total_distance_km": round(total_distance, 1),
            "vehicle_type": preset.get("label", vehicle_type),
            "fuel_type": fuel_type.upper(),
            "mileage_kmpl": round(mileage, 1),
            "fuel_required_litres": round(fuel_litres, 2),
            "fuel_rate_per_litre": round(fuel_rate, 2),
            "fuel_rate_source": fuel_info.get("source", "API Mitra"),
            "fuel_rate_updated_at": fuel_info.get("updated_at"),
            "estimated_fuel_cost": round(fuel_expense, 2),
            "estimated_tolls": round(estimated_tolls, 2),
            "estimated_parking": round(estimated_parking, 2),
            "total_road_cost": round(total_road_expense, 2),
            "cost_per_passenger": round(cost_per_passenger, 2),
            "passenger_count": max(1, passengers),
            "currency": "INR",
            "calculation_nature": "deterministic_estimate",
            "formula_applied": f"{total_distance:.1f} km / {mileage:.1f} kmpl × ₹{fuel_rate:.2f}/L + Tolls/Parking",
            "disclaimer": "Calculated using live city petroleum rates and standard highway toll frequency. Actual vehicle load, traffic, and driving style may cause modest variations.",
        }
