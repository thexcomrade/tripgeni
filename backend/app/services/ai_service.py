from __future__ import annotations

import json
import logging
import re
import time
from functools import lru_cache
from typing import Any, Optional

from google import genai

from app.core.config import settings

from app.services.weather_service import WeatherService

from app.services.recommendation_service import RecommendationService

from app.services.verified_travel_data import find_verified_entry

from app.services.budget_learning_service import get_budget_rl_service
from app.services.tourism_rag_service import get_tourism_rag_service


logger = logging.getLogger(__name__)

EXPANDED_TRAVEL_DESTINATIONS: dict[str, str] = {
    "abc": "Annapurna Base Camp, Nepal",
    "abc trek": "Annapurna Base Camp Trek, Nepal",
    "abc trekking": "Annapurna Base Camp Trek, Nepal",
    "annapoorna": "Annapurna Base Camp, Nepal",
    "annapoorna base camp": "Annapurna Base Camp, Nepal",
    "annapoorna base camp trek": "Annapurna Base Camp Trek, Nepal",
    "annapurna": "Annapurna Base Camp, Nepal",
    "annapurna base camp": "Annapurna Base Camp, Nepal",
    "annapurna trek": "Annapurna Base Camp Trek, Nepal",
    "ebc": "Everest Base Camp, Nepal",
    "ebc trek": "Everest Base Camp Trek, Nepal",
    "ebc trekking": "Everest Base Camp Trek, Nepal",
    "kgl": "Kashmir Great Lakes Trek, Jammu & Kashmir",
    "kgl trek": "Kashmir Great Lakes Trek, Jammu & Kashmir",
    "kedarkantha": "Kedarkantha Trek, Uttarakhand",
    "kedarkantha trek": "Kedarkantha Trek, Uttarakhand",
    "chadar": "Chadar Frozen River Trek, Zanskar Ladakh",
    "chadar trek": "Chadar Frozen River Trek, Zanskar Ladakh",
    "har ki dun": "Har Ki Dun Trek, Uttarakhand",
    "valley of flowers": "Valley of Flowers, Uttarakhand",
    "hampta pass": "Hampta Pass Trek, Himachal Pradesh",
    "triund": "Triund Trek, Dharamshala",
    "kheerganga": "Kheerganga Trek, Parvati Valley",
    "brahmatal": "Brahmatal Trek, Uttarakhand",
    "sandakphu": "Sandakphu Trek, Darjeeling",
    "kumara parvatha": "Kumara Parvatha Trek, Coorg",
    "kudremukh": "Kudremukh Trek, Chikmagalur",
}


