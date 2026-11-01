"""
TripGenius — Ignav Flight Intelligence Client.

Integrates with the Ignav Flight API (https://ignav.com/api) to retrieve verified,
real-time flight offers, class pricing, and dynamic booking links.
Never fabricates fares or ratings.
"""

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class IgnavFlightClient:
    """Official Ignav Flight API client with freshness tracking and robust error handling."""

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = (base_url if base_url is not None else getattr(settings, "IGNAV_API_BASE_URL", "https://ignav.com/api")).rstrip("/")
        self.api_key = (api_key if api_key is not None else getattr(settings, "IGNAV_API_KEY", "")).strip()
        self.timeout = 15.0

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "TripGenius-Platform/1.0",
        }
        if self.api_key:
            headers["X-Api-Key"] = self.api_key
        return headers

    async def search_one_way(
        self,
        origin_airport: str,
        destination_airport: str,
        departure_date: str,
        passengers: int = 1,
        cabin_class: str = "ECONOMY",
        max_stops: Optional[int] = None,
        currency: str = "INR",
    ) -> Dict[str, Any]:
        """Search one-way verified flight offers from Ignav."""
        now_iso = datetime.now(timezone.utc).isoformat()

        if not self.is_configured:
            return {
                "provider": "ignav",
                "transport_type": "flight",
                "origin": origin_airport.upper(),
                "destination": destination_airport.upper(),
                "departure_date": departure_date,
                "flight_offers": [],
                "currency": currency,
                "fetched_at": now_iso,
                "fare_status": "unavailable",
                "message": "Ignav API key is not configured in backend environment (IGNAV_API_KEY).",
                "source": "Ignav Flights",
            }

        endpoint = f"{self.base_url}/fares/one-way"
        payload = {
            "origin": origin_airport.upper().strip(),
            "destination": destination_airport.upper().strip(),
            "departure_date": departure_date.strip(),
            "passengers": {"adults": max(1, passengers)},
            "cabin": cabin_class.upper().strip(),
            "currency": currency.upper().strip(),
        }
        if max_stops is not None:
            payload["max_stops"] = max_stops

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(endpoint, json=payload, headers=self._get_headers())

                if response.status_code == 200:
                    data = response.json()
                    return self._normalize_flight_response(data, origin_airport, destination_airport, currency)
                elif response.status_code in (401, 403):
                    logger.warning("Ignav API authentication error (%d): %s", response.status_code, response.text)
                    return {
                        "provider": "ignav",
                        "transport_type": "flight",
                        "origin": origin_airport.upper(),
                        "destination": destination_airport.upper(),
                        "flight_offers": [],
                        "currency": currency,
                        "fetched_at": now_iso,
                        "fare_status": "unavailable",
                        "message": "Ignav API authentication failed. Please verify IGNAV_API_KEY.",
                        "source": "Ignav Flights",
                    }
                else:
                    logger.warning("Ignav API responded with status %d: %s", response.status_code, response.text)
                    return {
                        "provider": "ignav",
                        "transport_type": "flight",
                        "origin": origin_airport.upper(),
                        "destination": destination_airport.upper(),
                        "flight_offers": [],
                        "currency": currency,
                        "fetched_at": now_iso,
                        "fare_status": "unavailable",
                        "message": f"Ignav API returned status {response.status_code}.",
                        "source": "Ignav Flights",
                    }
        except httpx.RequestError as exc:
            logger.error("Ignav API request error: %s", exc)
            return {
                "provider": "ignav",
                "transport_type": "flight",
                "origin": origin_airport.upper(),
                "destination": destination_airport.upper(),
                "flight_offers": [],
                "currency": currency,
                "fetched_at": now_iso,
                "fare_status": "unavailable",
                "message": f"Connection to Ignav flight server timed out or failed ({exc.__class__.__name__}).",
                "source": "Ignav Flights",
            }

    async def get_booking_links(self, itinerary_id: str) -> Dict[str, Any]:
        """Fetch actual verified booking links for a specific Ignav itinerary reference."""
        if not self.is_configured:
            return {"status": "unavailable", "message": "IGNAV_API_KEY not configured."}

        endpoint = f"{self.base_url}/fares/booking-links"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(endpoint, json={"itinerary_id": itinerary_id}, headers=self._get_headers())
                if res.status_code == 200:
                    return res.json()
                return {"status": "unavailable", "message": f"Ignav returned status {res.status_code}"}
        except Exception as exc:
            return {"status": "error", "message": str(exc)}

    def _normalize_flight_response(
        self,
        raw_data: Any,
        origin: str,
        destination: str,
        currency: str,
    ) -> Dict[str, Any]:
        """Normalizes raw Ignav response items into standard schema."""
        now_iso = datetime.now(timezone.utc).isoformat()
        offers_raw = []
        if isinstance(raw_data, list):
            offers_raw = raw_data
        elif isinstance(raw_data, dict):
            offers_raw = raw_data.get("offers") or raw_data.get("fares") or raw_data.get("results") or []

        normalized_offers: List[Dict[str, Any]] = []

        for item in offers_raw:
            if not isinstance(item, dict):
                continue

            fare_amount = item.get("total_fare") or item.get("fare") or item.get("price") or item.get("amount")
            try:
                fare_val = float(fare_amount) if fare_amount is not None else None
            except (ValueError, TypeError):
                fare_val = None

            offer_currency = str(item.get("currency") or currency).upper()
            observed_at = item.get("observed_at") or item.get("created_at") or now_iso

            normalized_offers.append({
                "itinerary_id": str(item.get("id") or item.get("itinerary_id") or ""),
                "airline": str(item.get("airline") or item.get("airline_name") or "Scheduled Airline"),
                "flight_number": str(item.get("flight_number") or item.get("flight_code") or "FL-Scheduled"),
                "origin": str(item.get("origin") or origin).upper(),
                "destination": str(item.get("destination") or destination).upper(),
                "departure_time": item.get("departure_time") or item.get("departure"),
                "arrival_time": item.get("arrival_time") or item.get("arrival"),
                "duration": item.get("duration") or item.get("total_duration") or "Direct / Connecting",
                "stops": item.get("stops", 0),
                "cabin": str(item.get("cabin") or "Economy").title(),
                "baggage": item.get("baggage"),
                "fare_amount": fare_val,
                "currency": offer_currency,
                "provider_observed_at": observed_at,
                "booking_link": item.get("booking_link") or item.get("url"),
                "price_guaranteed": False,
                "notes": "Fare subject to airline seat availability at time of checkout.",
            })

        status = "available" if normalized_offers else "unavailable"
        return {
            "provider": "ignav",
            "transport_type": "flight",
            "origin": origin.upper(),
            "destination": destination.upper(),
            "flight_offers": normalized_offers,
            "currency": currency,
            "fetched_at": now_iso,
            "fare_status": status,
            "source": "Ignav Flights API",
            "message": f"Found {len(normalized_offers)} verified flight offers." if normalized_offers else "No flight offers returned for this date/route.",
        }
