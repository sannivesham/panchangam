"""
Automated Verification Suite: Sunrise & Sunset Calculations
"""

import pytest
from datetime import date
from zoneinfo import ZoneInfo
from app.astronomical_engine.sun_moon_rise import calculate_sun_times, calculate_moon_times


def test_hyderabad_sunrise_sunset():
    # Hyderabad: 17.3850 N, 78.4867 E, elevation 505m
    tz = ZoneInfo("Asia/Kolkata")
    d = date(2026, 11, 18)
    res = calculate_sun_times(d, 17.3850, 78.4867, 505.0, tz)

    assert res["dt_sunrise"] is not None
    assert res["dt_sunset"] is not None

    # Hyderabad sunrise in mid-November is nominally around 06:20 - 06:25 AM
    sr = res["dt_sunrise"]
    assert sr.hour == 6
    assert 15 <= sr.minute <= 30

    # Sunset is nominally around 17:35 - 17:45 PM
    ss = res["dt_sunset"]
    assert ss.hour == 17
    assert 30 <= ss.minute <= 50

    # Dinamana + Ratrimana must approximate 24 hours (86400 seconds) within solar drift
    total_sec = res["dinamana_seconds"] + res["ratrimana_seconds"]
    assert abs(total_sec - 86400.0) < 60.0  # within 1 minute of 24h


def test_location_latitude_difference():
    # Test that sunrise is earlier in eastern city (Visakhapatnam, 83.2°E) than western (Hyderabad, 78.5°E)
    tz = ZoneInfo("Asia/Kolkata")
    d = date(2026, 11, 18)

    hyd = calculate_sun_times(d, 17.3850, 78.4867, 505.0, tz)
    vizag = calculate_sun_times(d, 17.6868, 83.2185, 45.0, tz)

    # Visakhapatnam is ~4.7 degrees east of Hyderabad (~18-19 minutes earlier sunrise)
    time_diff_min = (hyd["dt_sunrise"] - vizag["dt_sunrise"]).total_seconds() / 60.0
    assert 15.0 <= time_diff_min <= 22.0, f"Expected 15-22 min difference, got {time_diff_min}"
