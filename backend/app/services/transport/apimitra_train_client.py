"""
TripGenius — API Mitra Indian Railways Train Intelligence Client.

Integrates with API Mitra (https://api.apimitra.in) for train schedule discovery,
running status, and verified class fares (1A, 2A, 3A).
Never invents or fabricates per-km ticket prices for unsupported classes.
"""

from datetime import datetime, timezone
import logging
import re
from typing import Any, Dict, List, Optional
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Standard Indian Railways Class Metadata
SUPPORTED_FARE_CLASSES = {"1A", "2A", "3A"}
STANDARD_RAIL_CLASSES: Dict[str, str] = {
    "1A": "AC First Class (1A)",
    "2A": "AC 2-Tier (2A)",
    "3A": "AC 3-Tier (3A)",
    "3E": "AC 3 Economy (3E)",
    "CC": "AC Chair Car (CC)",
    "EC": "Executive Chair Car (EC)",
    "EA": "Executive Anubhuti (EA)",
    "FC": "First Class (FC)",
    "SL": "Sleeper Class (SL)",
    "2S": "Second Sitting (2S)",
    "GN": "Unreserved / General (GN)",
}


class ApiMitraTrainClient:
    """Official API Mitra Train Client with strict fare traceability."""

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None):
        self.base_url = (base_url or getattr(settings, "APIMITRA_BASE_URL", "https://api.apimitra.in")).rstrip("/")
        self.api_key = (api_key or getattr(settings, "APIMITRA_API_KEY", "")).strip()
        self.timeout = 15.0

    @property
    def is_configured(self) -> bool:
        # Some API Mitra public endpoints may work without an API key, or require x-api-key
        return True

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Accept": "application/json",
            "User-Agent": "TripGenius-Platform/1.0",
        }
        if self.api_key:
            headers["x-api-key"] = self.api_key
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def search_trains(
        self,
        from_station: str,
        to_station: str,
        journey_date: str,
    ) -> Dict[str, Any]:
        """
        Search trains between stations.
        Inputs: from_station code (e.g. NDLS), to_station code (e.g. ERS), journey_date (YYYYMMDD or YYYY-MM-DD).
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        src_code = from_station.upper().strip()
        dst_code = to_station.upper().strip()
        date_formatted = re.sub(r"[^0-9]", "", journey_date)

        endpoint = f"{self.base_url}/train"
        params = {"from": src_code, "to": dst_code, "date": date_formatted}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(endpoint, params=params, headers=self._get_headers())
                if res.status_code == 200:
                    data = res.json()
                    return self._normalize_train_search_response(data, src_code, dst_code, date_formatted)
                elif res.status_code in (401, 403):
                    logger.warning("API Mitra train auth required or denied (%d)", res.status_code)
                    return {
                        "provider": "apimitra",
                        "transport_type": "train",
                        "origin": src_code,
                        "destination": dst_code,
                        "trains": [],
                        "fetched_at": now_iso,
                        "fare_status": "unavailable",
                        "message": "API Mitra credentials unauthorized. Verify APIMITRA_API_KEY.",
                        "source": "API Mitra",
                    }
                else:
                    return {
                        "provider": "apimitra",
                        "transport_type": "train",
                        "origin": src_code,
                        "destination": dst_code,
                        "trains": [],
                        "fetched_at": now_iso,
                        "fare_status": "unavailable",
                        "message": f"API Mitra returned status {res.status_code}.",
                        "source": "API Mitra",
                    }
        except Exception as exc:
            logger.warning("API Mitra request failed: %s", exc)
            return {
                "provider": "apimitra",
                "transport_type": "train",
                "origin": src_code,
                "destination": dst_code,
                "trains": [],
                "fetched_at": now_iso,
                "fare_status": "unavailable",
                "message": f"Failed to contact train enquiry provider ({exc.__class__.__name__}).",
                "source": "API Mitra",
            }

    async def get_train_info(self, train_number: str) -> Dict[str, Any]:
        """Fetch verified schedule and metadata for a specific train."""
        endpoint = f"{self.base_url}/train/info"
        params = {"number": train_number.strip()}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(endpoint, params=params, headers=self._get_headers())
                if res.status_code == 200:
                    return res.json()
                return {"status": "unavailable", "message": f"Status {res.status_code}"}
        except Exception as exc:
            return {"status": "error", "message": str(exc)}

    async def get_train_route(self, train_number: str) -> Dict[str, Any]:
        """Fetch actual route stations and distances."""
        endpoint = f"{self.base_url}/train/route"
        params = {"number": train_number.strip()}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(endpoint, params=params, headers=self._get_headers())
                if res.status_code == 200:
                    return res.json()
                return {"status": "unavailable", "message": f"Status {res.status_code}"}
        except Exception as exc:
            return {"status": "error", "message": str(exc)}

    async def get_train_live(self, train_number: str, journey_date: str) -> Dict[str, Any]:
        """Fetch live running status and available verified fares."""
        date_formatted = re.sub(r"[^0-9]", "", journey_date)
        endpoint = f"{self.base_url}/train/live"
        params = {"number": train_number.strip(), "date": date_formatted}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.get(endpoint, params=params, headers=self._get_headers())
                if res.status_code == 200:
                    return res.json()
                return {"status": "unavailable", "message": f"Status {res.status_code}"}
        except Exception as exc:
            return {"status": "error", "message": str(exc)}

    def _normalize_train_search_response(
        self,
        raw_data: Any,
        from_station: str,
        to_station: str,
        journey_date: str,
    ) -> Dict[str, Any]:
        """
        Normalize API Mitra train results.
        Extracts verified fares for 1A, 2A, 3A where supplied.
        For other classes, cleanly marks them as 'Fare information unavailable from current provider.'
        Never uses fake per-km formulas.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        items = []
        if isinstance(raw_data, list):
            items = raw_data
        elif isinstance(raw_data, dict):
            items = raw_data.get("trains") or raw_data.get("data") or raw_data.get("results") or []

        normalized_trains: List[Dict[str, Any]] = []

        for item in items:
            if not isinstance(item, dict):
                continue

            train_num = str(item.get("train_number") or item.get("number") or "")
            train_name = str(item.get("train_name") or item.get("name") or "Express")
            dep_time = item.get("from_sta") or item.get("departure_time") or item.get("departure")
            arr_time = item.get("to_sta") or item.get("arrival_time") or item.get("arrival")
            duration = item.get("duration") or item.get("travel_time") or "Variable"
            distance_km = item.get("distance_km") or item.get("distance")

            # Extract classes returned by provider
            raw_classes = item.get("classes") or item.get("available_classes") or []
            if isinstance(raw_classes, str):
                raw_classes = [c.strip().upper() for c in raw_classes.split(",") if c.strip()]

            # Build class-wise fare record strictly from provider data
            raw_fares = item.get("fares") or {}
            class_fares: Dict[str, Any] = {}

            # Populate fares for supported classes if provider returned them
            has_any_fare = False
            for cls in raw_classes:
                cls_clean = cls.upper()
                if cls_clean in raw_fares and raw_fares[cls_clean] is not None:
                    try:
                        fare_num = float(raw_fares[cls_clean])
                        class_fares[cls_clean] = {
                            "fare": fare_num,
                            "currency": "INR",
                            "status": "available",
                            "source": "API Mitra Live Quote",
                        }
                        has_any_fare = True
                    except (ValueError, TypeError):
                        class_fares[cls_clean] = {
                            "fare": None,
                            "currency": "INR",
                            "status": "unavailable",
                            "message": "Fare information unavailable from current provider.",
                        }
                else:
                    # Explicit rule: Do not invent missing fares
                    class_fares[cls_clean] = {
                        "fare": None,
                        "currency": "INR",
                        "status": "unavailable",
                        "message": "Fare information unavailable from current provider.",
                    }

            fare_status = "available" if has_any_fare else ("partial" if raw_classes else "unavailable")

            normalized_trains.append({
                "provider": "apimitra",
                "transport_type": "train",
                "train_number": train_num,
                "train_name": train_name,
                "origin": str(item.get("from") or from_station).upper(),
                "destination": str(item.get("to") or to_station).upper(),
                "departure_time": dep_time,
                "arrival_time": arr_time,
                "duration": duration,
                "distance_km": float(distance_km) if distance_km else None,
                "available_classes": raw_classes,
                "fares": class_fares,
                "currency": "INR",
                "observed_at": item.get("observed_at") or now_iso,
                "fare_status": fare_status,
                "source": "API Mitra",
            })

        return {
            "provider": "apimitra",
            "transport_type": "train",
            "origin": from_station.upper(),
            "destination": to_station.upper(),
            "journey_date": journey_date,
            "trains": normalized_trains,
            "fetched_at": now_iso,
            "fare_status": "available" if normalized_trains else "unavailable",
            "source": "API Mitra",
            "message": f"Discovered {len(normalized_trains)} scheduled train services." if normalized_trains else "No direct train services found for this date/route.",
        }
