import pytest
from app.services.pdf_service import (
    get_pdf_generator,
    compute_pdf_filename,
    sanitize_pdf_text,
)

def test_compute_pdf_filename():
    assert compute_pdf_filename("Deva", "Munnar") == "deva_munnar.pdf"
    assert compute_pdf_filename("Alice Explorer", "Goa Beach") == "alic_goabeach.pdf"
    assert compute_pdf_filename(None, "Varkala") == "trip_varkala.pdf"

def test_sanitize_pdf_text_emojis_and_stars():
    raw = "Hotel Grand (★ 4.8 Google) 🏖️ Beachfront resort! 🌟"
    sanitized = sanitize_pdf_text(raw)
    assert "★" not in sanitized
    assert "⭐" not in sanitized
    assert "🏖" not in sanitized
    assert "Rating: 4.8/5" in sanitized

def test_build_pdf_bytes():
    gen = get_pdf_generator()
    payload = {
        "trip_title": "Varkala Beach Vacation",
        "destination": "Varkala",
        "duration_days": 2,
        "budget": 8000,
        "travelers_count": 2,
        "travel_style": "Leisure",
        "interests": ["Beach", "Cliff"],
        "ai_itinerary": [
            {
                "day": 1,
                "title": "Cliff & Beach",
                "morning": "Walk on North Cliff",
                "afternoon": "Papanasam beach holy dip",
                "evening": "Sunset seafood dinner",
                "activities": ["Walking", "Sightseeing"],
            }
        ],
        "recommended_hotels": ["Varkala Cliff Resort (★ 4.5, ~₹2,500/night)"],
        "recommended_restaurants": ["Abba Restaurant (★ 4.4, ~₹300/person)"],
        "attractions": ["Varkala Cliff", "Papanasam Beach"],
    }
    pdf_bytes = gen.build_pdf(payload)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")
