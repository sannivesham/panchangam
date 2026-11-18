"""
Automated Verification Suite: Numerical Root Finding & Boundary Crossings
"""

import pytest
from app.astronomical_engine.swe_wrapper import SwissEphemeris
from app.astronomical_engine.ephemeris import (
    get_lunar_elongation,
    get_moon_sidereal_longitude,
)
from app.astronomical_engine.root_finder import (
    find_transition_in_bracket,
    angle_diff,
)


def test_root_finder_precision():
    swe = SwissEphemeris.get_instance()
    jd_base = swe.julday(2026, 11, 18, 0.0)

    # Find the next 12-degree tithi boundary
    curr_elong = get_lunar_elongation(jd_base)
    next_tithi_idx = int(curr_elong // 12.0) + 1
    target_boundary = (next_tithi_idx * 12.0) % 360.0

    t_root = find_transition_in_bracket(
        get_lunar_elongation,
        target_boundary,
        jd_base,
        jd_base + 2.0,
    )

    # Evaluate elongation at computed root
    elong_at_root = get_lunar_elongation(t_root)
    diff = abs(angle_diff(elong_at_root, target_boundary))

    # Error must be sub-arcsecond (< 0.0001 degrees)
    assert diff < 1e-4, f"Root finding error too high: {diff} degrees"


def test_nakshatra_boundary_crossing():
    swe = SwissEphemeris.get_instance()
    jd_base = swe.julday(2026, 11, 18, 0.0)

    moon_lon = get_moon_sidereal_longitude(jd_base)
    nak_span = 360.0 / 27.0
    next_nak_idx = int(moon_lon // nak_span) + 1
    target_boundary = (next_nak_idx * nak_span) % 360.0

    t_root = find_transition_in_bracket(
        get_moon_sidereal_longitude,
        target_boundary,
        jd_base,
        jd_base + 2.0,
    )

    lon_at_root = get_moon_sidereal_longitude(t_root)
    diff = abs(angle_diff(lon_at_root, target_boundary))
    assert diff < 1e-4, f"Nakshatra boundary error too high: {diff} degrees"