class AIService:
    """
    ==================================================
    TripGenius AI Engine
    ==================================================

    Responsibilities

    ✓ Gemini Initialization
    ✓ Prompt Templates
    ✓ Destination Summary Generator
    ✓ Weather Integration
    ✓ Recommendation Integration
    ✓ Attraction Generator
    ✓ Activity Generator
    ✓ Hotel Generator
    ✓ Restaurant Generator
    ✓ Cuisine Generator
    ✓ Beverage Generator
    ✓ Packing Generator
    ✓ Travel Tips Generator
    ✓ Cost Estimator
    ✓ Sustainability Scoring
    ✓ Carbon Footprint Estimator
    ✓ Eco Recommendation Generator
    ✓ AI Confidence Scoring
    ✓ Day Wise Itinerary Generator
    ✓ Response Validation
    ✓ Retry Logic
    ✓ Offline Fallback
    ✓ Cache Layer
    ✓ JSON Formatter
    """

    MAX_RETRIES = 3

    def __init__(self) -> None:

        self.weather_service = WeatherService()

        self.recommendation_service = RecommendationService()

        # OpenAI ChatGPT client initialization
        self.openai_client = None
        active_key = (
            getattr(settings, "active_openai_key", "")
            or getattr(settings, "OPEN_API_KEY", "")
            or getattr(settings, "OPENAI_API_KEY", "")
            or getattr(settings, "CHATBOT_API_KEY", "")
        )
        if active_key:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=active_key)
                logger.info("OpenAI ChatGPT client initialized successfully.")
            except Exception as e:
                logger.warning("Failed to initialize OpenAI client: %s", e)

        # Gemini client initialization
        self.client = None
        if getattr(settings, "GEMINI_API_KEY", None):
            try:
                self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
            except Exception as e:
                logger.warning("Failed to initialize Gemini client: %s", e)

        self.model_name = "gemini-2.5-flash"
        self.fallback_models = ["gemini-2.5-flash", "gemini-1.5-flash"]

    # ==================================================
    # Prompt Templates
    # ==================================================

    def _build_master_prompt(
        self,
        destination: str,
        duration_days: int,
        budget: float,
        interests: list[str],
        travelers_count: int = 1,
        travel_style: str | None = None,
        transportation_mode: str | None = None,
        preferred_accommodation: str | None = None,
        cost_data: dict[str, float] | None = None,
        origin: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        destinations: list[str] | None = None,
    ) -> str:
        cost = cost_data or self.estimate_trip_cost(
            budget, duration_days, travelers_count, travel_style
        )
        nights = max(1, duration_days - 1)
        travelers = max(1, travelers_count)
        acc_per_night = round(cost["accommodation_cost"] / nights, 2)
        food_per_person_day = round(cost["food_cost"] / (duration_days * travelers), 2)
        food_per_meal = round(food_per_person_day / 3, 2)
        transit_per_day = round(cost["transportation_cost"] / duration_days, 2)
        activities_per_day = round(cost["miscellaneous_cost"] / duration_days, 2)

        interests_str = (
            ", ".join(interests)
            if interests
            else "Sightseeing, Local Culture, Scenic Views"
        )

        # Handle NoStay (day trip) — no hotel budget allocated
        is_day_trip = (preferred_accommodation or "").lower() in ["nostay", "no stay", "no_stay", "day trip", "day_trip"]
        is_bike_rental = (transportation_mode or "").lower() in ["bike", "bike rental"]

        stay_line = (
            "- Preferred Stay: NO OVERNIGHT STAY (Day Trip only — skip hotel recommendations, itinerary is single day)"
            if is_day_trip
            else f"- Preferred Stay: {preferred_accommodation or 'Comfort Hotel'}"
        )
        transit_note = (
            "Bike Rental (Scooter ₹400–700/day or Cruiser ₹900–1,500/day — rates vary by locality)"
            if is_bike_rental
            else (transportation_mode or "Private Car / Taxi")
        )
        origin_line = f"- Starting Point / Departure City: {origin}" if origin else "- Starting Point: Regional Hub"
        circuit_stops = (
            [d.strip() for d in destinations if d.strip()]
            if destinations and len(destinations) > 1
            else [s.strip() for s in re.split(r'[,➔\->]+|\s+to\s+|\s+via\s+', destination) if s.strip()]
        )
        is_multi_city = len(circuit_stops) > 1
        circuit_corridor = " ➔ ".join(circuit_stops) if is_multi_city else destination

        route_line = (
            f"- Route Corridor: {origin} ➔ {circuit_corridor}"
            if origin
            else f"- Destination Circuit: {circuit_corridor}"
        )
        date_line = f"- Travel Dates: {from_date} to {to_date}" if from_date and to_date else ""

        multi_city_instructions = ""
        if is_multi_city:
            multi_city_instructions = f'''
7. MULTI-DESTINATION CIRCUIT PLANNING ({circuit_corridor}):
- The traveler is exploring a multi-city circuit: {", ".join(circuit_stops)}.
- Partition the {duration_days} days sequentially across each destination in order.
- In 'ai_itinerary', every day MUST have an accurate 'destination' field matching that day's active city.
- Dedicate moving days to the scenic transfer leg, luggage drop, and new city highlights.
- In 'attractions', 'recommended_hotels', and 'recommended_restaurants', include authentic recommendations from ACROSS the circuit cities.
'''

        group_instructions = ""
        if travelers_count >= 3 or (travel_style or "").lower() in ["group", "friends", "adventure", "college"]:
            group_instructions = f'''
8. COLLEGE & GROUP TOUR PERSONA ({travelers_count} Travelers):
- Calibrate recommendations for a vibrant friends/college group tour.
- Highlight social viewpoints, group-friendly dining tables, sunset gathering spots, group activities, and budget-conscious shared transit options.
'''

        pacing_instructions = '''
9. DYNAMIC WAYPOINTS & UNBIASED PACING (NEVER FORCE 3-4 STOPS PER DAY):
- Strictly avoid rigid fixed-count templates. Vary waypoints dynamically based on the day's purpose:
  * Full Sightseeing Days: 4 to 6 diverse, engaging waypoints (scenic sunrise/vantage, historic/heritage core, local lunch, artisan quarter / nature walk, sunset viewpoint, night market / dinner).
  * Intercity Moving Days: 3 to 4 stops (scenic transit leg, check-in, orientation landmark, dinner).
  * Arrival & Farewell Days: 2 to 4 unhurried stops tailored for smooth travel logistics.
'''

        return f"""You are Trip Geni AI, an elite travel architect and real-world expense specialist.
Create an inspiring, highly realistic, and accurate real-money travel and expense plan.

DESTINATION & TRAVEL DETAILS:
{origin_line}
- Destination: {destination}
{route_line}
{date_line}
- Duration: {duration_days} Days ({nights} Nights)
- Travelers: {travelers_count} Traveler(s)
- Travel Style: {travel_style or "Leisure"}
- Transit Mode: {transit_note}
- {stay_line}
- Traveler Interests: {interests_str}

REALISTIC EXPENSE ARCHITECTURE (ALL FIGURES IN REAL MARKET INR):
- Total Allocated Budget: ₹{budget:,.0f} for all {travelers_count} traveler(s) over {duration_days} days.
- Daily Total Allowance: ~₹{cost['cost_per_day']:,.0f} / day (~₹{cost['cost_per_person_day']:,.0f} / person / day).
- Stays & Lodging Budget: {"₹0 (Day Trip — No Hotel)" if is_day_trip else f"Total ₹{cost['accommodation_cost']:,.0f} (~₹{acc_per_night:,.0f} / room / night for {nights} nights)"}.
- Food & Dining Budget: Total ₹{cost['food_cost']:,.0f} (~₹{food_per_person_day:,.0f} / person / day, ~₹{food_per_meal:,.0f} per main meal / person).
- Transit & Sightseeing: Total ₹{cost['transportation_cost']:,.0f} (~₹{transit_per_day:,.0f} / day).
- Activities, Passes & Contingency: Total ₹{cost['miscellaneous_cost']:,.0f} (~₹{activities_per_day:,.0f} / day).

STRICT REAL MONEY EXPENSE & ACCURACY RULES:
1. GEOGRAPHICALLY ACCURATE LOCAL ATTRACTIONS: In 'attractions', provide genuine, iconic attractions that are located STRICTLY within {destination}. If destination is Varkala, provide real Varkala spots (e.g. Varkala Cliff, Papanasam Beach, Janardhana Swami Temple, Kappil Beach & Backwaters, Sivagiri Mutt). Strictly list attractions located in the requested destination — NEVER hallucinate or substitute unrelated cities.
2. REALISTIC HOTEL NAMES & GOOGLE RATINGS: {"Since this is a DAY TRIP, set 'recommended_hotels' to an empty array [] — no overnight stay." if is_day_trip else f"In 'recommended_hotels', provide 3 REAL, authentically existing hotels/resorts in {destination} with their authentic Google star rating matching ~₹{acc_per_night:,.0f}/night. Format each string as: 'Hotel Name (★ 4.X Google, ~₹X,XXX/night) — key highlight'."}.
3. REALISTIC DINING SPOTS & GOOGLE RATINGS: In 'recommended_restaurants', provide 3 REAL, authentically existing restaurants/cafes in {destination} with their authentic Google star rating matching ~₹{food_per_meal:,.0f}/meal. Format each string as: 'Restaurant Name (★ 4.X Google, ~₹XXX/person) — signature dish'.
4. REALISTIC EXPENSE TAGS IN ITINERARY: In 'ai_itinerary', every morning, afternoon, and evening plan MUST state explicit, realistic costs or entry fees where money is spent (e.g. 'Morning: Visit local landmark [Entry fee ~₹345/person]. Afternoon: Regional lunch [~₹250/meal]. Evening: Sunset beach stroll [Free]'). If an activity has no fee, label it '[Free entry]'.
5. PROPER CASING & FINANCIAL INTEGRITY: Always use Title Case for destination and all named entities. Daily pacing must stay within total budget ₹{budget:,.0f}.
6. TRANSIT TIME VS EXPLORATION TIME: Clearly distinguish travel days from destination exploration days. For long journeys (e.g. multi-day train, overnight travel, or long road trips), Day 1 should account for departure and arrival logistics without impossible morning sightseeing, and Day {duration_days} should account for return travel. Schedule sightseeing strictly during actual on-ground hours.
{multi_city_instructions}
{group_instructions}
{pacing_instructions}

Return valid JSON ONLY matching this exact schema:
{{
  "trip_title": "{destination} Travel Experience",
  "destination_summary": "Detailed, evocative 2-3 sentence overview of {destination}",
  "ai_itinerary": [
    {{
      "day": 1,
      "title": "Arrival & Initial Highlights",
      "destination": "{destination}",
      "morning": "Detailed morning plan, check-in, [Est. cost in brackets]",
      "afternoon": "Detailed afternoon activity, lunch spot [Est. cost in brackets]",
      "evening": "Detailed evening activity, dinner spot [Est. cost in brackets]",
      "activities": ["Activity 1", "Activity 2"]
    }}
  ],
  "attractions": ["Attraction 1", "Attraction 2", "Attraction 3", "Attraction 4"],
  "activities": ["Activity 1", "Activity 2", "Activity 3"],
  "recommended_hotels": ["Hotel 1 (★ 4.5 Google, ~₹X,XXX/night) — highlight", "Hotel 2 (★ 4.4 Google, ~₹X,XXX/night) — highlight", "Hotel 3 (★ 4.3 Google, ~₹X,XXX/night) — highlight"],
  "recommended_restaurants": ["Restaurant 1 (★ 4.5 Google, ~₹XXX/person) — dish", "Restaurant 2 (★ 4.4 Google, ~₹XXX/person) — dish", "Restaurant 3 (★ 4.3 Google, ~₹XXX/person) — dish"],
  "local_cuisines": ["Dish 1", "Dish 2", "Dish 3"],
  "beverages_to_try": ["Beverage 1", "Beverage 2"],
  "packing_checklist": ["Item 1", "Item 2", "Item 3", "Item 4"],
  "travel_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "eco_friendly_recommendations": ["Eco tip 1", "Eco tip 2"]
}}"""

    def _build_itinerary_prompt(
        self, destination: str, duration_days: int, interests: list[str]
    ) -> str:

        return f"""
Create a detailed day-wise itinerary.

Destination:
{destination}

Duration:
{duration_days}

Interests:
{", ".join(interests)}

Return JSON.
"""

    def _build_hotel_prompt(self, destination: str, budget: float) -> str:

        return f"""
Recommend hotels for:

Destination:
{destination}

Budget:
₹{budget}

Return list only.
"""

    def _build_food_prompt(self, destination: str) -> str:

        return f"""
Recommend local cuisines,
restaurants and beverages.

Destination:
{destination}

Return JSON.
"""

    def _get_openai_client(self):
        if self.openai_client:
            return self.openai_client
        active_key = (
            getattr(settings, "active_openai_key", "")
            or getattr(settings, "OPEN_API_KEY", "")
            or getattr(settings, "OPENAI_API_KEY", "")
            or getattr(settings, "CHATBOT_API_KEY", "")
        )
        if active_key:
            try:
                import openai
                self.openai_client = openai.OpenAI(api_key=active_key)
                return self.openai_client
            except Exception as e:
                logger.warning("Failed to initialize OpenAI client: %s", e)
        return None

    # ==================================================
    # Gemini Communication Layer
    # ==================================================

    def _generate_content(self, prompt: str) -> str:
        last_error = None

        # Priority 1: OpenAI ChatGPT API (gpt-4o / gpt-4o-mini)
        client = self._get_openai_client()
        if client:
            for attempt in range(self.MAX_RETRIES):
                try:
                    response = client.chat.completions.create(
                        model=getattr(settings, "OPENAI_MODEL", "gpt-4o"),
                        messages=[
                            {
                                "role": "system",
                                "content": (
                                    "You are Trip Geni AI, an elite travel architect and real-world expense specialist. "
                                    "Always return valid, complete JSON strictly adhering to the requested schema."
                                ),
                            },
                            {"role": "user", "content": prompt},
                        ],
                        response_format={"type": "json_object"},
                        temperature=0.7,
                    )
                    if response.choices and response.choices[0].message.content:
                        logger.info("Successfully generated itinerary via OpenAI ChatGPT (%s)", getattr(settings, "OPENAI_MODEL", "gpt-4o"))
                        return response.choices[0].message.content
                except Exception as error:
                    last_error = error
                    logger.warning("OpenAI attempt %s failed: %s", attempt + 1, error)
                    time.sleep(1)

        # Priority 2: Google Gemini API
        if self.client:
            for attempt in range(self.MAX_RETRIES):
                try:
                    response = self.client.models.generate_content(
                        model=self.model_name, contents=prompt
                    )

                    if response and response.text:
                        logger.info("Successfully generated itinerary via Gemini (%s)", self.model_name)
                        return response.text

                except Exception as error:
                    last_error = error
                    err_str = str(error)
                    logger.warning("Gemini attempt %s failed: %s", attempt + 1, err_str)

                    if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str or "quota" in err_str.lower():
                        logger.warning("Gemini quota exhausted (429). Fast-failing to deterministic fallback.")
                        break

                    time.sleep(1)

        raise RuntimeError(f"Live AI generation failed across available providers: {last_error}")

    # ==================================================
    # JSON Parsing Utilities
    # ==================================================

    def _safe_json_parse(self, content: str) -> dict[str, Any]:
        """
        Robustly extracts JSON dictionary from raw model text output,
        handling direct JSON, markdown code fences, and embedded substrings.
        """
        if not content or not isinstance(content, str):
            return {}

        raw = content.strip()

        # Strategy 1: Direct JSON parsing
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

        # Strategy 2: Markdown code fence ```json ... ``` or ``` ... ```
        fence_pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
        matches = re.findall(fence_pattern, raw, re.IGNORECASE)
        for candidate in matches:
            try:
                parsed = json.loads(candidate.strip())
                if isinstance(parsed, dict):
                    return parsed
            except Exception:
                continue

        # Strategy 3: Substring between first '{' and last '}'
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            snippet = raw[start : end + 1]
            try:
                parsed = json.loads(snippet)
                if isinstance(parsed, dict):
                    return parsed
            except Exception:
                pass

        return {}

    # ==================================================
    # Cache Layer
    # ==================================================

    @lru_cache(maxsize=100)
    def _cached_destination_profile(self, destination: str) -> dict[str, Any] | None:

        return self.recommendation_service.generate_destination_profile(destination)

    # ==================================================
    # Weather Integration
    # ==================================================

    def get_weather_context(self, destination: str) -> dict[str, Any]:
        dest_clean = destination.strip()
        q = dest_clean.lower()

        # Gateway city resolution for remote treks where OpenWeather lacks station IDs
        weather_city = dest_clean
        # Resolve primary hub city if multi-city corridor string
        if any(sep in dest_clean for sep in ["➔", "->", ",", " to ", " via "]):
            parts = [s.strip() for s in re.split(r'[,➔\->]+|\s+to\s+|\s+via\s+', dest_clean) if s.strip()]
            if parts:
                weather_city = parts[0]
        if any(a in q for a in ["annapurna", "annapoorna", "abc"]):
            weather_city = "Pokhara"
        elif any(e in q for e in ["everest", "ebc"]):
            weather_city = "Kathmandu"
        elif any(k in q for k in ["kedarkantha", "har ki dun", "valley of flowers", "brahmatal"]):
            weather_city = "Dehradun"
        elif "chadar" in q:
            weather_city = "Leh"
        elif "hampta" in q:
            weather_city = "Manali"

        try:
            data = self.weather_service.get_current_weather(weather_city)
            if data and data.get("temperature") is not None and data.get("temperature") > 0:
                data["city"] = dest_clean
                return data
        except Exception as error:
            logger.warning("Weather fetch failed for %s (query=%s): %s", dest_clean, weather_city, str(error))

        # Intelligent climate synthesis fallback for regional/hill/beach/trek locations
        if any(t in q for t in ["annapurna", "annapoorna", "abc", "everest", "ebc", "chadar", "trek", "base camp"]):
            temp = 10.5
            cond = "Crisp Alpine Air"
            desc = f"Clear high-altitude mountain atmosphere with crystalline glacier vistas across {dest_clean}"
            hum = 52
            wind = 12.0
            rec = "High-altitude Himalayan climate. Layer with thermal innerwear, down jacket, sturdy waterproof boots, and UV sunglasses."
            packing = ["Thermal innerwear & fleece", "Down windproof jacket", "Sturdy trekking boots", "Woolen beanie & gloves", "UV sunglasses & high-SPF sunscreen", "Water purification tablets", "Trekking poles"]
        elif any(h in q for h in ["chickmanglore", "chikmagalur", "chikkamagaluru", "munnar", "ooty", "kodaikanal", "coorg", "kodagu", "wayanad", "manali", "shimla", "darjeeling", "gangtok"]):
            temp = 20.0
            cond = "Misty & Pleasant"
            desc = f"Cool highland breeze across green hills and plantations in {dest_clean}"
            hum = 75
            wind = 8.5
            rec = "Cool and pleasant mountain weather. Carry light woolens, walking shoes, and a rain jacket."
            packing = ["Light jacket/sweater", "Comfortable walking shoes", "Umbrella/rain gear", "Camera"]
        elif any(c in q for c in ["varkala", "goa", "kochi", "cochin", "alleppey", "alappuzha", "kovalam", "kanyakumari", "pondicherry", "puducherry", "puri"]):
            temp = 29.5
            cond = "Tropical Coastal"
            desc = f"Warm sea breeze with pleasant sunny intervals in {dest_clean}"
            hum = 76
            wind = 14.0
            rec = "Tropical coastal weather. Ideal for sightseeing, beach walks, and sunset photography."
            packing = ["Light cotton clothing", "Sunscreen & sunglasses", "Comfortable sandals", "Swimwear"]
        else:
            temp = 26.5
            cond = "Pleasant & Clear"
            desc = f"Comfortable travel climate across {dest_clean}"
            hum = 65
            wind = 11.0
            rec = f"Favorable conditions for exploring {dest_clean} landmarks and outdoor activities."
            packing = ["Comfortable clothing", "Walking shoes", "Power bank", "Reusable water bottle"]

        return {
            "city": dest_clean,
            "temperature": temp,
            "feels_like": temp + 1.5,
            "condition": cond,
            "description": desc,
            "humidity": hum,
            "wind_speed": wind,
            "travel_recommendation": rec,
            "packing_suggestions": packing,
        }

    # ==================================================
    # Recommendation Integration
    # ==================================================

    def get_recommendation_context(
        self, destination: str, interests: list[str], budget: float
    ) -> dict[str, Any]:

        recommendations = self.recommendation_service.recommend_by_interest(interests)

        budget_plan = self.recommendation_service.recommend_by_budget(budget)

        destination_profile = self._cached_destination_profile(destination)

        return {
            "destination_profile": destination_profile,
            "recommendations": recommendations,
            "budget_plan": budget_plan,
        }

    # ==================================================
    # Destination Summary Generator
    # ==================================================

    def generate_destination_summary(self, destination: str) -> str:

        profile = self._cached_destination_profile(destination)

        if profile:
            return profile.get("description", "")

        return (
            f"{destination} is a wonderful "
            f"travel destination offering "
            f"culture, attractions and "
            f"memorable experiences."
        )

    # ==================================================
    # Attraction Generator
    # ==================================================

    def generate_attractions(self, destination: str, interests: list[str]) -> list[str]:
        # 1. First check our verified high-fidelity destination directory
        verified = find_verified_entry(destination)
        if verified and verified.get("attractions"):
            return verified["attractions"]

        q_clean = destination.lower().strip()
        is_varanasi_dest = any(k in q_clean for k in ["varanasi", "kashi", "banaras", "benares"])

        # 2. Search destination specifically within the tourism dataset
        dest_matches = self.recommendation_service.search_destination(destination)
        attractions: list[str] = []

        for item in dest_matches:
            place_name = item.get("place_name", "")
            district = item.get("district", "")
            state = item.get("state", "")
            desc = item.get("description", "") or item.get("activities", "")

            # Strict Guard: Never allow Varanasi / Kashi items unless destination is specifically Varanasi
            item_text = f"{place_name} {district} {state} {desc}".lower()
            if not is_varanasi_dest and any(v in item_text for v in ["varanasi", "kashi vishwanath", "assi ghat", "dashashwamedh", "sarnath", "ganga aarti"]):
                continue

            if place_name:
                dist_clean = district.lower()
                state_clean = state.lower()
                p_clean = place_name.lower()
                if (
                    q_clean in p_clean
                    or q_clean in dist_clean
                    or dist_clean in q_clean
                    or q_clean in state_clean
                    or state_clean in q_clean
                ):
                    loc_label = district if district and district.lower() != "regional destination" else (state or destination.title())
                    formatted = f"{place_name} ({loc_label}) — {desc}" if desc else f"{place_name} ({loc_label})"
                    if not any(a.startswith(place_name) for a in attractions):
                        attractions.append(formatted)

        if len(attractions) >= 2:
            return attractions[:10]

        # 3. Fallback: clean Title-cased attractions scoped strictly to the chosen destination
        dest_title = destination.strip().title()
        return [
            f"{dest_title} Historic Heritage Old Town Walk",
            f"{dest_title} Panoramic Sunset Viewpoint",
            f"{dest_title} Central Market & Cultural Promenade",
            f"{dest_title} Nature Trail & Botanical Enclave",
            f"{dest_title} Scenic Waterfront & Promenade",
            f"{dest_title} Regional Cultural Centre & Artisan Hub",
        ]

    # ==================================================
    # Activity Generator
    # ==================================================

    def generate_activities(self, interests: list[str]) -> list[str]:

        activity_map = {
            "nature": ["Nature Walk", "Forest Exploration", "Wildlife Observation"],
            "trekking": ["Mountain Trekking", "Hill Hiking", "Adventure Trails"],
            "photography": [
                "Sunrise Photography",
                "Landscape Photography",
                "Street Photography",
            ],
            "food": ["Food Tour", "Local Cuisine Experience"],
            "culture": ["Temple Visits", "Museum Tours", "Cultural Shows"],
            "adventure": ["Zipline", "Camping", "Rock Climbing"],
        }

        activities: list[str] = []

        for interest in interests:
            matched = activity_map.get(interest.lower(), [])

            activities.extend(matched)

        if not activities:
            activities = ["Sightseeing", "Local Exploration", "Photography"]

        return list(dict.fromkeys(activities))

    # ==================================================
    # Hotel Generator
    # ==================================================

    def generate_hotels(
        self, destination: str, budget: float, duration_days: int = 3
    ) -> list[str]:
        verified = find_verified_entry(destination)
        if verified and verified.get("hotels"):
            return verified["hotels"]

        nights = max(1, duration_days - 1)
        acc_per_night = max(500, round((budget * 0.40) / nights))
        dest_title = destination.strip().title()

        if budget <= 15000:
            return [
                f"{dest_title} Travelers & Backpackers Lodge (★ 4.3 Google, ~₹{acc_per_night:,.0f}/night) — Clean shared/private dorms, free high-speed WiFi, central transit access",
                f"{dest_title} Heritage Eco Homestay (★ 4.6 Google, ~₹{round(acc_per_night * 0.9):,.0f}/night) — Warm local hospitality & authentic home-cooked breakfast",
                f"{dest_title} Green Residency Inn (★ 4.2 Google, ~₹{round(acc_per_night * 1.1):,.0f}/night) — Peaceful neighborhood stay near landmark sightseeing spots",
            ]

        if budget <= 40000:
            return [
                f"{dest_title} Nature View Boutique Resort (★ 4.5 Google, ~₹{acc_per_night:,.0f}/night) — Scenic balcony vistas, organic breakfast & garden pool",
                f"{dest_title} Comfort Grand Residency (★ 4.4 Google, ~₹{round(acc_per_night * 0.95):,.0f}/night) — Modern luxury suites with concierge & travel desk",
                f"{dest_title} Valley View Heritage Retreat (★ 4.6 Google, ~₹{round(acc_per_night * 1.05):,.0f}/night) — Tranquil landscaped grounds & wellness spa",
            ]

        if budget <= 80000:
            return [
                f"{dest_title} Plantation Luxury Resort & Spa (★ 4.7 Google, ~₹{acc_per_night:,.0f}/night) — Infinity pool, private cottage & guided nature walks",
                f"{dest_title} Premium Grand Heritage Hotel (★ 4.6 Google, ~₹{round(acc_per_night * 0.92):,.0f}/night) — Royal architecture, fine dining & Ayurvedic spa",
                f"{dest_title} Mountain Horizon Retreat (★ 4.8 Google, ~₹{round(acc_per_night * 1.08):,.0f}/night) — Panoramic suites with personal butler & sunset lounge",
            ]

        return [
            f"{dest_title} 5-Star Luxury Palace & Spa (★ 4.9 Google, ~₹{acc_per_night:,.0f}/night) — Private heated pool, butler service & world-class gastronomy",
            f"{dest_title} Exclusive Private Villa Sanctuary (★ 4.8 Google, ~₹{round(acc_per_night * 0.95):,.0f}/night) — Private chef, infinity edge deck & bespoke tours",
            f"{dest_title} Royal Heritage Club & Resort (★ 4.7 Google, ~₹{round(acc_per_night * 1.1):,.0f}/night) — Presidential suites & experiential private cruises",
        ]

    # ==================================================
    # Restaurant Generator
    # ==================================================

    def generate_restaurants(
        self,
        destination: str,
        budget: float = 25000.0,
        duration_days: int = 3,
        travelers_count: int = 1,
    ) -> list[str]:
        verified = find_verified_entry(destination)
        if verified and verified.get("restaurants"):
            return verified["restaurants"]

        days = max(1, duration_days)
        travelers = max(1, travelers_count)
        meal_cost = max(120, round((budget * 0.25) / (days * travelers * 3)))
        dest_title = destination.strip().title()

        return [
            f"{dest_title} Traditional Spice Kitchen (★ 4.5 Google, ~₹{meal_cost:,.0f}/person) — Authentic regional delicacies & wholesome thalis",
            f"{dest_title} Harvest Garden Bistro (★ 4.4 Google, ~₹{round(meal_cost * 1.25):,.0f}/person) — Farm-to-table organic dining & artisan local fare",
            f"{dest_title} Heritage Street Cafe (★ 4.6 Google, ~₹{round(meal_cost * 0.85):,.0f}/person) — Hand-crafted snacks, specialty brew & regional breakfast",
            f"{dest_title} Ocean & Valley View Fine Dining (★ 4.5 Google, ~₹{round(meal_cost * 1.5):,.0f}/person) — Candlelit scenic views & chef's tasting menu",
            f"{dest_title} Travelers Comfort Dhaba (★ 4.3 Google, ~₹{round(meal_cost * 0.75):,.0f}/person) — Comfort regional recipes & freshly baked breads",
        ]

    # ==================================================
    # Cuisine Generator
    # ==================================================

    def generate_local_cuisines(self, destination: str) -> list[str]:
        verified = find_verified_entry(destination)
        if verified and verified.get("cuisines"):
            return verified["cuisines"]

        destination_lower = destination.lower()

        if "munnar" in destination_lower or "kerala" in destination_lower:
            return [
                "Appam with Vegetable/Chicken Stew",
                "Kerala Puttu with Kadala Curry",
                "Authentic Kerala Sadya on Plantain Leaf",
                "Malabar Dum Biryani",
                "Karimeen Pollichathu",
            ]

        if "coorg" in destination_lower or "kodagu" in destination_lower:
            return ["Pandi Curry", "Kadambuttu", "Akki Roti", "Bamboo Shoot Curry"]

        dest_title = destination.strip().title()
        return [
            f"{dest_title} Signature Regional Thali",
            f"{dest_title} Traditional Clay-Pot Curry",
            f"{dest_title} Hand-Crafted Street Specialties",
            "Artisanal Fresh Breads & Sweets",
        ]

    # ==================================================
    # Beverage Generator
    # ==================================================

    def generate_beverages(self, destination: str) -> list[str]:
        verified = find_verified_entry(destination)
        if verified and verified.get("beverages"):
            return verified["beverages"]

        destination_lower = destination.lower()

        if "munnar" in destination_lower:
            return ["Fresh Cardamom Tea", "Highland Green Tea", "Lemon Ginger Tea", "Hot Masala Chai"]

        dest_title = destination.strip().title()
        return [f"Fresh {dest_title} Spiced Tea", "Cold Pressed Fresh Fruit Juice", "Traditional Herbal Infusion"]


    # ==================================================
    # Packing Checklist Generator
    # ==================================================

    def generate_packing_checklist(self, destination: str) -> list[str]:

        weather = self.get_weather_context(destination)

        checklist = [
            "Government ID",
            "Mobile Charger",
            "Power Bank",
            "Water Bottle",
            "Personal Medicines",
            "Cash",
            "Travel Documents",
        ]

        checklist.extend(weather.get("packing_suggestions", []))

        return list(dict.fromkeys(checklist))

    # ==================================================
    # Travel Tips Generator
    # ==================================================

    def generate_travel_tips(self, destination: str) -> list[str]:

        return [
            "Book accommodations early.",
            "Carry valid identification.",
            "Respect local culture.",
            "Keep emergency contacts handy.",
            "Use reusable water bottles.",
            "Avoid littering.",
            "Check weather forecasts daily.",
            "Keep digital copies of documents.",
        ]

    # ==================================================
    # Cost Estimator
    # ==================================================

    def estimate_trip_cost(
        self,
        budget: float,
        duration_days: int,
        travelers_count: int = 1,
        travel_style: str | None = None,
        transportation_mode: str | None = None,
        preferred_accommodation: str | None = None,
        destination: str = "",
        db: Any = None,
    ) -> dict[str, Any]:
        """
        Calibrate realistic, human-scale financial breakdown for regional and domestic travel.
        Integrates Reinforcement Learning empirical weights and rental vehicle pricing.
        """
        duration = max(1, duration_days)
        travelers = max(1, travelers_count)
        total_budget = round(float(budget), 2)

        rl_service = get_budget_rl_service()
        factors = rl_service.get_calibrated_factors(
            db=db,
            destination=destination,
            travel_style=travel_style,
            transportation_mode=transportation_mode,
            duration_days=duration,
            travelers_count=travelers,
        )

        pcts = factors["percentages"]
        acc_pct = pcts["accommodation"]
        food_pct = pcts["food"]
        trans_pct = pcts["transportation"]

        is_day_trip = (preferred_accommodation or "").lower() in [
            "nostay", "no stay", "no_stay", "day trip", "day_trip"
        ]
        if is_day_trip:
            accommodation_cost = 0.0
            food_cost = round(total_budget * 0.40, 2)
            transportation_cost = round(total_budget * 0.35, 2)
            miscellaneous_cost = round(total_budget - (food_cost + transportation_cost), 2)
        else:
            accommodation_cost = round(total_budget * acc_pct, 2)
            food_cost = round(total_budget * food_pct, 2)
            transportation_cost = round(total_budget * trans_pct, 2)
            miscellaneous_cost = round(
                total_budget - (accommodation_cost + food_cost + transportation_cost), 2
            )

        cost_per_day = round(total_budget / duration, 2)
        cost_per_person_day = round(total_budget / (duration * travelers), 2)

        return {
            "estimated_trip_cost": total_budget,
            "accommodation_cost": accommodation_cost,
            "food_cost": food_cost,
            "transportation_cost": transportation_cost,
            "miscellaneous_cost": miscellaneous_cost,
            "cost_per_day": cost_per_day,
            "cost_per_person_day": cost_per_person_day,
            "destination_multiplier": factors.get("destination_multiplier", 1.0),
            "learned_samples": factors.get("sample_count", 0),
            "rental_details": factors.get("rental_details"),
        }

    # ==================================================
    # Sustainability Score Engine
    # ==================================================

    def calculate_sustainability_score(
        self, interests: list[str], transportation_mode: str | None = None
    ) -> int:

        score = 50

        eco_interests = {"nature", "eco", "wildlife", "trekking", "photography"}

        for interest in interests:
            if interest.lower() in eco_interests:
                score += 5

        if transportation_mode:
            transport = transportation_mode.lower()

            if transport in ["walking", "cycling"]:
                score += 20

            elif transport in ["train", "bus"]:
                score += 10

            elif transport in ["car"]:
                score += 5

            elif transport in ["flight", "air"]:
                score -= 10

        return max(0, min(score, 100))

    # ==================================================
    # Carbon Footprint Estimator
    # ==================================================

    def estimate_carbon_footprint(
        self, duration_days: int, transportation_mode: str | None
    ) -> float:

        transport_factor = {
            "walking": 1.0,
            "cycling": 1.5,
            "bus": 3.0,
            "train": 4.0,
            "car": 8.0,
            "flight": 25.0,
            "air": 25.0,
        }

        factor = transport_factor.get((transportation_mode or "car").lower(), 8.0)

        footprint = factor * duration_days

        return round(footprint, 2)

    # ==================================================
    # Eco Friendly Recommendation Generator
    # ==================================================

    def generate_eco_recommendations(self) -> list[str]:

        return [
            "Carry a reusable water bottle.",
            "Avoid single-use plastics.",
            "Use public transportation whenever possible.",
            "Support local businesses and guides.",
            "Follow Leave No Trace principles.",
            "Respect wildlife and natural habitats.",
            "Use eco-friendly accommodations.",
            "Reduce food waste during travel.",
        ]

    # ==================================================
    # AI Confidence Calculator
    # ==================================================

    def calculate_ai_confidence(
        self,
        weather_available: bool,
        recommendations_count: int,
        destination_profile_found: bool,
    ) -> float:

        confidence = 60.0

        if weather_available:
            confidence += 15.0

        if recommendations_count >= 5:
            confidence += 15.0

        elif recommendations_count >= 2:
            confidence += 10.0

        if destination_profile_found:
            confidence += 10.0

        return round(min(confidence, 100.0), 2)

    # ==================================================
    # Day Wise Itinerary Generator
    # ==================================================

    def generate_day_wise_itinerary(
        self,
        destination: str,
        duration_days: int,
        interests: list[str],
        budget: float = 25000.0,
        travelers_count: int = 1,
        destinations: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        dest_clean = destination.strip()

        # Check for multi-city tour corridor
        circuit_stops = (
            [d.strip() for d in destinations if d.strip()]
            if destinations and len(destinations) > 1
            else [s.strip() for s in re.split(r'[,➔\->]+|\s+to\s+|\s+via\s+', dest_clean) if s.strip()]
        )

        days = max(1, duration_days)
        travelers = max(1, travelers_count)
        meal_cost = max(120, round((budget * 0.25) / (days * travelers * 3)))
        meal_bfast = max(80, round(meal_cost * 0.65))
        transit_cost = max(150, round((budget * 0.20) / days))
        activity_cost = max(100, round((budget * 0.15) / days))

        if len(circuit_stops) > 1:
            # Multi-city day allocation
            allocations = []
            base = days // len(circuit_stops)
            rem = days % len(circuit_stops)
            for i, stop in enumerate(circuit_stops):
                count = base + (1 if i < rem else 0)
                allocations.append({"destination": stop, "days": max(1, count)})

            # Expand day-to-city map
            day_to_city = []
            for alloc in allocations:
                for _ in range(alloc["days"]):
                    day_to_city.append(alloc["destination"])
            while len(day_to_city) < days:
                day_to_city.append(circuit_stops[-1])
            day_to_city = day_to_city[:days]

            # Cache attractions per city
            city_attractions = {}
            for stop in circuit_stops:
                raw_city = self.generate_attractions(stop, interests)
                clean_city_acts = []
                for raw in raw_city:
                    name = raw.split(" — ")[0].strip() if " — " in raw else raw.strip()
                    name = re.sub(r'\s*\(.*?\)$', '', name).strip()
                    if name:
                        clean_city_acts.append(name)
                if not clean_city_acts:
                    clean_city_acts = [
                        f"{stop} Central Panorama",
                        f"{stop} Cultural Enclave",
                        f"{stop} Botanical Valley",
                        f"{stop} Artisan Bazaar",
                        f"{stop} Sunset Promontory",
                    ]
                city_attractions[stop] = clean_city_acts

            itinerary = []
            for day_idx in range(days):
                day_num = day_idx + 1
                curr_city = day_to_city[day_idx]
                prev_city = day_to_city[day_idx - 1] if day_idx > 0 else None
                is_moving_day = prev_city is not None and prev_city != curr_city
                acts_pool = city_attractions.get(curr_city, [f"{curr_city} Highlights"])

                day_plan = {
                    "day": day_num,
                    "destination": curr_city,
                }

                if day_num == 1:
                    day_plan["title"] = f"Day 1: Arrival in {curr_city} & Tour Commencement"
                    day_plan["activities"] = acts_pool[:4]
                    day_plan["morning"] = (
                        f"8:30 AM • Arrival in {curr_city}, check-in and luggage drop [Transit ~₹{transit_cost:,.0f}]. "
                        f"Morning orientation stroll around {acts_pool[0]} taking in fresh mountain/regional air."
                    )
                    day_plan["afternoon"] = (
                        f"1:00 PM • Traditional regional lunch (~₹{meal_cost:,.0f}/person). "
                        f"Afternoon guided exploration at {acts_pool[1] if len(acts_pool) > 1 else curr_city} [Est. entry ~₹{activity_cost:,.0f}]."
                    )
                    day_plan["evening"] = (
                        f"5:30 PM • Sunset vista at {acts_pool[2] if len(acts_pool) > 2 else curr_city}, "
                        f"followed by tour welcome dinner and local sweet tasting (~₹{meal_cost:,.0f}/person)."
                    )

                elif is_moving_day:
                    day_plan["title"] = f"Day {day_num}: Scenic Transit from {prev_city} ➔ {curr_city}"
                    day_plan["activities"] = [
                        f"Scenic Transit ({prev_city} to {curr_city})",
                        acts_pool[0],
                        acts_pool[1] if len(acts_pool) > 1 else f"{curr_city} Town Square",
                        f"{curr_city} Evening Panorama",
                    ]
                    day_plan["morning"] = (
                        f"8:00 AM • Scenic transit departure from {prev_city} heading towards {curr_city} via scenic viewpoints and highway photo stops [Transit ~₹{transit_cost:,.0f}]."
                    )
                    day_plan["afternoon"] = (
                        f"1:15 PM • Arrival in {curr_city}, check-in, freshen up, and regional lunch (~₹{meal_cost:,.0f}/person). "
                        f"Afternoon orientation visit to {acts_pool[0]} [Est. entry ~₹{activity_cost:,.0f}]."
                    )
                    day_plan["evening"] = (
                        f"5:30 PM • Golden hour sunset walk at {acts_pool[1] if len(acts_pool) > 1 else curr_city}. "
                        f"Evening culinary exploration and dinner tasting signature local delicacies (~₹{meal_cost:,.0f}/person)."
                    )

                elif day_num == days:
                    day_plan["title"] = f"Day {day_num}: Final {curr_city} Horizons & Tour Conclusion"
                    day_plan["activities"] = acts_pool[:3] + ["Onward Departure Transfer"]
                    day_plan["morning"] = (
                        f"8:00 AM • Dawn breakfast (~₹{meal_bfast:,.0f}/person) and morning visit to {acts_pool[0]} to capture final panoramic group photos [Entry ~₹{activity_cost:,.0f}]."
                    )
                    day_plan["afternoon"] = (
                        f"12:30 PM • Farewell lunch and last-minute artisan souvenir and regional craft shopping at {acts_pool[1] if len(acts_pool) > 1 else curr_city}."
                    )
                    day_plan["evening"] = (
                        f"4:30 PM • Check-out and onward departure transfer from {curr_city} with incredible memories [Transit ~₹{transit_cost:,.0f}]."
                    )

                else:
                    # Core exploration day: 5 to 6 varied stops!
                    day_plan["title"] = f"Day {day_num}: In-Depth {curr_city} Expedition & Cultural Sights"
                    offset = (day_num * 2) % max(1, len(acts_pool))
                    selected_acts = [acts_pool[(offset + k) % len(acts_pool)] for k in range(min(5, len(acts_pool)))]
                    if len(selected_acts) < 4:
                        selected_acts.extend([f"{curr_city} Artisan Street", f"{curr_city} Sunset Point"])
                    day_plan["activities"] = selected_acts

                    day_plan["morning"] = (
                        f"7:45 AM • Early morning exploration of {selected_acts[0]} before peak tourist arrival [Entry ~₹{activity_cost:,.0f}]. "
                        f"Proceed along the scenic corridor to {selected_acts[1]}."
                    )
                    day_plan["afternoon"] = (
                        f"1:15 PM • Authentic specialty lunch (~₹{meal_cost:,.0f}/person). Afternoon cultural discovery at {selected_acts[2]}, "
                        f"marveling at heritage architecture and artisan workshops."
                    )
                    day_plan["evening"] = (
                        f"5:15 PM • Sunset vantage point at {selected_acts[3] if len(selected_acts) > 3 else selected_acts[-1]}. "
                        f"Conclude with night market walk and group dinner banquet (~₹{meal_cost:,.0f}/person)."
                    )

                itinerary.append(day_plan)

            return itinerary

        raw_attractions = self.generate_attractions(dest_clean, interests)

        # Parse attractions into clean dicts of name, location, highlight
        parsed_attractions = []
        for raw in raw_attractions:
            name = raw
            loc = f"{dest_clean} Region"
            highlight = ""
            if " — " in raw:
                parts = raw.split(" — ", 1)
                name_part = parts[0].strip()
                highlight = parts[1].strip()
                m = re.match(r"^(.*?)\s*\((.*?)\)$", name_part)
                if m:
                    name = m.group(1).strip()
                    loc = m.group(2).strip()
                else:
                    name = name_part
            else:
                m = re.match(r"^(.*?)\s*\((.*?)\)$", raw)
                if m:
                    name = m.group(1).strip()
                    loc = m.group(2).strip()
                else:
                    name = raw.strip()
            parsed_attractions.append({"name": name, "location": loc, "highlight": highlight})

        if not parsed_attractions:
            parsed_attractions = [
                {"name": f"{dest_clean} Historic Core", "location": f"{dest_clean} Center", "highlight": "Heritage sights"},
                {"name": f"{dest_clean} Hill Viewpoint", "location": f"5 km from {dest_clean}", "highlight": "Panoramic vistas"},
                {"name": f"{dest_clean} Botanical Enclave", "location": f"2 km from {dest_clean}", "highlight": "Lush nature & flora"},
                {"name": f"{dest_clean} Local Crafts & Spice Market", "location": f"{dest_clean} Town", "highlight": "Artisan shopping"},
            ]

        itinerary = []
        days = max(1, duration_days)
        travelers = max(1, travelers_count)
        meal_cost = max(120, round((budget * 0.25) / (days * travelers * 3)))
        meal_bfast = max(80, round(meal_cost * 0.65))
        transit_cost = max(150, round((budget * 0.20) / days))
        activity_cost = max(100, round((budget * 0.15) / days))

        attr_idx = 0
        total_attrs = len(parsed_attractions)

        for day in range(1, duration_days + 1):
            day_plan = {
                "day": day,
                "title": f"Day {day}",
                "destination": dest_clean,
                "morning": "",
                "afternoon": "",
                "evening": "",
            }

            stop_count = 4 if day == 1 or day == duration_days else (5 if day % 2 == 0 else 6)
            day_acts = []
            for _ in range(stop_count):
                day_acts.append(parsed_attractions[attr_idx % total_attrs])
                attr_idx += 1

            day_plan["activities"] = [a["name"] for a in day_acts]

            if day == 1:
                day_plan["title"] = f"Day 1: Arrival, {day_acts[0]['name']} & Cultural Welcome"
                day_plan["morning"] = (
                    f"8:30 AM • Arrival in {dest_clean}, hotel check-in and luggage drop [Transit ~₹{transit_cost:,.0f}]. "
                    f"Morning orientation walk at {day_acts[0]['name']} ({day_acts[0]['location']}) [Est. entry ~₹{activity_cost:,.0f}]."
                )
                day_plan["afternoon"] = (
                    f"1:00 PM • Traditional regional lunch (~₹{meal_cost:,.0f}/person), followed by an afternoon tour of "
                    f"{day_acts[1]['name']} ({day_acts[1]['location']}) exploring architectural highlights and local craft heritage."
                )
                day_plan["evening"] = (
                    f"5:30 PM • Sunset viewpoint at {day_acts[2]['name']} followed by an evening stroll through {day_acts[3]['name'] if len(day_acts) > 3 else 'the historic bazaars'}; "
                    f"dinner featuring authentic regional dishes (~₹{meal_cost:,.0f}/person)."
                )

            elif day == duration_days:
                day_plan["title"] = f"Day {day}: {day_acts[0]['name']} & Memorable Farewell"
                day_plan["morning"] = (
                    f"8:00 AM • Wholesome regional breakfast (~₹{meal_bfast:,.0f}/person). Early excursion to "
                    f"{day_acts[0]['name']} ({day_acts[0]['location']}) to enjoy pristine morning vistas and capture final photographs [Entry ~₹{activity_cost:,.0f}]."
                )
                day_plan["afternoon"] = (
                    f"12:30 PM • Farewell regional lunch followed by last-minute handicraft, tea, and souvenir shopping at {day_acts[1]['name']}."
                )
                day_plan["evening"] = (
                    f"4:30 PM • Final scenic viewpoint stop at {day_acts[2]['name']}, followed by hotel check-out and onward departure transfer [Transit ~₹{transit_cost:,.0f}]."
                )

            else:
                day_plan["title"] = f"Day {day}: {day_acts[0]['name']} & {day_acts[1]['name']} Expedition"
                day_plan["morning"] = (
                    f"7:45 AM • Early morning exploration of {day_acts[0]['name']} ({day_acts[0]['location']}) to experience serene surroundings before peak hours. "
                    f"Continue along the heritage corridor to {day_acts[1]['name']} [Est. pass ~₹{activity_cost:,.0f}/person]."
                )
                day_plan["afternoon"] = (
                    f"1:15 PM • Authentic local specialty lunch (~₹{meal_cost:,.0f}/person). Afternoon immersion at {day_acts[2]['name']} ({day_acts[2]['location']}), "
                    + (f"followed by {day_acts[3]['name']} for artisan crafts." if len(day_acts) > 3 else "exploring cultural artifacts.")
                )
                day_plan["evening"] = (
                    f"5:15 PM • Golden hour sunset vantage point at {day_acts[-1]['name']} ({day_acts[-1]['location']}), "
                    f"followed by night market food tasting and traditional dinner (~₹{meal_cost:,.0f}/person)."
                )

            itinerary.append(day_plan)

        return itinerary

    # ==================================================
    # Gemini Response Parser
    # ==================================================

    def parse_gemini_response(self, response_text: str) -> dict[str, Any]:

        parsed = self._safe_json_parse(response_text)

        if parsed:
            return parsed

        return {"raw_response": response_text}

    # ==================================================
    # Offline Fallback Generator
    # ==================================================

    def generate_offline_trip_plan(
        self,
        destination: str,
        duration_days: int,
        budget: float,
        interests: list[str],
        travelers_count: int = 1,
        travel_style: str | None = None,
        transportation_mode: str | None = None,
        preferred_accommodation: str | None = None,
        origin: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        destinations: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Full-fidelity structured fallback plan when external AI services are unavailable.
        Uses deterministic local domain datasets, weather heuristics, and financial pacing.
        """
        response = self.build_complete_response(
            destination=destination,
            duration_days=duration_days,
            budget=budget,
            travelers_count=travelers_count,
            interests=interests,
            travel_style=travel_style,
            transportation_mode=transportation_mode,
            preferred_accommodation=preferred_accommodation,
            origin=origin,
            destinations=destinations,
        )
        response["generation_mode"] = "curated_offline"
        response["origin"] = origin
        return response

    # ==================================================
    # Validation Methods
    # ==================================================

    def validate_trip_input(
        self, destination: str, duration_days: int, budget: float
    ) -> None:

        if not destination:
            raise ValueError("Destination is required.")

        if duration_days <= 0:
            raise ValueError("Duration must be greater than zero.")

        if budget <= 0:
            raise ValueError("Budget must be greater than zero.")

    # ==================================================
    # Retry Logic
    # ==================================================

    def execute_with_retry(self, function, *args, **kwargs):

        last_error = None

        for _ in range(self.MAX_RETRIES):
            try:
                return function(*args, **kwargs)

            except Exception as error:
                last_error = error

                time.sleep(1)

        raise RuntimeError(f"Operation failed: {last_error}")

    # ==================================================
    # JSON Formatter
    # ==================================================

    def format_trip_response(self, data: dict[str, Any]) -> dict[str, Any]:

        return {key: value for key, value in data.items() if value is not None}

    # ==================================================
    # Final AI Response Builder
    # ==================================================

    def build_complete_response(
        self,
        destination: str,
        duration_days: int,
        budget: float,
        travelers_count: int,
        interests: list[str],
        travel_style: str | None = None,
        transportation_mode: str | None = None,
        preferred_accommodation: str | None = None,
        origin: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        destinations: list[str] | None = None,
    ) -> dict[str, Any]:

        weather = self.get_weather_context(destination)

        recommendation_context = self.get_recommendation_context(
            destination, interests, budget
        )

        attractions = self.generate_attractions(destination, interests)

        activities = self.generate_activities(interests)

        hotels = self.generate_hotels(destination, budget, duration_days)

        restaurants = self.generate_restaurants(
            destination, budget, duration_days, travelers_count
        )

        cuisines = self.generate_local_cuisines(destination)

        beverages = self.generate_beverages(destination)

        packing = self.generate_packing_checklist(destination)

        tips = self.generate_travel_tips(destination)

        cost_data = self.estimate_trip_cost(
            budget=budget,
            duration_days=duration_days,
            travelers_count=travelers_count,
            travel_style=travel_style,
            transportation_mode=transportation_mode,
            preferred_accommodation=preferred_accommodation,
            destination=destination,
        )

        sustainability_score = self.calculate_sustainability_score(
            interests, transportation_mode
        )

        carbon_footprint = self.estimate_carbon_footprint(
            duration_days, transportation_mode
        )

        eco_recommendations = self.generate_eco_recommendations()

        itinerary = self.generate_day_wise_itinerary(
            destination, duration_days, interests, budget, travelers_count, destinations
        )

        destination_profile = recommendation_context.get("destination_profile")

        confidence = self.calculate_ai_confidence(
            weather_available=True,
            recommendations_count=len(
                recommendation_context.get("recommendations", [])
            ),
            destination_profile_found=destination_profile is not None,
        )

        return {
            "destination": destination,
            "origin": origin,
            "trip_title": f"{destination} Travel Experience",
            "destination_summary": self.generate_destination_summary(destination),
            "weather_summary": weather,
            "attractions": attractions,
            "activities": activities,
            "recommended_hotels": hotels,
            "recommended_restaurants": restaurants,
            "local_cuisines": cuisines,
            "beverages_to_try": beverages,
            "packing_checklist": packing,
            "travel_tips": tips,
            "ai_itinerary": itinerary,
            "sustainability_score": sustainability_score,
            "carbon_footprint_estimate": carbon_footprint,
            "eco_friendly_recommendations": eco_recommendations,
            "ai_confidence_score": confidence,
            **cost_data,
        }

    # ==================================================
    # Master Trip Plan Generator
    # ==================================================

    def generate_trip_plan(
        self,
        destination: str,
        duration_days: int,
        budget: float,
        interests: list[str],
        travelers_count: int = 1,
        travel_style: str | None = None,
        transportation_mode: str | None = None,
        preferred_accommodation: str | None = None,
        origin: str | None = None,
        from_date: str | None = None,
        to_date: str | None = None,
        destinations: list[str] | None = None,
    ) -> dict[str, Any]:

        self.validate_trip_input(destination, duration_days, budget)

        # Normalize and expand destination aliases (e.g., "abc trekking" -> "Annapurna Base Camp, Nepal")
        dest_raw = destination.strip()
        dest_lower = dest_raw.lower()
        if dest_lower in EXPANDED_TRAVEL_DESTINATIONS:
            destination = EXPANDED_TRAVEL_DESTINATIONS[dest_lower]
        elif any(k in dest_lower for k in ["abc trek", "abc trekking", "annapoorna base camp", "annapurna base camp"]):
            destination = "Annapurna Base Camp, Nepal"
        elif dest_lower == "abc":
            destination = "Annapurna Base Camp, Nepal"

        cost_data = self.estimate_trip_cost(
            budget=budget,
            duration_days=duration_days,
            travelers_count=travelers_count,
            travel_style=travel_style,
            transportation_mode=transportation_mode,
            preferred_accommodation=preferred_accommodation,
            destination=destination,
        )

        try:
            prompt = self._build_master_prompt(
                destination=destination,
                origin=origin,
                duration_days=duration_days,
                budget=budget,
                interests=interests,
                travelers_count=travelers_count,
                travel_style=travel_style,
                transportation_mode=transportation_mode,
                preferred_accommodation=preferred_accommodation,
                cost_data=cost_data,
                from_date=from_date,
                to_date=to_date,
                destinations=destinations,
            )

            ai_response = self._generate_content(prompt)

            parsed_ai_response = self.parse_gemini_response(ai_response)

            base_response = self.build_complete_response(
                destination=destination,
                origin=origin,
                duration_days=duration_days,
                budget=budget,
                travelers_count=travelers_count,
                interests=interests,
                travel_style=travel_style,
                transportation_mode=transportation_mode,
                preferred_accommodation=preferred_accommodation,
                destinations=destinations,
            )

            if parsed_ai_response and isinstance(parsed_ai_response, dict):
                # Ensure the synthesized itinerary directly overrides the fallback template
                raw_itinerary = parsed_ai_response.get("ai_itinerary")
                if raw_itinerary and isinstance(raw_itinerary, list) and len(raw_itinerary) > 0:
                    base_response["ai_itinerary"] = raw_itinerary
                    base_response["itinerary"] = raw_itinerary

                # Override title & summary with AI curated version if present
                if parsed_ai_response.get("trip_title"):
                    base_response["trip_title"] = str(parsed_ai_response["trip_title"])
                if parsed_ai_response.get("destination_summary"):
                    base_response["destination_summary"] = str(parsed_ai_response["destination_summary"])

                # Override hotels, restaurants, attractions if provided by Gemini
                for list_field in [
                    "recommended_hotels",
                    "recommended_restaurants",
                    "attractions",
                    "activities",
                    "local_cuisines",
                    "beverages_to_try",
                    "packing_checklist",
                    "travel_tips",
                    "eco_friendly_recommendations",
                ]:
                    val = parsed_ai_response.get(list_field)
                    if val and isinstance(val, list) and len(val) > 0:
                        base_response[list_field] = [str(item) for item in val if item]

                base_response["gemini_response"] = parsed_ai_response
                base_response["generation_mode"] = "ai_synthesized"

            return self.format_trip_response(base_response)

        except Exception as error:
            logger.warning("AI Trip Generation using deterministic fallback: %s", str(error))

            fallback = self.generate_offline_trip_plan(
                destination=destination,
                origin=origin,
                duration_days=duration_days,
                budget=budget,
                interests=interests,
                travelers_count=travelers_count,
                travel_style=travel_style,
                transportation_mode=transportation_mode,
                preferred_accommodation=preferred_accommodation,
                destinations=destinations,
            )

            fallback["error"] = None
            fallback["generation_mode"] = "offline"
            fallback["origin"] = origin
            return fallback

    def generate_chat_response(
        self,
        user_message: str,
        history: Optional[list] = None,
        user_name: Optional[str] = None,
    ) -> dict:
        """
        Generate warm, deeply analyzed, structured travel advice as Trip Geni AI (RAG Mode).
        Always grounds recommendations in verified tourism intelligence, greets warmly with
        'Namaskaram *username*!', covers worldwide destinations, structures replies cleanly,
        and asks exactly one focused question.
        """
        tourism_rag = get_tourism_rag_service()
        msg_clean = user_message.strip()
        msg_lower = msg_clean.lower()
        display_name = (user_name or "").strip()
        greeting_prefix = (
            f"Namaskaram {display_name}! 🙏" if display_name else "Namaskaram! 🙏"
        )
        already_greeted = any(
            isinstance(m, dict) and "namaskaram" in m.get("content", "").lower()
            for m in (history or [])
        )

        # 1. Pure greeting check: instant return, 0 lag
        greeting_words = {
            "hai",
            "hi",
            "hello",
            "hey",
            "namaskaram",
            "namaste",
            "vanakkam",
            "halo",
        }
        tokens = set(re.findall(r"\b\w+\b", msg_lower))
        if tokens.issubset(greeting_words) or msg_lower in [
            "hi",
            "hai",
            "hello",
            "hey",
            "namaskaram",
            "namaste",
            "vanakkam",
            "good morning",
            "good evening",
        ]:
            return tourism_rag.generate_grounded_response(
                user_message, history, user_name=user_name
            )

        # 2. Retrieve verified RAG facts from local knowledge base
        rag_context = tourism_rag.retrieve_context_for_query(
            user_message, history
        )

        # 3. Format history for context
        history_formatted = ""
        if history and isinstance(history, list):
            recent_turns = history[-5:]
            history_lines = []
            for item in recent_turns:
                r = item.get("role", "user")
                c = item.get("content", "")
                speaker = "Traveler" if r == "user" else "Trip Geni AI"
                history_lines.append(f"{speaker}: {c}")
            if history_lines:
                history_formatted = (
                    "Recent Conversation Context:\n"
                    + "\n".join(history_lines)
                    + "\n\n"
                )

        prompt = f"""You are TRIPZY (also warmly known as BUJJI), the clever, energetic, world-wise, and extraordinarily knowledgeable robot travel companion and mascot on Trip Geni (inspired by interactive virtual companions like ROG Omni, making travelers feel accompanied, understood, and confident).
You possess deep, authentic intelligence about travel across India (from the ancient ghats of Varanasi, tea hills of Munnar, serene waters of Varkala and Thenkasi, to Himachal, Rajasthan, Karnataka, and Goa) and worldwide (Paris, Tokyo, Bali, Swiss Alps, New York, and beyond).

================================================================================
MASTER SYSTEM PROMPT & REQUIREMENTS ANALYSIS WORKFLOW
================================================================================
You are an intelligent, requirement-aware AI assistant designed to understand travelers' objectives, analyse their needs, identify constraints, and provide practical, personalized solutions.

Your primary responsibility is not merely to answer the literal wording of a question. You must understand the outcome the traveler is trying to achieve and provide the most suitable assistance based on the information available.

1. UNDERSTAND THE TRAVELER'S INTENT & GOAL:
   - Identify what the traveler wants to accomplish: Are they exploring a destination, planning a full itinerary, seeking budget advice, comparing places, asking about local food/weather/stays, or modifying an existing plan?
   - Distinguish between the stated request and the underlying need (e.g., "I need a break" -> peaceful nature escape, romantic retreat, spiritual recharge, or adventure).
   - Use the current conversation and history to avoid asking for information that has already been provided. Never repeat questions that have already been answered.

2. TARGETED CLARIFICATION (DO NOT OVERWHELM WITH QUESTIONNAIRES):
   - Determine whether the request is sufficiently clear to answer. If the available information is adequate, proceed directly!
   - If an important ambiguity could materially change the recommendation (e.g., traveler mentions only a destination like "Varanasi" or "Munnar" without duration or group type):
     * Enthusiastically acknowledge and praise the destination with authentic local flavor (1-2 vivid sentences).
     * Ask ONE concise, targeted clarification question focused on the key missing constraints (e.g., duration and group dynamics: "To help me shape the right pace and route for you: how many days do you have in mind, and are you traveling solo, as a couple, or with family/friends?").
     * NEVER barrage the traveler with a long questionnaire or ask 4-5 questions at once. Ask additional questions only when necessary.
     * If the traveler says "you decide" or provides minimal details, make reasonable choices, explain the assumption, and proceed.

3. REASONABLE ASSUMPTIONS & REQUIREMENT PROFILE:
   - Distinguish between confirmed requirements, inferred needs, and reasonable assumptions.
   - Never present an assumption as a confirmed requirement. When an assumption is helpful (e.g. assuming standard comfortable heritage stays and local dining if budget tier wasn't specified), state it transparently: "I've structured this around comfortable heritage stays (~₹2,500–₹4,000/night)..."
   - Keep the requirement profile updated across conversation turns without losing context.

4. TAILORED RECOMMENDATIONS & STRUCTURED PLANS:
   When enough information is gathered (or when destination + duration/travelers are given):
   - Acknowledge the goal and summarize key confirmed requirements briefly.
   - Recommend the best-fitting journey with clear reasoning explaining WHY each stop or stay fits their needs and pace.
   - Structure full itineraries cleanly and readably:
     * 🎯 **Requirement Profile / Trip Focus**: (e.g., "4-Day Scenic Hill Escape • Couple's Journey • Heritage Comfort")
     * 🗓️ **Curated Day-by-Day Journey**: (Day 1, Day 2, etc. with realistic pacing for morning, afternoon, evening)
     * 🏨 **Verified Recommended Stays**: with authentic names and realistic nightly rates in Indian Rupees (₹)
     * 🍲 **Iconic Dining & Food Spots**: exact local spots and signature dishes
     * 💰 **Estimated Budget Breakdown (in ₹)**: transparent itemized costs (accommodation, local transit, meals, activities)
     * 💡 **Tripzy's Insider Secret**: crowd-beating timings, hidden gems, or local etiquette
     * ❓ **Validation & Practical Next Step**: Provide an actionable next step and check: "Does this pace and budget match what you had in mind, or should we adjust any of the days or hotel styles?"

5. SPECIFIC QUESTIONS (Food, Weather, Stays, Transit, Costs):
   - Answer directly, thoroughly, and conversationally with exact facts, verified places, and prices in Indian Rupees (₹). Keep simple requests concise, and complex requests structured.

6. COMMUNICATION RULES & PERSONA:
   - Friendly, warm, charismatic, and analytical.
   - If the traveler has ALREADY been greeted in the conversation, NEVER repeat greetings. Talk naturally and directly like a close friend.
   - If this is the very first turn and traveler says hi/hello, greet warmly with "{greeting_prefix}".
   - Always quote all prices, tickets, stays, and budgets in Indian Rupees (₹).
   - Never invent false bookings or claim actions were performed when they were not.

7. STRICT CONCISENESS & DIRECT ACTION (NO PARAGRAPH ESSAYS):
   - Keep replies SHORT, PITHY, and goal-oriented (1 to 2 short paragraphs max, or crisp bullet points).
   - NEVER generate repetitive boilerplate, long rambling lectures, or unwanted text walls.
   - Understand the user's intent immediately. As soon as a destination or duration is known, summarize key requirements in 1-2 sentences and guide the traveler straight to final itinerary generation in the Planner!

{history_formatted}Traveler: "{user_message}"

{rag_context}"""

        # 4. Priority 1: High-Intelligence OpenAI Chat Completion
        openai_client = self._get_openai_client()
        if openai_client:
            models_to_try = [
                getattr(settings, "CHATBOT_MODEL", None) or getattr(settings, "OPENAI_MODEL", "gpt-4o"),
                "gpt-4o",
                "gpt-4o-mini",
            ]
            seen_models = set()
            for o_model in [m for m in models_to_try if m and not (m in seen_models or seen_models.add(m))]:
                try:
                    chat_messages = [{"role": "system", "content": prompt}]
                    if history and isinstance(history, list):
                        for turn in history[-6:]:
                            r = "user" if turn.get("role") == "user" else "assistant"
                            c = str(turn.get("content", "")).strip()
                            if c:
                                chat_messages.append({"role": r, "content": c})
                    chat_messages.append({"role": "user", "content": user_message})

                    response = openai_client.chat.completions.create(
                        model=o_model,
                        messages=chat_messages,
                        temperature=0.72,
                        max_tokens=1500,
                    )
                    if response and response.choices and response.choices[0].message.content:
                        reply_text = response.choices[0].message.content.strip()
                        if not already_greeted and not reply_text.startswith("Hey") and not reply_text.startswith("Namaskaram"):
                            reply_text = f"{greeting_prefix}\n\n{reply_text}"
                        return {"reply": reply_text, "source": f"openai_{o_model}"}
                except Exception as err:
                    logger.warning("OpenAI chat generation attempt with %s failed: %s", o_model, err)
                    continue

        # 5. Priority 2: Gemini Generation Fallback (if Gemini client is configured)
        if self.client:
            for model in self.fallback_models:
                try:
                    config = {"max_output_tokens": 5000, "temperature": 0.75}
                    response = self.client.models.generate_content(
                        model=model, contents=prompt, config=config
                    )
                    if response and response.text:
                        reply_text = response.text.strip()
                        if not already_greeted and not reply_text.startswith("Hey") and not reply_text.startswith("Namaskaram"):
                            reply_text = f"{greeting_prefix}\n\n{reply_text}"
                        return {"reply": reply_text, "source": "gemini_2_engine"}
                except Exception as err:
                    logger.warning(
                        "Gemini generation attempt with %s failed: %s", model, err
                    )
                    continue

        # 6. Priority 3: High-Precision Offline Travel RAG Engine Fallback
        return tourism_rag.generate_grounded_response(
            user_message, history, user_name=user_name
        )


# ==================================================
# Singleton Instance
# ==================================================

_ai_service_instance = None


def get_ai_service() -> AIService:

    global _ai_service_instance

    if _ai_service_instance is None:
        _ai_service_instance = AIService()

    return _ai_service_instance
