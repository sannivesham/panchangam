"""
Automated Verification Suite: Precision Ephemeris & Ayanamsa
"""

import pytest
from app.astronomical_engine.swe_wrapper import SwissEphemeris
from app.astronomical_engine.ephemeris import (
    get_sun_sidereal_longitude,
    get_moon_sidereal_longitude,
    get_lunar_elongation,
    get_yoga_angle,
    get_ayanamsa,
    get_rashi_from_longitude,
    get_nakshatra_pada_from_longitude,
)


def test_ephemeris_initialization():
    swe = SwissEphemeris.get_instance()
    ver = swe.version()
    assert "2.10" in ver or "2." in ver
    assert len(ver) > 0


def test_lahiri_ayanamsa():
    swe = SwissEphemeris.get_instance()
    # JD for J2000.0 (2000-01-01 12:00 UT) = 2451545.0
    jd_2000 = 2451545.0
    ayan_2000 = get_ayanamsa(jd_2000)
    # Certified Lahiri ayanamsa at J2000.0 is ~23.858 degrees (23 deg 51 min)
    assert 23.85 <= ayan_2000 <= 23.87, f"Ayanamsa at J2000.0 was {ayan_2000}"

    # For 2026, ayanamsa should be around 24.23 degrees
    jd_2026 = swe.julday(2026, 1, 1, 0.0)
    ayan_2026 = get_ayanamsa(jd_2026)
    assert 24.20 <= ayan_2026 <= 24.25, f"Ayanamsa in 2026 was {ayan_2026}"


def test_sun_moon_motion_rates():
    swe = SwissEphemeris.get_instance()
    jd1 = swe.julday(2026, 11, 18, 0.0)
    jd2 = jd1 + 1.0  # 1 day later

    sun_lon1 = get_sun_sidereal_longitude(jd1)
    sun_lon2 = get_sun_sidereal_longitude(jd2)
    sun_speed = (sun_lon2 - sun_lon1) % 360.0

    moon_lon1 = get_moon_sidereal_longitude(jd1)
    moon_lon2 = get_moon_sidereal_longitude(jd2)
    moon_speed = (moon_lon2 - moon_lon1) % 360.0

    # Physical celestial limits:
    # Sun apparent motion: 0.95 to 1.03 degrees/day
    assert 0.95 <= sun_speed <= 1.03, f"Sun daily motion abnormal: {sun_speed}"
    # Moon apparent motion: 11.5 to 15.5 degrees/day
    assert 11.5 <= moon_speed <= 15.5, f"Moon daily motion abnormal: {moon_speed}"

    # Elongation rate: 10.5 to 14.5 degrees/day
    e1 = get_lunar_elongation(jd1)
    e2 = get_lunar_elongation(jd2)
    elong_rate = (e2 - e1) % 360.0
    assert 10.5 <= elong_rate <= 14.5, f"Elongation rate abnormal: {elong_rate}"


def test_rashi_and_nakshatra_pada():
    # 0 degrees = Mesha Rashi, Ashwini Nakshatra Pada 1
    r0 = get_rashi_from_longitude(0.0)
    n0 = get_nakshatra_pada_from_longitude(0.0)
    assert r0["index"] == 1
    assert r0["english"] == "Aries"
    assert n0["index"] == 1
    assert n0["english"] == "Ashwini"
    assert n0["pada"] == 1

    # 13 deg 20 min = 13.333333 degrees = Bharani Pada 1
    n1 = get_nakshatra_pada_from_longitude(13.34)
    assert n1["index"] == 2
    assert n1["english"] == "Bharani"
    assert n1["pada"] == 1
