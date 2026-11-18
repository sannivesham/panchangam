"""
Automated Verification Suite: API Endpoints Integration Tests
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Swiss Ephemeris" in data["engine"]


def test_daily_panchangam_endpoint():
    response = client.get("/api/panchangam/daily?city_id=hyderabad&date=2026-11-18")
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "panchangam" in data
    assert "muhurtham" in data
    assert data["metadata"]["location_name"] == "Hyderabad"
    assert data["panchangam"]["tithi"]["primary"]["name_telugu"] == "శుక్ల నవమి"


def test_monthly_panchangam_endpoint():
    response = client.get("/api/panchangam/monthly?year=2026&month=11&city_id=hyderabad")
    assert response.status_code == 200
    data = response.json()
    assert data["year"] == 2026
    assert data["month"] == 11
    assert data["total_days"] == 30
    assert len(data["days"]) == 30


def test_yearly_overview_endpoint():
    response = client.get("/api/panchangam/yearly?year=2026&city_id=hyderabad")
    assert response.status_code == 200
    data = response.json()
    assert len(data["months"]) == 12


def test_transitions_endpoint():
    response = client.get("/api/panchangam/transitions?date=2026-11-18&city_id=hyderabad")
    assert response.status_code == 200
    data = response.json()
    assert "tithi" in data
    assert "nakshatra" in data


def test_sunrise_sunset_endpoint():
    response = client.get("/api/panchangam/sunrise-sunset?date=2026-11-18&city_id=hyderabad")
    assert response.status_code == 200
    data = response.json()
    assert "sun" in data
    assert "sunrise_telugu" in data["sun"]
    assert "moon" in data


def test_muhurtham_endpoint():
    response = client.get("/api/panchangam/muhurtham?date=2026-11-18&city_id=hyderabad")
    assert response.status_code == 200
    data = response.json()
    assert "rahu_kalam" in data["muhurtham"]
    assert "brahma_muhurtham" in data["muhurtham"]


def test_locations_search_endpoint():
    response = client.get("/api/locations/search?q=hyderabad")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1
    assert data["locations"][0]["name"] == "Hyderabad"


def test_festivals_endpoint():
    response = client.get("/api/festivals?year=2024&month=4")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 1
