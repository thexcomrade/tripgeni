# TripGeni API Interaction & Generation Flow

## 1. AI Itinerary Generation Endpoint

- **Endpoint**: `POST /api/trip/generate-ai-itinerary`
- **Request Model**: `AITripGenerationRequest`
- **Response Model**: `AITripGenerationResponse`

### Request Payload Example:
```json
{
  "destination": "Goa",
  "origin": "Kollam",
  "from_date": "2026-11-10",
  "to_date": "2026-11-15",
  "duration_days": 6,
  "budget": 25000,
  "travelers_count": 2,
  "travel_style": "Leisure",
  "transportation_mode": "Train",
  "preferred_accommodation": "Resort",
  "interests": ["Scenic Landscapes & Horizons", "Local Food Tasting & Street Cuisines"]
}
```

### Generation Pipeline:
1. **Validation & Normalization**:
   - Pydantic validates destination length, positive budget, and dates.
   - Departure and arrival stations are mapped via `verified_travel_data.py`.
2. **Transit & Pacing Evaluation**:
   - Timetable lookup estimates transit duration (e.g., Kollam to Madgaon ~18h).
   - Allocates Day 1 for outbound transit and Day 6 for return journey.
   - Paces Day 2 through Day 5 as on-ground exploration days.
3. **Budget Breakdown**:
   - Baseline stay & food costs calculated per night/day.
   - Dynamic vehicle / transit tickets (~₹3,200 for 3-Tier AC) isolated from daily discretionary budget.
4. **Gemini LLM Prompting**:
   - Strict expense formatting (`[Est. cost in brackets]` or `[Free entry]`).
   - Authentic Google star ratings for real local restaurants and stays.
5. **Fallback Safety**:
   - If Gemini API quota or network error occurs, fallback immediately engages verified offline generator with 100% realistic dataset entries.
