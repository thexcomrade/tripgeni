"""
Test Suite for Trip Geni RAG & Itinerary Evaluation Metrics Engine

Validates:
1. Faithfulness & Groundedness scoring against regional RAG facts
2. Budget Adherence variance calculation
3. Pacing & Schedule Feasibility evaluation
4. Context & Interest Relevance measurement
5. Overall Trip Quality Index (TQI) and letter grade assignment
6. POST /api/trips/evaluate API endpoint
7. GET /api/trips/evaluation-benchmark benchmark suite endpoint
"""

import pytest
from app.services.evaluation_service import get_evaluation_service


def test_evaluation_service_metrics_computation():
    eval_svc = get_evaluation_service()

    mock_plan = {
        "destination": "Munnar",
        "duration_days": 3,
        "budget": 20000,
        "estimated_trip_cost": 19500,
        "sustainability_score": 92,
        "interests": ["nature", "tea plantations", "photography"],
        "recommended_hotels": ["Fragrant Nature Munnar", "The Leaf Munnar Resort"],
        "recommended_restaurants": ["Rapsy Restaurant", "Saravana Bhavan"],
        "ai_itinerary": [
            {
                "day_number": 1,
                "theme": "Tea Trails",
                "morning": {"activity": "Tea Museum Tour", "location": "KDHP"},
                "afternoon": {"activity": "Attukad Waterfall Trek", "location": "Attukad"},
                "evening": {"activity": "Sunset view at Pothamedu", "location": "Pothamedu"},
                "lunch_recommendation": "Traditional Kerala thali",
                "estimated_daily_cost": 4500,
            },
            {
                "day_number": 2,
                "theme": "Wildlife and Peaks",
                "morning": {"activity": "Eravikulam National Park Safari", "location": "Rajamalai"},
                "afternoon": {"activity": "Mattupetty Dam boating", "location": "Mattupetty"},
                "evening": {"activity": "Echo Point stroll", "location": "Echo Point"},
                "lunch_recommendation": "Local café",
                "estimated_daily_cost": 5000,
            },
            {
                "day_number": 3,
                "theme": "Cultural Stroll",
                "morning": {"activity": "Kundala Lake visit", "location": "Kundala"},
                "afternoon": {"activity": "Spice market walk", "location": "Munnar Town"},
                "evening": {"activity": "Departure relaxation", "location": "Town"},
                "lunch_recommendation": "Saravana Bhavan dosas",
                "estimated_daily_cost": 4000,
            },
        ],
    }

    result = eval_svc.evaluate_itinerary(
        mock_plan,
        user_constraints={"budget": 20000, "interests": ["nature", "tea", "photography"]},
    )

    assert result.composite_score >= 80.0
    assert result.grade in ["A+", "A", "B+"]
    assert 0.0 <= result.faithfulness_score <= 1.0
    assert 0.0 <= result.budget_adherence_score <= 1.0
    assert 0.0 <= result.pacing_feasibility_score <= 1.0
    assert 0.0 <= result.context_relevance_score <= 1.0
    assert len(result.metrics) == 5
    assert len(result.strengths) >= 1
    assert len(result.optimization_suggestions) >= 1


def test_budget_adherence_variance():
    eval_svc = get_evaluation_service()

    # Optimal budget (within 5%)
    score_optimal = eval_svc._calculate_budget_adherence(budget=10000, estimated_cost=9800)
    assert score_optimal == 1.0

    # Over budget by 50%
    score_over = eval_svc._calculate_budget_adherence(budget=10000, estimated_cost=15000)
    assert score_over < score_optimal
    assert score_over <= 0.60


def test_pacing_feasibility_evaluation():
    eval_svc = get_evaluation_service()

    # Complete 3 slots/day
    balanced_days = [
        {"morning": {"activity": "A"}, "afternoon": {"activity": "B"}, "evening": {"activity": "C"}},
        {"morning": {"activity": "D"}, "afternoon": {"activity": "E"}, "evening": {"activity": "F"}},
    ]
    score_balanced = eval_svc._calculate_pacing_feasibility(balanced_days, duration=2)

    # Empty/sparse days
    sparse_days = [{"morning": {"activity": "A"}}]
    score_sparse = eval_svc._calculate_pacing_feasibility(sparse_days, duration=2)

    assert score_balanced > score_sparse


def test_evaluation_api_endpoints(client):
    # Test POST /api/trips/evaluate
    payload = {
        "itinerary_data": {
            "destination": "Varkala",
            "duration_days": 2,
            "budget": 15000,
            "estimated_trip_cost": 14200,
            "sustainability_score": 88,
            "interests": ["beach", "yoga", "seafood"],
            "ai_itinerary": [
                {"day_number": 1, "morning": {"activity": "Cliff walk"}, "afternoon": {"activity": "Beach swim"}, "evening": {"activity": "Sunset café"}},
                {"day_number": 2, "morning": {"activity": "Yoga session"}, "afternoon": {"activity": "Janardhana temple"}, "evening": {"activity": "Seafood dinner"}},
            ],
        },
        "user_constraints": {"budget": 15000, "interests": ["beach", "yoga"]},
    }
    response = client.post("/api/trips/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "composite_score" in data
    assert "grade" in data
    assert "faithfulness_score" in data
    assert "budget_adherence_score" in data
    assert "metrics" in data
    assert len(data["metrics"]) == 5

    # Test GET /api/trips/evaluation-benchmark
    bench_resp = client.get("/api/trips/evaluation-benchmark")
    assert bench_resp.status_code == 200
    bench_data = bench_resp.json()
    assert bench_data["status"] == "success"
    assert "macro_metrics" in bench_data
    assert "mean_trip_quality_index" in bench_data["macro_metrics"]
    assert bench_data["benchmark_cases_evaluated"] >= 4
